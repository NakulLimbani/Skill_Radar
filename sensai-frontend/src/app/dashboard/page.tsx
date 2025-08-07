// sensai-frontend/src/app/dashboard/page.tsx
"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";
import { Header } from "@/components/layout/header";
import RadarChart from "@/components/RadarChartUI";
import SkillDetailPanel from "@/components/SkillDetailPanel";
import { useSearchParams } from "next/navigation";

interface Candidate {
  id: string;
  name: string;
  scores: { skill: string; score: number }[];
}

interface SkillDetail {
  score: number;
  evidence: string;
  trend: string;
}

/* -------------------- Small memoized child to reduce re-renders -------------------- */
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
        className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors
        ${
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
        className={`px-2 py-2 rounded-lg border border-[#1f1f1f] transition
          ${
            starred
              ? "bg-yellow-400/20 text-yellow-300"
              : "bg-[#151515] text-gray-300 hover:bg-[#1b1b1b]"
          }`}
        aria-label={starred ? "Remove from shortlist" : "Add to shortlist"}
        title={starred ? "Remove from shortlist" : "Add to shortlist"}
      >
        {/* star icon */}
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

/* ----------------------------------- Page ----------------------------------- */

const DashboardPage = () => {
  const searchParams = useSearchParams();
  const roleParam = (searchParams.get("role") || "").toLowerCase();
  const role =
    roleParam === "recruiter" || roleParam === "candidate"
      ? roleParam
      : undefined;

  // data
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<SkillDetail | null>(null);

  // ui
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // shortlist (persist in localStorage)
  const [starredIds, setStarredIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("skillRadar.starredIds");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // keep API base stable (prevents the changing-deps bug and re-renders)
  const API = useMemo(
    () =>
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:8000",
    []
  );

  // persist shortlist
  useEffect(() => {
    try {
      localStorage.setItem("skillRadar.starredIds", JSON.stringify(starredIds));
    } catch {}
  }, [starredIds]);

  // debounce search to avoid lag while typing
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

  // fetch candidates once (with abort safety)
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setErrorMsg("");
        setLoadingList(true);
        const res = await fetch(`${API}/candidates`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const data: Candidate[] = await res.json();
        setCandidates(data);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setErrorMsg(`Could not fetch candidates from ${API}. ${e?.message || e}`);
      } finally {
        setLoadingList(false);
      }
    };
    run();
    return () => controller.abort();
  }, [API]);

  // select candidate → fetch skills
  const handleSelectCandidate = useCallback(
    async (candidateId: string) => {
      const controller = new AbortController();
      try {
        setLoadingSkills(true);
        setSelectedSkill(null);
        setSelectedCandidate(null); // clear old while loading
        const res = await fetch(`${API}/candidates/${candidateId}/skills`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const data = await res.json();
        setSelectedCandidate({ ...data, id: candidateId });
        setSelectedCandidateId(candidateId);
      } catch (e: any) {
        if (e?.name !== "AbortError") console.error(e);
      } finally {
        setLoadingSkills(false);
      }
      return () => controller.abort();
    },
    [API]
  );

  // click a spoke → fetch skill details
  const handleSelectSkill = useCallback(
    async (skillName: string) => {
      if (!selectedCandidateId) return;
      try {
        const res = await fetch(
          `${API}/candidates/${selectedCandidateId}/skills/${encodeURIComponent(
            skillName
          )}/details`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const data: SkillDetail = await res.json();
        setSelectedSkill(data);
        // smooth scroll detail into view on smaller screens
        const el = document.getElementById("skill-detail-card");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (e) {
        console.error(e);
      }
    },
    [API, selectedCandidateId]
  );

  // shortlist toggle
  const toggleStar = useCallback((id: string) => {
    setStarredIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  // derived: filtered candidates
  const filteredCandidates = useMemo(() => {
    if (!debouncedSearch) return candidates;
    return candidates.filter((c) =>
      c.name.toLowerCase().includes(debouncedSearch)
    );
  }, [candidates, debouncedSearch]);

  const starredFirst = useMemo(() => {
    const set = new Set(starredIds);
    const starred = filteredCandidates.filter((c) => set.has(c.id));
    const rest = filteredCandidates.filter((c) => !set.has(c.id));
    return [...starred, ...rest];
  }, [filteredCandidates, starredIds]);

  const openPdf = useCallback(() => {
    if (!selectedCandidateId) return;
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
                      label={c.name}
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
};

export default DashboardPage;
