# Deployment & Setup

This app is a standalone Next.js application. The cleanest WordPress integration
(chosen for this build) is to **host the app on its own HTTPS URL and embed it**
into WordPress pages via an iframe shortcode (see `WORDPRESS.md`). This keeps full
design fidelity, isolates dependencies, and makes the app trivial to update.

---

## 1. Environment variables

Copy `.env.example` → `.env.local` (local) or set them in your host's dashboard.

| Variable | Required | Purpose |
|---|---|---|
| `ADMIN_TOKEN` | ✅ | Gate for `/admin` and admin APIs |
| `NEXT_PUBLIC_APP_URL` | ✅ (prod) | Public origin; used in report links |
| `WORDPRESS_EMBED_ORIGIN` | recommended | WP origin allowed to iframe `/embed/*` (CSP) |
| `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | optional | Persist to Supabase Postgres |
| `GOOGLE_SHEETS_ID` + `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | optional | Mirror submissions to Google Sheets |
| `IMAGE_API_PROVIDER` + `IMAGE_API_KEY` | optional | Enable AI image generation endpoint |

With only `ADMIN_TOKEN` set, the app runs on the local file store — perfect for a
pilot. Add Supabase when you need durable, multi-instance storage.

## 2. Deploy to Vercel (recommended)

1. Push this repo to GitHub.
2. In Vercel: **New Project → import the repo** (framework auto-detected as Next.js).
3. Add the environment variables above in **Project → Settings → Environment Variables**.
4. Deploy. HTTPS, CDN, and automatic builds are provided out of the box.
5. Set `NEXT_PUBLIC_APP_URL` to the resulting `https://…vercel.app` (or your custom domain).

> Any Node host works (Render, Railway, Fly, a VPS with `npm run build && npm start`
> behind Nginx + Let's Encrypt). The only requirement is a Node runtime, because
> PDF generation and the API routes run server-side.

## 3. Enable Supabase (optional, for durable storage)

1. Create a Supabase project.
2. In the SQL editor, run [`db/supabase-schema.sql`](../db/supabase-schema.sql).
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Project → Settings → API).
4. Redeploy. The app auto-detects Supabase and uses it instead of the file store.
   The table keeps both the flat 73 columns (for analyst SQL) and a JSONB payload.

## 4. Enable Google Sheets mirror (optional)

1. Create a Google Cloud service account; enable the **Google Sheets API**.
2. Create a spreadsheet, share it with the service-account email (Editor).
3. Set `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and
   `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (escape newlines as `\n`).
4. On first submission per questionnaire, the matching tab
   (`PRE_TEENS_13_17`, …) is created with the 73-column header automatically.
   Sync is best-effort and never blocks a student's submission.

## 5. AI images (optional)

Illustration prompts for all 42 items (kids + teens) ship in `src/config/items.ts`
and are served by `GET /api/images`. To generate real assets, set
`IMAGE_API_PROVIDER` + `IMAGE_API_KEY` and wire your provider call in
`src/app/api/images/route.ts`. Generated files placed at
`public/images/<CODE>_<kids|teens>.png` are picked up automatically by the UI;
otherwise on-brand placeholders are shown.

## 6. HTTPS, SEO & privacy

- **HTTPS** is mandatory (autosave + iframe embedding). Vercel/host-managed certs.
- **SEO:** student/questionnaire routes are intentionally `noindex` (private tool).
  The marketing/landing page can be indexed if desired (edit `metadata` in
  `src/app/layout.tsx`).
- **Privacy:** no names/ages stored; admin token required; Supabase RLS on.

## 7. Smoke test after deploy

```bash
# Submit a response
curl -X POST https://YOUR_APP/api/responses -H 'Content-Type: application/json' \
  -d '{"questionnaireId":"pre-teens-13-17","code":"DLTB07","answers":{ ...all items... }}'
# Open the returned reportUrl → expect a 2-page PDF
# Visit /admin and sign in with ADMIN_TOKEN → expect the response + analytics
```
