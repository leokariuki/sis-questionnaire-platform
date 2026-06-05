# SIS Questionnaire & Impact Reporting Platform

A production-ready, schema-driven platform built by **Leo Kariuki** for
**[BienesDar.org](https://bienesdar.org)** to power the **Leysin American School Summer
Experience**. Students complete a friendly, one-question-per-screen questionnaire;
the system scores seven competencies, generates a personalized PDF "SIS Skills
Profile", and gives advisers a dashboard with analytics and exports.

Built to the uploaded technical specification and the **Alpine Growth System**
design (`DESIGN.md`) as the single source of truth.

> **Pilot scope:** the fully exercised path is **PRE-TEST — Teens 13–17**. The
> other three questionnaires (PRE Kids 9–12, POST Kids 9–12, POST Teens 13–17)
> already exist as configuration and can be switched on without new code — see
> [`docs/REPLICATION.md`](docs/REPLICATION.md).

---

## Tech stack

- **Next.js 14** (App Router) · **React 18** · **TypeScript**
- **TailwindCSS** wired to the DESIGN.md tokens · **Framer Motion** · **Zod**
- **@react-pdf/renderer** for server-side PDF reports
- Pluggable data layer: **local file store** (default) → **Supabase Postgres** (opt-in)
- Optional **Google Sheets** mirror · optional **AI image generation** hook

## Quick start

```bash
npm install
cp .env.example .env.local      # set ADMIN_TOKEN at minimum
npm run dev                      # http://localhost:3000
```

- Pilot questionnaire: `/q/pre-teens-13-17`
- Iframe/WordPress entry: `/embed/pre-teens-13-17`
- Adviser dashboard: `/admin` (sign in with `ADMIN_TOKEN`)

With **no** environment variables beyond `ADMIN_TOKEN`, the app runs entirely on a
local JSON store (`.data/responses.json`) — no external services needed.

## How it maps to the specification

| Spec area | Where it lives |
|---|---|
| 4 questionnaires, separate entry points | `src/config/questionnaires/*`, routes `/q/[id]` |
| One-question-per-screen flow (§24) | `src/lib/flow.ts`, `src/components/questionnaire/*` |
| Code system ABCD12 (§5) | `src/lib/code.ts` (Zod + value maps) |
| 1–5 scale (§8), color coding (§9) | `src/config/scale.ts`, `tailwind.config.ts` |
| 42 items, kids/teens wording, image prompts (§10, §16) | `src/config/items.ts` |
| Background BG1–5 (§17), Transfer TR1–4 (§23) | `src/config/backgroundQuestions.ts`, `transfer.ts` |
| Scoring + bands (§12) | `src/lib/scoring.ts` |
| Personalization rules (§13, §28, §29) | `src/lib/personalization.ts` |
| 73-column database schema (§4) | `src/lib/row.ts`, `db/supabase-schema.sql` |
| PDF reports + radar/bar charts (§11, §26) | `src/lib/report/*` |
| Group/global analytics (§15, §30) | `src/lib/analytics.ts`, `/admin` |
| Quality checks (§31) | `src/lib/quality.ts` |
| Privacy: no names/ages (§"Data privacy") | only the student code is stored |

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript check (no emit) |

## Documentation

- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — hosting, HTTPS, env vars, Supabase, Sheets, SEO
- [`docs/WORDPRESS.md`](docs/WORDPRESS.md) — embedding into WordPress (shortcode + iframe)
- [`docs/REPLICATION.md`](docs/REPLICATION.md) — enabling the other three questionnaires
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — module map and data flow

## Privacy

No names and no ages are ever collected (per spec). The student code carries the
only metadata (dorm, track, club, family group, anonymous number). Admin routes
require a token; the Supabase service-role key is server-only and the table has
RLS enabled with no public policies.
