/* eslint-disable react/no-unknown-property */
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

type Score = { skill: string; score: number };
type SkillDetail = { score: number; evidence: string; trend: string };

export interface CandidateReportData {
  id: string;
  name: string;
  role?: string;
  scores: Score[];
  detailsBySkill?: Record<string, SkillDetail | undefined>;
}

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#0F0F0F",
  },
  header: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottom: "1px solid #E5E7EB",
  },
  brand: {
    fontSize: 18,
    color: "#7C3AED",
    marginBottom: 2,
  },
  title: { fontSize: 16, marginTop: 4 },
  meta: { fontSize: 10, color: "#6B7280" },
  sectionTitle: {
    fontSize: 13,
    marginTop: 16,
    marginBottom: 6,
  },
  chipRow: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    border: "1px solid #E5E7EB",
    borderRadius: 4,
    padding: "4 8",
    marginRight: 6,
    marginBottom: 6,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  row: {
    display: "flex",
    flexDirection: "row",
  },
  cellH: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 8,
    fontWeight: "bold",
    borderRight: "1px solid #E5E7EB",
  },
  cell: {
    flex: 1,
    padding: 8,
    borderTop: "1px solid #E5E7EB",
    borderRight: "1px solid #E5E7EB",
  },
  cellLast: {
    flex: 1,
    padding: 8,
    borderTop: "1px solid #E5E7EB",
  },
  foot: { marginTop: 16, fontSize: 9, color: "#6B7280" },
});

export default function CandidateReportPDF({
  name,
  role,
  scores,
  detailsBySkill = {},
}: CandidateReportData) {
  const createdAt = format(new Date(), "PPpp");

  // top 3 skills
  const top = [...scores].sort((a, b) => b.score - a.score).slice(0, 3);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>sensai</Text>
          <Text style={styles.title}>Candidate Report — {name}</Text>
          <Text style={styles.meta}>
            {role ? `${role} • ` : ""}Generated: {createdAt}
          </Text>
        </View>

        {/* Highlights */}
        <Text style={styles.sectionTitle}>Highlights</Text>
        <View style={styles.chipRow}>
          {top.map((t) => (
            <View key={t.skill} style={styles.chip}>
              <Text>
                {t.skill}: {t.score.toFixed(1)}/10
              </Text>
            </View>
          ))}
        </View>

        {/* Scores table */}
        <Text style={styles.sectionTitle}>Skill Scores</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.cellH}>Skill</Text>
            <Text style={styles.cellH}>Score</Text>
            <Text style={styles.cellH}>Trend</Text>
            <Text style={styles.cellH}>Evidence (summary)</Text>
          </View>
          {scores.map((s, idx) => {
            const det = detailsBySkill[s.skill];
            const isLast = idx === scores.length - 1;
            return (
              <View key={s.skill} style={styles.row}>
                <Text style={styles.cell}>{s.skill}</Text>
                <Text style={styles.cell}>{s.score.toFixed(1)}</Text>
                <Text style={styles.cell}>{det?.trend ?? "—"}</Text>
                <Text style={isLast ? styles.cellLast : styles.cell}>
                  {det?.evidence ?? "—"}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <Text style={styles.foot}>
          This document summarizes skill signals derived from SensAI assessments
          and artifacts. For full evidence, use the web drill‑downs.
        </Text>
      </Page>
    </Document>
  );
}
