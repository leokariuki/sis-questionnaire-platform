# Architecture

## Overview

A single Next.js app with three faces:

1. **Student questionnaire** — `/q/[id]` and `/embed/[id]` (iframe for WordPress)
2. **APIs** — submit, report, images, admin analytics
3. **Adviser dashboard** — `/admin`

Everything is driven by **configuration**, so the four questionnaires share one
engine.

## Data flow

```
Student → Runner UI (autosave to localStorage)
        → POST /api/responses
            → Zod validation (schema.ts)
            → parse code (code.ts)
            → completeness check (quality.ts)
            → score (scoring.ts)
            → persist (db/* : local file | Supabase)
            → mirror to Google Sheets (sheets.ts, best-effort)
        ← { scores, reportUrl }
Student → GET /api/report/[id]
            → load record → buildPreReport (personalization.ts)
            → render PDF (report/*) → stream application/pdf
Adviser → /admin → GET /api/responses + /api/admin/analytics
            → analytics.ts (aggregates) + quality.ts (flags)
            → CSV export (csv.ts, 73-column order)
```

## Module map

```
src/
  config/                 # ← the single source of truth (data, not logic)
    competencies.ts        # 7 competencies (color, icon, DB prefix, score field)
    items.ts               # 42 items: kids/teens wording + image prompts
    backgroundQuestions.ts # BG1–BG5 (PRE only)
    transfer.ts            # TR1–TR4 (POST only)
    scale.ts               # 1–5 scale + confidence scale
    questionnaires/        # one definition per form + registry (index.ts)
  lib/
    types.ts               # domain types (Step model, ResponseRecord, …)
    flow.ts                # definition → ordered Step[]
    code.ts                # ABCD12 parse/validate + value maps
    scoring.ts             # averages, bands, ranking, change labels
    personalization.ts     # rule-based PRE & POST report content
    quality.ts             # duplicate/unmatched/incomplete checks
    schema.ts              # Zod submission payload
    row.ts                 # 73-column flat mapping (shared by all backends)
    submit.ts              # submission service (validate→score→persist→sync)
    analytics.ts           # group/global aggregates
    csv.ts                 # CSV export
    admin-auth.ts          # token gate
    db/                     # store.ts (interface) · local.ts · supabase.ts · index.ts
    sheets.ts              # Google Sheets mirror (env-gated)
    images/registry.ts     # image prompt registry + generation contract
    report/                # RadarChart.tsx · PreReport.tsx · render.ts
  hooks/
    useQuestionnaire.ts    # step state, autosave, resume, progress, validation
  components/
    ui/                    # ProgressBar, ScaleSelector, OptionList, CompetencyImage
    questionnaire/         # screens.tsx, QuestionnaireRunner.tsx, CompletionScreen.tsx
  app/
    page.tsx               # landing
    q/[questionnaire]/     # questionnaire runner route
    embed/[questionnaire]/ # iframe entry (CSP frame-ancestors)
    admin/                 # adviser dashboard
    api/                   # responses, report/[id], images, admin/analytics
```

## Design system

`tailwind.config.ts` transcribes the **Alpine Growth System** tokens from
`DESIGN.md` (surface roles, Outfit/Inter, pill radii, fluid spacing) plus the seven
competency hues from the spec (§9). Glassmorphism, tactile press states, and soft
ambient shadows live in `globals.css` (`.glass`, `.btn-primary`, `.card`).

## Backend selection

`lib/db/index.ts` picks the store at runtime:

- **Supabase** if `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set
- **Local file store** (`.data/responses.json`) otherwise

Both implement the same `DataStore` interface, so nothing else changes. Google
Sheets sync and AI image generation are independent, env-gated add-ons.

## Why these choices

- **Schema-driven** → the remaining questionnaires are config, not duplicated code.
- **Pluggable store** → runs instantly with zero credentials; scales to Supabase.
- **On-demand PDFs** → deterministic, retryable, nothing to lose on failure.
- **Iframe embed** → full design fidelity in WordPress with CSP isolation.
- **Rule-based personalization** → reviewable, safe, encouraging — no runtime AI.
```
