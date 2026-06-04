import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ResponseRecord } from "@/lib/types";
import { describeCode } from "@/lib/code";
import { scoreBand } from "@/lib/scoring";
import type { PreReportContent } from "@/lib/personalization";
import { RadarChart, ScoreBars } from "./RadarChart";

const s = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 48, paddingHorizontal: 44, fontSize: 10, color: "#161a32", fontFamily: "Helvetica" },
  brandbar: { height: 6, backgroundColor: "#7047a4", borderRadius: 3, marginBottom: 16 },
  h1: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#161a32" },
  subtitle: { fontSize: 11, color: "#4b4451", marginTop: 4 },
  metaRow: { flexDirection: "row", marginTop: 10, marginBottom: 6 },
  metaPill: { backgroundColor: "#ececff", borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10, marginRight: 8, fontSize: 9, color: "#161a32" },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 8, color: "#161a32" },
  card: { backgroundColor: "#f4f2ff", borderRadius: 12, padding: 12, marginBottom: 8 },
  areaTitle: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  band: { fontSize: 9, color: "#4b4451", marginTop: 2 },
  blurb: { fontSize: 10, color: "#161a32", marginTop: 4, lineHeight: 1.4 },
  bullet: { flexDirection: "row", marginBottom: 5 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#7047a4", marginTop: 5, marginRight: 8 },
  bulletText: { flex: 1, fontSize: 10, lineHeight: 1.4 },
  chartWrap: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  adviser: { backgroundColor: "#e5e6ff", borderRadius: 12, padding: 12 },
  quote: { fontStyle: "italic", color: "#4b4451", fontSize: 10, lineHeight: 1.4 },
  footer: { position: "absolute", bottom: 22, left: 44, right: 44, fontSize: 8, color: "#7c7482", textAlign: "center" },
});

function Swatch({ color }: { color: string }) {
  return <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginRight: 6 }} />;
}

export function PreReportDocument({
  record,
  content,
  reportTitle,
}: {
  record: ResponseRecord;
  content: PreReportContent;
  reportTitle: string;
}) {
  const desc = describeCode(record.code);
  const date = new Date(record.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const overallBand = scoreBand(record.scores.overall);

  return (
    <Document title={`${reportTitle} — ${record.studentCode}`} author="SIS Summer Experience">
      <Page size="A4" style={s.page}>
        <View style={s.brandbar} />
        <Text style={s.h1}>{reportTitle}</Text>
        <Text style={s.subtitle}>
          Leysin American School Summer Experience · A reflection on your skills, not a grade.
        </Text>
        <View style={s.metaRow}>
          <Text style={s.metaPill}>Code: {record.studentCode}</Text>
          <Text style={s.metaPill}>Type: Pre-Test (Teens 13–17)</Text>
          <Text style={s.metaPill}>Date: {date}</Text>
        </View>
        <Text style={{ fontSize: 9, color: "#4b4451" }}>
          {desc.dorm} · {desc.morningTrack} · {desc.afternoonClub} · {desc.familyGroup}
        </Text>

        {/* Skills overview chart */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Your skills overview</Text>
          <View style={s.chartWrap}>
            <RadarChart scores={record.scores} size={240} />
            <ScoreBars scores={record.scores} width={300} />
          </View>
          <Text style={{ fontSize: 9, color: "#4b4451", marginTop: 4 }}>
            Overall, your answers place you in the “{overallBand}” range ({record.scores.overall.toFixed(2)} / 5.00).
            This is a snapshot to build on during the summer.
          </Text>
        </View>

        {/* Strongest skills */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Your strongest skills</Text>
          {content.strengths.map((a) => (
            <View key={a.competencyId} style={s.card}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Swatch color={a.color} />
                <Text style={s.areaTitle}>
                  {a.label} — {a.score.toFixed(2)} / 5.00
                </Text>
              </View>
              <Text style={s.band}>{a.band}</Text>
              <Text style={s.blurb}>{a.blurb}</Text>
            </View>
          ))}
        </View>

        {/* Skills to practice */}
        <View style={s.section} wrap={false}>
          <Text style={s.sectionTitle}>Skills to practice during SIS</Text>
          {content.developing.map((a) => (
            <View key={a.competencyId} style={s.card}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Swatch color={a.color} />
                <Text style={s.areaTitle}>
                  {a.label} — {a.score.toFixed(2)} / 5.00
                </Text>
              </View>
              <Text style={s.band}>{a.band}</Text>
              <Text style={s.blurb}>{a.blurb}</Text>
            </View>
          ))}
        </View>

        {/* Personalized suggestions */}
        <View style={s.section} wrap={false}>
          <Text style={s.sectionTitle}>Personalized suggestions for your summer</Text>
          {content.suggestions.map((sug, i) => (
            <View key={i} style={s.bullet}>
              <View style={s.dot} />
              <Text style={s.bulletText}>{sug}</Text>
            </View>
          ))}
          {content.backgroundNotes.map((note, i) => (
            <View key={`bg-${i}`} style={s.bullet}>
              <View style={[s.dot, { backgroundColor: "#006a65" }]} />
              <Text style={s.bulletText}>{note}</Text>
            </View>
          ))}
        </View>

        {/* Adviser guidance */}
        <View style={s.section} wrap={false}>
          <Text style={s.sectionTitle}>Adviser guidance</Text>
          <View style={s.adviser}>
            {content.adviserGuidance.map((g, i) => (
              <View key={i} style={s.bullet}>
                <View style={s.dot} />
                <Text style={s.bulletText}>{g}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reflection */}
        {record.answers["Reflection_Open"] ? (
          <View style={s.section} wrap={false}>
            <Text style={s.sectionTitle}>What you said you’d like to learn at SIS</Text>
            <Text style={s.quote}>“{String(record.answers["Reflection_Open"])}”</Text>
          </View>
        ) : null}

        <Text style={s.footer} fixed>
          SIS Skills Profile · Private to the student and their advisers · No names or ages are collected.
        </Text>
      </Page>
    </Document>
  );
}
