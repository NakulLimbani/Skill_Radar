"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import {
  getLocalTest,
  getCandidates,
  upsertCandidate,
  scoreAnswers,
  TestQuestion,
  SkillName,
} from "@/lib/localTest";

export default function CandidateTestPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const testId = sp.get("testId") || "";
  const candidateId = sp.get("candidateId") || "";

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | { overall: number; per_skill: Record<SkillName, number> }>(null);

  useEffect(() => {
    const t = getLocalTest(testId);
    if (!t || t.candidate_id !== candidateId) {
      setError("Invalid or missing test.");
      setLoading(false);
      return;
    }
    setQuestions(t.questions);
    setLoading(false);
  }, [testId, candidateId]);

  const onSelect = (qid: string, idx: number) => {
    setAnswers(prev => ({ ...prev, [qid]: idx }));
  };

  const canSubmit = useMemo(() => {
    return questions.length > 0 && questions.every(q => answers[q.id] !== undefined);
  }, [questions, answers]);

  const submit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    const { perSkill, overall } = scoreAnswers(questions, answers);

    // persist into candidate record
    const all = getCandidates();
    const c = all.find(x => x.id === candidateId);
    if (c) {
      for (const [skill, score] of Object.entries(perSkill) as [SkillName, number][]) {
        const prev = c.scores[skill];
        c.scores[skill] = score;
        c.evidence[skill] = `Auto-scored ${questions.filter(q => q.skill === skill).length} MCQs.`;
        c.trend[skill] = prev === undefined ? "First attempt." : (score > prev ? "Improved" : (score < prev ? "Dropped" : "Stable"));
      }
      upsertCandidate(c);
    }

    setResult({ overall, per_skill: perSkill });
    setSubmitting(false);
  };

  const goDashboard = () => {
    router.push("/dashboard?role=candidate");
  };

  return (
    <>
      <Header showCreateCourseButton={false} showTryDemoButton={false} />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-light mb-4">Skill Test</h1>

          {error && (
            <div className="mb-4 rounded-xl border border-red-900/40 bg-red-900/15 text-red-200 px-4 py-3">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="bg-[#0f0f0f] rounded-2xl border border-[#1f1f1f] p-6 mb-6">
              <h2 className="text-xl mb-2">Your results</h2>
              <p className="text-gray-300 mb-3">Overall: <span className="font-semibold">{result.overall}/10</span></p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(result.per_skill).map(([skill, score]) => (
                  <div key={skill} className="px-3 py-2 rounded-lg bg-[#151515] border border-[#222]">
                    <div className="text-sm text-gray-400">{skill}</div>
                    <div className="text-white font-semibold">{score}/10</div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button
                  onClick={goDashboard}
                  className="px-4 py-2 rounded-lg bg-white text-black hover:opacity-90 transition"
                >
                  View my profile
                </button>
              </div>
            </div>
          )}

          {/* Test body */}
          <div className="bg-[#0f0f0f] rounded-2xl border border-[#1f1f1f] p-6">
            {loading ? (
              <div className="space-y-3">
                <div className="h-6 bg-[#141414] rounded animate-pulse" />
                <div className="h-20 bg-[#141414] rounded animate-pulse" />
                <div className="h-20 bg-[#141414] rounded animate-pulse" />
              </div>
            ) : (
              <>
                {questions.length === 0 ? (
                  <p className="text-gray-400">No questions.</p>
                ) : (
                  <div className="space-y-6">
                    {questions.map((q, idx) => (
                      <div key={q.id} className="border border-[#1f1f1f] rounded-xl p-4 bg-[#101010]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-gray-400">Q{idx + 1} • {q.skill}</div>
                        </div>
                        <div className="mb-3">{q.q}</div>
                        <div className="grid gap-2">
                          {q.options.map((opt, oi) => {
                            const active = answers[q.id] === oi;
                            return (
                              <button
                                key={oi}
                                onClick={() => onSelect(q.id, oi)}
                                className={`text-left px-3 py-2 rounded-lg border transition ${
                                  active
                                    ? "bg-white text-black border-white"
                                    : "bg-[#151515] text-gray-200 border-[#1f1f1f] hover:bg-[#1b1b1b]"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="pt-2">
                      <button
                        disabled={!canSubmit || submitting}
                        onClick={submit}
                        className="px-5 py-2 rounded-lg bg-white text-black hover:opacity-90 transition disabled:opacity-50"
                      >
                        {submitting ? "Submitting…" : "Submit"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
