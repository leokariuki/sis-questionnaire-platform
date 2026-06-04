# Live Deployment — bienesdar.org

The pilot (**PRE-TEST — Teens 13–17**) is deployed **entirely on WordPress**
(`bienesdar.org`, Hostinger PHP host) as a static in-browser app + a PHP REST
backend. No external Node host is used.

## Live URLs

| What | URL |
|---|---|
| Pre-Test — Teens 13–17 (pilot) | https://www.bienesdar.org/sis-questionnaire/ |
| Pre-Test — Kids 9–12 | https://www.bienesdar.org/sis-pre-kids/ |
| Post-Test — Kids 9–12 | https://www.bienesdar.org/sis-post-kids/ |
| Post-Test — Teens 13–17 | https://www.bienesdar.org/sis-post-teens/ |
| Static app (one bundle, `?q=<id>` selects the questionnaire) | https://www.bienesdar.org/wp-content/uploads/sis-app/index.html |
| REST submit endpoint | https://www.bienesdar.org/wp-json/sis/v1/responses |
| REST pre→post match | https://www.bienesdar.org/wp-json/sis/v1/match?sheet=PRE_TEENS_13_17&code=ABCD12 |
| REST health check | https://www.bienesdar.org/wp-json/sis/v1/health |
| Adviser admin (responses + CSV export) | wp-admin → **SIS Responses** |

All four questionnaires are **live** and run from a single uploaded bundle; each
WordPress page's iframe passes `?q=<questionnaire-id>`. Post-tests automatically
fetch the matching pre-test (same code) via `/match` and render a pre→post
comparison report. Unmatched post-tests still produce a current-results report.

## Illustrations

Every competency question shows a custom, on-brand SVG scene illustration
(culturally neutral, text-free, diverse figures) from
`src/components/illustrations/`. These are the default visuals and need no API.

### AI photo images (enabled)

The 7 priority **photographic** anchor images (COM1, LEAD1, EMO1, CT1, CRE1,
AUTO1, TEAM1 — teens) are generated and live. They were created **free** via the
Pollinations.ai API (no key, no cost) using a server-side endpoint and saved to
`wp-content/uploads/sis-app/images/<CODE>_teens.png`. The UI overlays the photo
on each competency scene; any item without a photo falls back to its SVG scene
(so there are never broken images).

`window.SIS_CONFIG` controls this:
- `imageBase` — folder URL for the images.
- `imageVersion` — bump this number after regenerating images to bust the CDN
  cache (the app appends `?v=<imageVersion>` to each image URL). Then run
  `do_action('litespeed_purge_all')`.

**Image source (current): Cloudflare Workers AI — FLUX-1-schnell.**
All 84 images (42 teens + 42 kids) were generated free, fast, and reliably via
Cloudflare Workers AI. Credentials live in WP options `sis_cf_token` +
`sis_cf_account` (server-side; rotate/change the token anytime in Cloudflare).

**Generating / regenerating images:**
- Batch (recommended): `GET /wp-json/sis/v1/gen?key=<submit_key>&batch=1&age=<teens|kids>&max=15&cb=<rand>`
  generates up to `max` missing images server-side via Cloudflare. Drive from
  `curl` in a short loop until `"remaining":0`. The whole 84-set takes ~2 minutes.
- Single / regenerate one: `...&code=<CODE>&age=<teens|kids>&force=1`.
- After regenerating, bump `imageVersion` in `index.html` and
  `do_action('litespeed_purge_all')`.
- The image model + prompt live in `gen_batch()` in
  `wp-content/novamira-sandbox/sis-platform.php` (professional editorial prompt).
- Free fallback (Pollinations) remains available via `&model=turbo` but is
  rate-limited per IP; Cloudflare is the reliable path.

## Architecture as deployed

```
Student → WP page /sis-questionnaire/  (iframe)
        → static SPA in /wp-content/uploads/sis-app/   (scores + report in browser)
        → POST /wp-json/sis/v1/responses               (PHP stores row)
        → on completion, printable HTML "SIS Skills Profile" (Save as PDF)
Adviser → wp-admin → SIS Responses → analytics + CSV export (73-column schema)
```

- **Backend plugin:** `wp-content/novamira-sandbox/sis-platform.php`
  (auto-loaded by the Novamira sandbox loader — no activation needed).
  Source of truth: `wordpress/sis-platform.php` in this repo.
- **Database table:** `wp_biensis_responses` (prefix `wp_biensis_`).
  Stores indexed key columns + a JSON payload; the CSV export reconstructs the
  full 73-column spec schema on demand.
- **Submit key:** stored in WP option `sis_submit_key`, baked into the app's
  `window.SIS_CONFIG.submitKey` in the deployed `index.html`. Lightweight spam
  deterrent for the public submit endpoint.

## Verified end-to-end (production)

- Static assets serve (HTTP 200, correct MIME + sizes).
- `POST /wp-json/sis/v1/responses` → `201 {id, duplicate}`.
- Row persisted; overall score 3.57; code `DLTB07` decoded to
  Dorm D · Language Acquisition · Team Sports · Family B.
- 73-column CSV reconstruction correct (COM1=5 … TEAM6=2).

> A single test response (code `DLTB07`) exists in the production table from
> verification. Remove it from **wp-admin → SIS Responses** if you want a clean
> start (or leave it as a sample).

## Updating the app later

```bash
npm run build:spa                     # outputs spa-dist/
# re-inject window.SIS_CONFIG into spa-dist/index.html (apiBase, questionnaireId, submitKey)
# upload spa-dist/index.html + spa-dist/assets/* to wp-content/uploads/sis-app/
```
Asset filenames are content-hashed, so browsers pick up new builds automatically.
If LiteSpeed Cache serves a stale page, purge the cache for `/sis-questionnaire/`.

## Enabling the other three questionnaires

The PHP backend already recognizes all four questionnaire IDs. To launch another:
1. Flip its `live` flag in `src/config/questionnaires/index.ts` and rebuild.
2. Deploy a second static bundle (or reuse one) with
   `window.SIS_CONFIG.questionnaireId` set to the new id
   (e.g. `post-teens-13-17`), and embed it on another WordPress page.
See `docs/REPLICATION.md`. Post-test PDF/report rendering still needs the
`PostReport` view wired (engine + matching logic already implemented).
