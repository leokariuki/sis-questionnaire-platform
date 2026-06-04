<?php
/**
 * Plugin Name: SIS Questionnaire Embed
 * Description: Embeds the SIS Questionnaire & Impact Reporting Platform (standalone Next.js app) into WordPress pages via a [sis_questionnaire] shortcode. Auto-resizing, accessible iframe.
 * Version:     1.0.0
 * Author:      BienesDar / EduPaths / LAS
 *
 * USAGE
 *   1. Deploy the Next.js app (see docs/DEPLOYMENT.md) to a public HTTPS URL.
 *   2. Set SIS_APP_URL below (or define('SIS_APP_URL', '...') in wp-config.php).
 *   3. Drop a shortcode into any page/post:
 *        [sis_questionnaire id="pre-teens-13-17"]
 *        [sis_questionnaire id="pre-teens-13-17" height="900"]
 *
 * Place this file in wp-content/mu-plugins/ (auto-loads) or activate it as a
 * normal plugin from wp-content/plugins/.
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!defined('SIS_APP_URL')) {
    // ── EDIT THIS to your deployed app origin (no trailing slash) ──
    define('SIS_APP_URL', 'https://your-sis-app.example');
}

/**
 * [sis_questionnaire id="pre-teens-13-17" height="850"]
 */
function sis_questionnaire_shortcode($atts) {
    $atts = shortcode_atts(
        array(
            'id'     => 'pre-teens-13-17',
            'height' => '850',
            'title'  => 'SIS Skills Questionnaire',
        ),
        $atts,
        'sis_questionnaire'
    );

    $slug   = sanitize_title($atts['id']);
    $height = (int) $atts['height'];
    $title  = esc_attr($atts['title']);
    $src    = esc_url(trailingslashit(SIS_APP_URL) . 'embed/' . $slug);
    $uid    = 'sis-frame-' . wp_generate_password(6, false, false);

    ob_start();
    ?>
    <div class="sis-questionnaire-embed" style="width:100%;max-width:760px;margin:0 auto;">
        <iframe
            id="<?php echo esc_attr($uid); ?>"
            src="<?php echo $src; ?>"
            title="<?php echo $title; ?>"
            loading="lazy"
            style="width:100%;height:<?php echo $height; ?>px;border:0;border-radius:24px;overflow:hidden;"
            allow="clipboard-write"
            referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
    </div>
    <script>
    // Optional: lets the app request a taller iframe via postMessage.
    (function () {
        var frame = document.getElementById('<?php echo esc_js($uid); ?>');
        window.addEventListener('message', function (e) {
            try {
                if (e.origin !== '<?php echo esc_js(rtrim(SIS_APP_URL, '/')); ?>') return;
                if (e.data && e.data.type === 'sis:height' && frame) {
                    frame.style.height = parseInt(e.data.height, 10) + 'px';
                }
            } catch (err) {}
        });
    })();
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('sis_questionnaire', 'sis_questionnaire_shortcode');
