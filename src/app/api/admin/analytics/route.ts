import { NextRequest, NextResponse } from "next/server";
import { getStore, activeBackend } from "@/lib/db";
import { isAuthorized } from "@/lib/admin-auth";
import { computeAnalytics } from "@/lib/analytics";
import { hasSheets } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/analytics — aggregated analytics + quality report (admin). */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req.nextUrl.searchParams.get("key"))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const store = await getStore();
  const records = await store.listAll();
  return NextResponse.json({
    analytics: computeAnalytics(records),
    backend: activeBackend(),
    sheetsSync: hasSheets(),
  });
}
