import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import CandidateReportPDF, {
  CandidateReportData,
} from "@/components/reports/CandidateReportPDF";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8000";

// Helper: fetch JSON with basic error throwing
async function j<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
  }
  return res.json();
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    // 1) scores (you already use this in dashboard)
    const skillData = await j<{ name: string; scores: { skill: string; score: number }[] }>(
      `${API}/candidates/${id}/skills`
    );

    // 2) per‑skill details in parallel (optional but nice)
    const detailsEntries = await Promise.all(
      skillData.scores.map(async (s) => {
        try {
          const det = await j<{ score: number; evidence: string; trend: string }>(
            `${API}/candidates/${id}/skills/${encodeURIComponent(s.skill)}/details`
          );
          return [s.skill, det] as const;
        } catch {
          return [s.skill, undefined] as const;
        }
      })
    );

    const detailsBySkill = Object.fromEntries(detailsEntries);

    const payload: CandidateReportData = {
      id,
      name: skillData.name || "Candidate",
      scores: skillData.scores,
      detailsBySkill,
    };

    const pdfStream = await renderToStream(
      <CandidateReportPDF {...payload} />
    );

    // Stream as a PDF download
    return new NextResponse(pdfStream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="candidate_${id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to generate PDF", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
