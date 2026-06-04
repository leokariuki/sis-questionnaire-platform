import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { renderReport } from "@/lib/report/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/report/[id] — generate and stream the student's PDF report.
 * Reports are produced deterministically on demand from the stored answers,
 * so there is nothing to lose if a render fails — it can simply be retried.
 * On failure the response row is flagged Report_Status = "Error" (spec §31).
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const store = await getStore();
  const record = await store.getById(params.id);
  if (!record) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  try {
    const pdf = await renderReport(record);
    if (record.reportStatus !== "Generated") {
      await store.update(record.id, { reportStatus: "Generated" });
    }
    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${record.studentCode}.pdf"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (err) {
    console.error("[report] generation failed:", (err as Error).message);
    await store.update(record.id, { reportStatus: "Error" });
    return NextResponse.json(
      { error: "Report generation failed.", detail: (err as Error).message },
      { status: 500 },
    );
  }
}
