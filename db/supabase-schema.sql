-- ───────────────────────────────────────────────────────────────
-- SIS Questionnaire Platform — Supabase / Postgres schema
-- Run once in the Supabase SQL editor before enabling the adapter.
-- Mirrors the 73-column spec (§4) for analyst access, plus a JSONB
-- payload for faithful round-tripping by the application.
-- ───────────────────────────────────────────────────────────────

create table if not exists public.sis_responses (
  id text primary key,
  sheet text not null,                 -- e.g. PRE_TEENS_13_17
  payload jsonb not null,              -- full ResponseRecord

  "Timestamp" timestamptz,
  "Questionnaire_Type" text,
  "Age_Group" text,
  "Student_Code" text,
  "Code_Letter_1" text,
  "Code_Letter_2" text,
  "Code_Letter_3" text,
  "Code_Letter_4" text,
  "Code_Number_1" text,
  "Code_Number_2" text,
  "Main_Language_1" text,
  "Main_Language_2" text,
  "English_Level" text,
  "Previous_International_Camp" text,
  "Previous_Stay_Away_From_Home" text,
  "Confidence_Using_English" numeric,

  "COM1" numeric, "COM2" numeric, "COM3" numeric, "COM4" numeric, "COM5" numeric, "COM6" numeric,
  "LEAD1" numeric, "LEAD2" numeric, "LEAD3" numeric, "LEAD4" numeric, "LEAD5" numeric, "LEAD6" numeric,
  "EMO1" numeric, "EMO2" numeric, "EMO3" numeric, "EMO4" numeric, "EMO5" numeric, "EMO6" numeric,
  "CT1" numeric, "CT2" numeric, "CT3" numeric, "CT4" numeric, "CT5" numeric, "CT6" numeric,
  "CRE1" numeric, "CRE2" numeric, "CRE3" numeric, "CRE4" numeric, "CRE5" numeric, "CRE6" numeric,
  "AUTO1" numeric, "AUTO2" numeric, "AUTO3" numeric, "AUTO4" numeric, "AUTO5" numeric, "AUTO6" numeric,
  "TEAM1" numeric, "TEAM2" numeric, "TEAM3" numeric, "TEAM4" numeric, "TEAM5" numeric, "TEAM6" numeric,

  "TR1" numeric, "TR2" numeric, "TR3" numeric,
  "TR4_Open" text,
  "Reflection_Open" text,

  "Communication_Score" numeric,
  "Leadership_Score" numeric,
  "Emotional_Skills_Score" numeric,
  "Thinking_Skills_Score" numeric,
  "Creativity_Score" numeric,
  "Independence_Score" numeric,
  "Teamwork_Score" numeric,
  "Overall_Score" numeric,

  "Report_File_URL" text,
  "Report_Status" text,

  created_at timestamptz not null default now()
);

create index if not exists sis_responses_sheet_idx on public.sis_responses (sheet);
create index if not exists sis_responses_code_idx on public.sis_responses ("Student_Code");

-- Lock the table to the service role only (no public/anon access).
-- The app uses the service-role key from the server; never expose it client-side.
alter table public.sis_responses enable row level security;
-- (No policies = only service_role / postgres can read or write.)
