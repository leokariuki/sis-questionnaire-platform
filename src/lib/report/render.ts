import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import type { ResponseRecord } from "@/lib/types";
import { getBySheet } from "@/config/questionnaires";
import { buildPreReport } from "@/lib/personalization";
import { PreReportDocument } from "./PreReport";

/**
 * Render a student's report to a PDF buffer (spec §11, §26).
 * Pre-test reports are fully supported here; post-test rendering reuses the
 * same pipeline once a post questionnaire goes live.
 */
export async function renderReport(record: ResponseRecord): Promise<Buffer> {
  const def = getBySheet(`${record.questionnaireType}_${record.ageGroup}`);
  const reportTitle = def?.reportTitle ?? "SIS Skills Profile";

  if (record.questionnaireType === "PRE") {
    const content = buildPreReport(record.answers, record.scores);
    const doc = React.createElement(PreReportDocument, { record, content, reportTitle });
    return renderToBuffer(doc as React.ReactElement);
  }

  // POST reports are generated with the same engine once enabled.
  throw new Error("Post-test report rendering is not enabled for the pilot.");
}
