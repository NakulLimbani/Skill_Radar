// src/app/dashboard/page.tsx
"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import RadarChart from "@/components/RadarChartUI";
import SkillDetailPanel from "@/components/SkillDetailPanel";

/* ----------------------- Types ----------------------- */
interface Candidate {
  id: string; // for locals, we'll set id = "local:<realId>"
  name: string;
  scores: { skill: string; score: number }[];
}

interface SkillDetail {
  score: number;
  evidence: string;
  trend: string;
}

/* ----------------------- Local helpers ----------------------- */
// Shapes from src/lib/localTest.ts (already in your repo)
type SkillName = "C/C++" | "Java" | "Python" | "SQL";
interface CandidateLocal {
  id: string;
  name: string;
  email?: string;
  skills: SkillName[];
  scores: Record<SkillName, number>;
  evidence: Record<SkillName, string>;
  trend: Record<SkillName, string>;
  created_at: string;
}

const LOCAL_KEY = "skillRadar.local.candidates";

function readLocalCandidates(): CandidateLocal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function isLocalId(id: string) {
  return id.startsWith("local:");
}
function localByPrefixedId(prefixedId: string): CandidateLocal | undefined {
  const id = prefixedId.replace(/^local:/, "");
  return readLocalCandidates().find((c) => c.id === id);
}
function toCandidateFromLocal(c: CandidateLocal): Candidate {
  const scoresArr = (c.skills || []).map((s) => ({
    skill: s,
    score: Number((c.scores?.[s] ?? 0).toFixed(1)),
  }));
  return { id: `local:${c.id}`, name: c.name, scores: scoresArr };
}
function mergeApiAndLocal(api: Candidate[]): Candidate[] {
  const locals = readLocalCandidates().map(toCandidateFromLocal);
  // Show locals on top, then backend
  // Avoid duplicate names by keeping all; recruiter can shortlist.
  return [...locals, ...api];
}

/* -------------- Printable HTML for local PDF -------------- */
function buildLocalReportHTML(c: CandidateLocal, chartDataUrl?: string) {
  const today = new Date().toLocaleString();
  const rows = (c.skills || [])
    .map((s) => {
      const sc = c.scores?.[s] ?? 0;
      const ev = c.evidence?.[s] ?? "Self‑test result";
      const tr = c.trend?.[s] ?? "N/A";
      return `<tr><td>${s}</td><td>${sc}</td><td>${ev}</td><td>${tr}</td></tr>`;
    })
    .join("");

  return `<!doctype html>
<html><head><meta charset="utf-8" />
<title>${c.name} — Skill Radar Report</title>
<style>
:root { color-scheme: dark; }
body { margin:0; padding:24px; background:#0b0b0b; color:#e8e8e8;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; }
.card { max-width:900px; margin:0 auto; background:#0f0f0f; border:1px solid #1f1f1f;
  border-radius:16px; padding:24px; }
h1 { margin:0 0 4px 0; font-weight:600; }
.muted { color:#a0a0a0; font-size:12px; }
.section { border:1px solid #1f1f1f; border-radius:12px; padding:16px; background:#121212; margin-top:16px; }
table { width:100%; border-collapse:collapse; }
th,td { text-align:left; padding:10px 12px; border-bottom:1px solid #1f1f1f; vertical-align:top; }
th { color:#cfcfcf; font-weight:600; }
.tag { display:inline-block; border:1px solid #2a2a2a; padding:2px 6px; border-radius:999px; font-size:12px; margin-right:6px; color:#cfcfcf; }
@media print { body { padding:0; } .card { border:none; } }
</style>
</head>
<body>
<div class="card">
  <div style="display:flex; justify-content:space-between; align-items:baseline; gap:12px;">
    <div>
      <h1>Skill Radar Report</h1>
      <div class="muted">${today}</div>
    </div>
    <div>${(c.skills || []).map((s) => `<span class="tag">${s}</span>`).join("")}</div>
  </div>
  <div class="section">
    <h3 style="margin:0 0 8px 0;">Candidate</h3>
    <div><strong>${c.name}</strong></div>
    ${c.email ? `<div class="muted">${c.email}</div>` : ""}
    <div class="muted" style="margin-top:6px;">Local self‑test candidate</div>
  </div>
  ${
    chartDataUrl
      ? `<div class="section" style="text-align:center;">
           <h3 style="margin:0 0 8px 0;">Radar Snapshot</h3>
           <img src="${chartDataUrl}" alt="Radar chart"
                style="max-width:100%;height:auto;border-radius:12px;border:1px solid #1f1f1f;" />
         </div>`
      : ""
  }
  <div class="section">
    <h3 style="margin:0 0 8px 0;">Skills Breakdown</h3>
    <table>
      <thead><tr><th>Skill</th><th>Score (0–10)</th><th>Evidence</th><th>Trend</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="4" class="muted">No skills recorded.</td></tr>`}</tbody>
    </table>
  </div>
</div>
<script>setTimeout(()=>window.print(),300)</script>
</body></html>`;
}

/* ---------------- Memoized candidate row ---------------- */
const CandidateRow = memo(function CandidateRow({
  active,
  label,
  onClick,
  onToggleStar,
  starred,
}: {
  active: boolean;
  label: string;
  starred: boolean;
  onClick: () => void;
  onToggleStar: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onClick}
        className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors ${
          active
            ? "bg-white text-black font-medium shadow"
            : "bg-[#151515] hover:bg-[#1b1b1b] text-gray-200 border border-[#1f1f1f]"
        }`}
        title={label}
      >
        {label}
      </button>
      <button
        onClick={onToggleStar}
        className={`px-2 py-2 rounded-lg border border-[#1f1f1f] transition ${
          starred
            ? "bg-yellow-400/20 text-yellow-300"
            : "bg-[#151515] text-gray-300 hover:bg-[#1b1b1b]"
        }`}
        aria-label={starred ? "Remove from shortlist" : "Add to shortlist"}
        title={starred ? "Remove from shortlist" : "Add to shortlist"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={starred ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 17.27l6.18 3.73-1.64-7.03L21 9.24l-7.19-.61L12 2 10.19 8.63 3 9.24l4.46 4.73L5.82 21z" />
        </svg>
      </button>
    </div>
  );
});

/* --------------------------- Page --------------------------- */
export default function DashboardPage() {
  const sp = useSearchParams();
  const roleParam = (sp.get("role") || "").toLowerCase();
  const role =
    roleParam === "recruiter" || roleParam === "candidate"
      ? roleParam
      : undefined;

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<SkillDetail | null>(null);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [starredIds, setStarredIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("skillRadar.starredIds");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const API = useMemo(
    () =>
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:8000",
    []
  );

  useEffect(() => {
    try {
      localStorage.setItem("skillRadar.starredIds", JSON.stringify(starredIds));
    } catch {}
  }, [starredIds]);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(
      () => setDebouncedSearch(search.trim().toLowerCase()),
      250
    );
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  // Fetch backend candidates and merge local ones
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setErrorMsg("");
        setLoadingList(true);
        const res = await fetch(`${API}/candidates`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const apiData: Candidate[] = await res.json();
        setCandidates(mergeApiAndLocal(apiData));
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          // Even if API fails, still show locals
          setCandidates(mergeApiAndLocal([]));
          setErrorMsg(
            `Could not fetch candidates from ${API}. ${e?.message || e}`
          );
        }
      } finally {
        setLoadingList(false);
      }
    };
    run();
    return () => controller.abort();
  }, [API]);

  const handleSelectCandidate = useCallback(
    async (id: string) => {
      setSelectedCandidateId(id);
      setSelectedSkill(null);
      setLoadingSkills(true);

      try {
        if (isLocalId(id)) {
          const local = localByPrefixedId(id);
          if (local) setSelectedCandidate(toCandidateFromLocal(local));
          else setSelectedCandidate(null);
        } else {
          const res = await fetch(`${API}/candidates/${id}/skills`);
          if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
          const data = await res.json();
          setSelectedCandidate({ ...data, id });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSkills(false);
      }
    },
    [API]
  );

  const handleSelectSkill = useCallback(
    async (skillName: string) => {
      if (!selectedCandidateId) return;
      try {
        if (isLocalId(selectedCandidateId)) {
          const local = localByPrefixedId(selectedCandidateId);
          if (!local) return;
          const score = Number((local.scores?.[skillName as SkillName] ?? 0).toFixed(1));
          const evidence = local.evidence?.[skillName as SkillName] ?? "Self‑test result";
          const trend = local.trend?.[skillName as SkillName] ?? "N/A";
          setSelectedSkill({ score, evidence, trend });
        } else {
          const res = await fetch(
            `${API}/candidates/${selectedCandidateId}/skills/${encodeURIComponent(
              skillName
            )}/details`
          );
          if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
          const data: SkillDetail = await res.json();
          setSelectedSkill(data);
        }
        const el = document.getElementById("skill-detail-card");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (e) {
        console.error(e);
      }
    },
    [API, selectedCandidateId]
  );

  const toggleStar = useCallback((id: string) => {
    setStarredIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const filteredCandidates = useMemo(() => {
    if (!debouncedSearch) return candidates;
    return candidates.filter((c) =>
      c.name.toLowerCase().includes(debouncedSearch)
    );
  }, [candidates, debouncedSearch]);

  const starredFirst = useMemo(() => {
    const set = new Set(starredIds);
    const s = filteredCandidates.filter((c) => set.has(c.id));
    const r = filteredCandidates.filter((c) => !set.has(c.id));
    return [...s, ...r];
  }, [filteredCandidates, starredIds]);

  const openPdf = useCallback(() => {
    if (!selectedCandidateId) return;

    // locals → printable HTML + print dialog
    if (isLocalId(selectedCandidateId)) {
      const local = localByPrefixedId(selectedCandidateId);
      if (!local) return;

      let chartDataUrl: string | undefined;
      try {
        const canvas = document.querySelector("canvas") as HTMLCanvasElement | null;
        chartDataUrl = canvas?.toDataURL("image/png") || undefined;
      } catch {}
      const html = buildLocalReportHTML(local, chartDataUrl);
      const w = window.open("", "_blank");
      if (!w) {
        alert("Please allow pop‑ups to download the report.");
        return;
      }
      w.document.open();
      w.document.write(html);
      w.document.close();
      return;
    }

    // backend → server PDF
    window.open(`/api/reports/candidate/${selectedCandidateId}`, "_blank");
  }, [selectedCandidateId]);

  return (
    <>
      <Header showCreateCourseButton showTryDemoButton={false} />

      <main className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-light">Skill Radar</h1>
            {role && (
              <span className="text-xs px-2 py-1 rounded-full border border-[#2a2a2a] bg-[#0f0f0f] text-gray-300">
                {role === "recruiter" ? "Recruiter view" : "Candidate view"}
              </span>
            )}
          </div>

          {errorMsg && (
            <div className="rounded-2xl border border-red-900/40 bg-red-900/15 text-red-200 px-4 py-3">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Sidebar */}
            <aside className="md:col-span-2 lg:col-span-1 bg-[#0f0f0f] rounded-2xl shadow-lg border border-[#1f1f1f] p-4">
              <div className="mb-3">
                <label className="text-sm text-gray-300 mb-1 block">
                  Search candidates
                </label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type a name…"
                  className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#222] text-white outline-none
                             focus:ring-2 focus:ring-[#2a6df5] transition"
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-medium">Candidates</h2>
                {loadingList && (
                  <span className="text-xs text-gray-400">loading…</span>
                )}
              </div>

              <div className="space-y-2">
                {loadingList && (
                  <>
                    <div className="h-10 rounded-lg bg-[#141414] animate-pulse" />
                    <div className="h-10 rounded-lg bg-[#141414] animate-pulse" />
                    <div className="h-10 rounded-lg bg-[#141414] animate-pulse" />
                  </>
                )}

                {!loadingList && starredFirst.length === 0 && (
                  <div className="text-gray-400 text-sm">No matches.</div>
                )}

                {!loadingList &&
                  starredFirst.map((c) => (
                    <CandidateRow
                      key={c.id}
                      label={`${c.name}${isLocalId(c.id) ? " • local" : ""}`}
                      active={selectedCandidate?.id === c.id}
                      starred={starredIds.includes(c.id)}
                      onClick={() => handleSelectCandidate(c.id)}
                      onToggleStar={() => toggleStar(c.id)}
                    />
                  ))}
              </div>
            </aside>

            {/* Chart + details */}
            <section className="md:col-span-3 lg:col-span-4 space-y-6">
              <div className="bg-[#0f0f0f] rounded-2xl shadow-lg border border-[#1f1f1f] p-6">
                {selectedCandidate ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl sm:text-2xl font-semibold">
                        {selectedCandidate.name}&apos;s Skill Radar
                      </h2>
                      <div className="flex items-center gap-2">
                        {loadingSkills && (
                          <span className="text-xs text-gray-400">loading…</span>
                        )}
                        <button
                          onClick={openPdf}
                          className="px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#222] transition"
                          title="Export candidate report as PDF"
                        >
                          Export PDF
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <RadarChart
                        data={selectedCandidate.scores}
                        onSkillClick={handleSelectSkill}
                      />
                    </div>

                    <p className="text-xs text-gray-400 mt-3 text-center">
                      Tip: click a skill node in the radar to open evidence.
                    </p>
                  </>
                ) : (
                  <p className="text-gray-400 text-center py-20">
                    Select a candidate from the left to view their radar.
                  </p>
                )}
              </div>

              {selectedSkill && (
                <div
                  id="skill-detail-card"
                  className="bg-[#0f0f0f] rounded-2xl shadow-lg border border-[#1f1f1f] p-6"
                >
                  <SkillDetailPanel data={selectedSkill} />
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
