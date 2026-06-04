<?php
/**
 * SIS Questionnaire Platform — WordPress backend
 * --------------------------------------------------------------
 * Stores questionnaire responses from the static SPA, exposes a REST
 * submission endpoint, and provides an adviser admin page with CSV export.
 *
 * Deployed into the Novamira sandbox (wp-content/novamira-sandbox/), which
 * auto-loads it on every request — no plugin activation needed.
 *
 * Data model: a single custom table {prefix}sis_responses holding the full
 * response JSON payload + indexed key columns. The CSV export reconstructs the
 * canonical 73-column schema (spec §4) from the payload on demand.
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('SIS_Platform')) {

class SIS_Platform {
    const DB_VERSION   = '1';
    const OPT_DBVER    = 'sis_db_version';
    const OPT_SUBMIT   = 'sis_submit_key';   // optional shared key to deter spam
    const REST_NS      = 'sis/v1';

    /** Questionnaire registry (mirror of src/config/questionnaires). */
    public static function questionnaires(): array {
        return [
            'pre-teens-13-17' => ['type' => 'PRE',  'age' => 'TEENS_13_17', 'sheet' => 'PRE_TEENS_13_17',  'title' => 'Pre-Test — Teens 13–17'],
            'pre-kids-9-12'   => ['type' => 'PRE',  'age' => 'KIDS_9_12',   'sheet' => 'PRE_KIDS_9_12',    'title' => 'Pre-Test — Kids 9–12'],
            'post-kids-9-12'  => ['type' => 'POST', 'age' => 'KIDS_9_12',   'sheet' => 'POST_KIDS_9_12',   'title' => 'Post-Test — Kids 9–12'],
            'post-teens-13-17'=> ['type' => 'POST', 'age' => 'TEENS_13_17', 'sheet' => 'POST_TEENS_13_17', 'title' => 'Post-Test — Teens 13–17'],
        ];
    }

    public static function table(): string {
        global $wpdb;
        return $wpdb->prefix . 'sis_responses';
    }

    public static function boot(): void {
        add_action('init', [__CLASS__, 'maybe_install']);
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
        add_action('admin_menu', [__CLASS__, 'admin_menu']);
        add_action('admin_post_sis_export', [__CLASS__, 'handle_export']);
    }

    /** Create / upgrade the responses table. */
    public static function maybe_install(): void {
        if (get_option(self::OPT_DBVER) === self::DB_VERSION) {
            return;
        }
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $table   = self::table();
        $charset = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE {$table} (
            id varchar(40) NOT NULL,
            sheet varchar(40) NOT NULL,
            student_code varchar(10) NOT NULL,
            questionnaire_type varchar(8) NOT NULL,
            age_group varchar(16) NOT NULL,
            overall_score decimal(4,2) NULL,
            report_status varchar(16) NOT NULL DEFAULT 'Generated',
            payload longtext NOT NULL,
            created_at datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY sheet (sheet),
            KEY student_code (student_code)
        ) {$charset};";
        dbDelta($sql);
        update_option(self::OPT_DBVER, self::DB_VERSION);
    }

    /** ── REST ─────────────────────────────────────────────── */
    public static function register_routes(): void {
        register_rest_route(self::REST_NS, '/responses', [
            'methods'             => 'POST',
            'callback'            => [__CLASS__, 'rest_submit'],
            'permission_callback' => '__return_true', // students are anonymous
        ]);
        register_rest_route(self::REST_NS, '/health', [
            'methods'             => 'GET',
            'callback'            => fn() => ['ok' => true, 'count' => self::count_rows()],
            'permission_callback' => '__return_true',
        ]);
        // Returns the latest stored scores for a code within a sheet (used by
        // post-tests to build a pre→post comparison). Returns scores only — no PII.
        register_rest_route(self::REST_NS, '/match', [
            'methods'             => 'GET',
            'callback'            => [__CLASS__, 'rest_match'],
            'permission_callback' => '__return_true',
        ]);
    }

    public static function rest_match(WP_REST_Request $req) {
        $sheet = sanitize_text_field((string) $req->get_param('sheet'));
        $code  = strtoupper(trim((string) $req->get_param('code')));
        if (!preg_match('/^[A-Z]{4}[0-9]{2}$/', $code) || $sheet === '') {
            return new WP_REST_Response(['matched' => false], 200);
        }
        global $wpdb;
        $table = self::table();
        $payload = $wpdb->get_var(
            $wpdb->prepare("SELECT payload FROM {$table} WHERE sheet = %s AND student_code = %s ORDER BY created_at DESC LIMIT 1", $sheet, $code)
        );
        if (!$payload) {
            return new WP_REST_Response(['matched' => false], 200);
        }
        $p = json_decode($payload, true);
        return new WP_REST_Response(['matched' => true, 'scores' => $p['scores'] ?? null], 200);
    }

    public static function rest_submit(WP_REST_Request $req) {
        $body = $req->get_json_params();
        if (!is_array($body)) {
            return new WP_REST_Response(['message' => 'Invalid request body.'], 400);
        }

        // Optional spam key.
        $expected = (string) get_option(self::OPT_SUBMIT, '');
        if ($expected !== '' && (string) ($body['submitKey'] ?? '') !== $expected) {
            return new WP_REST_Response(['message' => 'Submission not authorized.'], 403);
        }

        $qid = sanitize_text_field($body['questionnaireId'] ?? '');
        $reg = self::questionnaires();
        if (!isset($reg[$qid])) {
            return new WP_REST_Response(['message' => 'Unknown questionnaire.'], 400);
        }
        $meta = $reg[$qid];

        $code = strtoupper(trim((string) ($body['code'] ?? '')));
        if (!preg_match('/^[A-Z]{4}[0-9]{2}$/', $code)) {
            return new WP_REST_Response(['message' => 'Invalid code format.'], 422);
        }

        $answers = is_array($body['answers'] ?? null) ? $body['answers'] : [];
        $scores  = is_array($body['scores'] ?? null) ? $body['scores'] : ['byCompetency' => [], 'overall' => null];

        global $wpdb;
        $table = self::table();
        $duplicate = (int) $wpdb->get_var(
            $wpdb->prepare("SELECT COUNT(*) FROM {$table} WHERE sheet = %s AND student_code = %s", $meta['sheet'], $code)
        ) > 0;

        $id = self::uuid();
        $payload = [
            'id'                => $id,
            'timestamp'         => current_time('c'),
            'questionnaireType' => $meta['type'],
            'ageGroup'          => $meta['age'],
            'studentCode'       => $code,
            'code'              => [
                'raw'           => $code,
                'dormGroup'     => $code[0],
                'morningTrack'  => $code[1],
                'afternoonClub' => $code[2],
                'familyGroup'   => $code[3],
                'studentNumber' => substr($code, 4, 2),
            ],
            'answers'           => $answers,
            'scores'            => $scores,
            'reportStatus'      => 'Generated',
        ];

        $ok = $wpdb->insert($table, [
            'id'                 => $id,
            'sheet'              => $meta['sheet'],
            'student_code'       => $code,
            'questionnaire_type' => $meta['type'],
            'age_group'          => $meta['age'],
            'overall_score'      => is_numeric($scores['overall'] ?? null) ? $scores['overall'] : null,
            'report_status'      => 'Generated',
            'payload'            => wp_json_encode($payload),
            'created_at'         => current_time('mysql'),
        ]);

        if ($ok === false) {
            return new WP_REST_Response(['message' => 'Could not save response.'], 500);
        }

        return new WP_REST_Response(['id' => $id, 'duplicate' => $duplicate], 201);
    }

    /** ── Admin ────────────────────────────────────────────── */
    public static function admin_menu(): void {
        add_menu_page(
            'SIS Responses', 'SIS Responses', 'manage_options',
            'sis-responses', [__CLASS__, 'render_admin'], 'dashicons-clipboard', 26
        );
    }

    public static function render_admin(): void {
        global $wpdb;
        $table = self::table();
        $rows  = $wpdb->get_results("SELECT * FROM {$table} ORDER BY created_at DESC LIMIT 200", ARRAY_A);
        $count = self::count_rows();

        // Aggregate competency averages.
        $sum = []; $n = [];
        foreach ($rows as $r) {
            $p = json_decode($r['payload'], true);
            foreach (($p['scores']['byCompetency'] ?? []) as $k => $v) {
                if (is_numeric($v) && $v > 0) { $sum[$k] = ($sum[$k] ?? 0) + $v; $n[$k] = ($n[$k] ?? 0) + 1; }
            }
        }
        $export_url = wp_nonce_url(admin_url('admin-post.php?action=sis_export'), 'sis_export');

        echo '<div class="wrap"><h1>SIS Questionnaire Responses</h1>';
        echo '<p>Total responses: <strong>' . esc_html((string) $count) . '</strong> · No names or ages are stored.</p>';
        echo '<p><a class="button button-primary" href="' . esc_url($export_url) . '">⬇ Export CSV (73-column schema)</a></p>';

        if ($sum) {
            echo '<h2>Average score by competency</h2><table class="widefat striped" style="max-width:520px"><tbody>';
            foreach ($sum as $k => $s) {
                $avg = $n[$k] ? round($s / $n[$k], 2) : 0;
                echo '<tr><td>' . esc_html(ucfirst($k)) . '</td><td>' . esc_html(number_format($avg, 2)) . '</td></tr>';
            }
            echo '</tbody></table>';
        }

        echo '<h2>Recent responses</h2><table class="widefat striped"><thead><tr>';
        echo '<th>Code</th><th>Questionnaire</th><th>Overall</th><th>Status</th><th>Date</th></tr></thead><tbody>';
        if (!$rows) {
            echo '<tr><td colspan="5">No responses yet.</td></tr>';
        }
        foreach ($rows as $r) {
            echo '<tr>';
            echo '<td><strong>' . esc_html($r['student_code']) . '</strong></td>';
            echo '<td>' . esc_html($r['sheet']) . '</td>';
            echo '<td>' . esc_html($r['overall_score'] ?? '—') . '</td>';
            echo '<td>' . esc_html($r['report_status']) . '</td>';
            echo '<td>' . esc_html($r['created_at']) . '</td>';
            echo '</tr>';
        }
        echo '</tbody></table></div>';
    }

    public static function handle_export(): void {
        if (!current_user_can('manage_options') || !check_admin_referer('sis_export')) {
            wp_die('Not allowed.');
        }
        global $wpdb;
        $table = self::table();
        $rows  = $wpdb->get_results("SELECT payload FROM {$table} ORDER BY created_at DESC", ARRAY_A);

        $headers = self::column_headers();
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="sis_responses_' . gmdate('Y-m-d') . '.csv"');
        $out = fopen('php://output', 'w');
        fputcsv($out, $headers);
        foreach ($rows as $r) {
            $p = json_decode($r['payload'], true);
            fputcsv($out, self::record_to_row($p, $headers));
        }
        fclose($out);
        exit;
    }

    /** ── Schema helpers (mirror src/lib/row.ts) ───────────── */
    public static function competencies(): array {
        // [prefix, count, score_field]
        return [
            ['COM', 6, 'communication'],
            ['LEAD', 6, 'leadership'],
            ['EMO', 6, 'emotional'],
            ['CT', 6, 'thinking'],
            ['CRE', 6, 'creativity'],
            ['AUTO', 6, 'independence'],
            ['TEAM', 6, 'teamwork'],
        ];
    }

    public static function column_headers(): array {
        $cols = [
            'Timestamp','Questionnaire_Type','Age_Group','Student_Code',
            'Code_Letter_1','Code_Letter_2','Code_Letter_3','Code_Letter_4','Code_Number_1','Code_Number_2',
            'Main_Language_1','Main_Language_2','English_Level','Previous_International_Camp',
            'Previous_Stay_Away_From_Home','Confidence_Using_English',
        ];
        foreach (self::competencies() as [$prefix, $cnt]) {
            for ($i = 1; $i <= $cnt; $i++) { $cols[] = $prefix . $i; }
        }
        array_push($cols, 'TR1','TR2','TR3','TR4_Open','Reflection_Open',
            'Communication_Score','Leadership_Score','Emotional_Skills_Score','Thinking_Skills_Score',
            'Creativity_Score','Independence_Score','Teamwork_Score','Overall_Score',
            'Report_File_URL','Report_Status');
        return $cols;
    }

    public static function record_to_row(array $p, array $headers): array {
        $a = $p['answers'] ?? [];
        $code = $p['code'] ?? [];
        $scores = $p['scores']['byCompetency'] ?? [];
        $langs = (isset($a['BG1']) && is_array($a['BG1'])) ? $a['BG1'] : [];

        $map = [
            'Timestamp' => $p['timestamp'] ?? '',
            'Questionnaire_Type' => $p['questionnaireType'] ?? '',
            'Age_Group' => $p['ageGroup'] ?? '',
            'Student_Code' => $p['studentCode'] ?? '',
            'Code_Letter_1' => $code['dormGroup'] ?? '',
            'Code_Letter_2' => $code['morningTrack'] ?? '',
            'Code_Letter_3' => $code['afternoonClub'] ?? '',
            'Code_Letter_4' => $code['familyGroup'] ?? '',
            'Code_Number_1' => substr((string) ($code['studentNumber'] ?? ''), 0, 1),
            'Code_Number_2' => substr((string) ($code['studentNumber'] ?? ''), 1, 1),
            'Main_Language_1' => $langs[0] ?? ($a['Main_Language_1'] ?? ''),
            'Main_Language_2' => $langs[1] ?? ($a['Main_Language_2'] ?? ''),
            'English_Level' => $a['English_Level'] ?? '',
            'Previous_International_Camp' => $a['Previous_International_Camp'] ?? '',
            'Previous_Stay_Away_From_Home' => $a['Previous_Stay_Away_From_Home'] ?? '',
            'Confidence_Using_English' => $a['Confidence_Using_English'] ?? '',
            'TR1' => $a['TR1'] ?? '', 'TR2' => $a['TR2'] ?? '', 'TR3' => $a['TR3'] ?? '',
            'TR4_Open' => $a['TR4_Open'] ?? '', 'Reflection_Open' => $a['Reflection_Open'] ?? '',
            'Communication_Score' => $scores['communication'] ?? '',
            'Leadership_Score' => $scores['leadership'] ?? '',
            'Emotional_Skills_Score' => $scores['emotional'] ?? '',
            'Thinking_Skills_Score' => $scores['thinking'] ?? '',
            'Creativity_Score' => $scores['creativity'] ?? '',
            'Independence_Score' => $scores['independence'] ?? '',
            'Teamwork_Score' => $scores['teamwork'] ?? '',
            'Overall_Score' => $p['scores']['overall'] ?? '',
            'Report_File_URL' => $p['reportUrl'] ?? '',
            'Report_Status' => $p['reportStatus'] ?? 'Generated',
        ];
        foreach (self::competencies() as [$prefix, $cnt]) {
            for ($i = 1; $i <= $cnt; $i++) { $map[$prefix . $i] = $a[$prefix . $i] ?? ''; }
        }
        return array_map(fn($h) => (string) ($map[$h] ?? ''), $headers);
    }

    public static function count_rows(): int {
        global $wpdb;
        $table = self::table();
        return (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table}");
    }

    public static function uuid(): string {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}

SIS_Platform::boot();

}
