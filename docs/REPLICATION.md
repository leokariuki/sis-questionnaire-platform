# Replication Framework — adding the other three questionnaires

The platform is **schema-driven**: a questionnaire is a configuration object, not
code. All four questionnaires share the same engine (flow builder, runner UI,
scorer, personalization, reports, analytics). The pilot (`pre-teens-13-17`) is the
only one switched **live**; the rest already exist and need only review + a flag.

## What is already shared (write once, reuse everywhere)

| Concern | File |
|---|---|
| 7 competencies, colors, DB prefixes | `src/config/competencies.ts` |
| 42 items, **kids + teens wording**, image prompts | `src/config/items.ts` |
| Background BG1–5 | `src/config/backgroundQuestions.ts` |
| Transfer TR1–4 | `src/config/transfer.ts` |
| 1–5 scale + confidence scale | `src/config/scale.ts` |
| Flow assembly (intro→code→…→review) | `src/lib/flow.ts` |
| Scoring, bands, change labels | `src/lib/scoring.ts` |
| Personalization (pre + post) | `src/lib/personalization.ts` |
| 73-column row mapping | `src/lib/row.ts` |

A questionnaire definition only declares the differences:

```ts
// src/config/questionnaires/post-teens-13-17.ts
export const POST_TEENS_13_17: QuestionnaireDefinition = {
  id: "post-teens-13-17",
  type: "POST",
  ageGroup: "TEENS_13_17",
  title: "Post-Test — Teens 13–17",
  dbSheet: "POST_TEENS_13_17",
  reportTitle: "SIS Skills Profile – Post-Test",
  includesBackground: false,   // POST tests skip BG (imported from PRE by code)
  includesTransfer: true,      // POST tests add TR1–4
  reflection: { icon: "💬", prompt: "What did you learn the most? Why is it important?", dbField: "Reflection_Open" },
};
```

The age group automatically selects kids-vs-teens wording for every item; the
flow builder automatically includes/excludes background and transfer sections.

## To make a questionnaire live

1. Open `src/config/questionnaires/index.ts`.
2. Flip its `live` flag to `true`:
   ```ts
   { definition: PRE_KIDS_9_12, live: true },
   ```
3. Deploy. The route `/q/pre-kids-9-12` and `/embed/pre-kids-9-12` go live, the
   landing page promotes it, and it appears in the admin store/analytics.

## Remaining work to fully enable POST reports

PRE reports are fully implemented. To turn on **POST** reports:

1. **POST report document** — add `src/lib/report/PostReport.tsx` (mirror
   `PreReport.tsx`) rendering the pre/post comparison bar chart and the
   `buildPostReport()` content (already implemented in `personalization.ts`).
2. **Wire it** in `src/lib/report/render.ts` (replace the `throw` in the POST branch).
3. **Pre/post matching** — `buildPostReport(post, pre)` already accepts the matched
   PRE record; fetch it with `store.getByCode("PRE_TEENS_13_17", code)` inside the
   report route before rendering. Unmatched post-tests are already flagged by the
   quality checks (`src/lib/quality.ts`) and surfaced in `/admin`.

## To add an entirely new questionnaire (e.g. a different program)

1. Create a new definition file under `src/config/questionnaires/`.
2. Register it in `index.ts`.
3. If it needs new items/competencies, extend `items.ts` / `competencies.ts`
   (the row mapping and scoring adapt automatically from `competencyItemCodes`).

No runner, scorer, report, or analytics code needs to change.
