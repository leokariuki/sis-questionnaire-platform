import { NextRequest, NextResponse } from "next/server";
import { submissionSchema } from "@/lib/schema";
import { submitResponse } from "@/lib/submit";
import { getStore } from "@/lib/db";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/responses — submit a completed questionnaire. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const outcome = await submitResponse(parsed.data);
  if (!outcome.ok) {
    return NextResponse.json(
      { error: outcome.error, code: outcome.code, missing: outcome.missing },
      { status: 422 },
    );
  }

  return NextResponse.json({
    ok: true,
    id: outcome.record.id,
    studentCode: outcome.record.studentCode,
    scores: outcome.record.scores,
    reportUrl: outcome.record.reportUrl,
    duplicate: outcome.duplicate,
  });
}

/** GET /api/responses — admin-only list of all responses. */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!isAuthorized(key)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const store = await getStore();
  const records = await store.listAll();
  return NextResponse.json({ records });
}
