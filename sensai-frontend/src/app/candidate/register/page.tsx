"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ALL_SKILLS,
  SkillName,
  CandidateLocal,
  uid,
  upsertCandidate,
  createLocalTest,
} from "@/lib/localTest"; // we’ll make this helper next

export default function CandidateRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [skills, setSkills] = useState<SkillName[]>([]);
  const [error, setError] = useState("");

  const toggleSkill = (skill: SkillName) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || skills.length === 0) {
      setError("Name and at least one skill are required.");
      return;
    }
    const candidate: CandidateLocal = {
      id: uid("cand"),
      name,
      skills,
      scores: {} as any,
      evidence: {} as any,
      trend: {} as any,
      created_at: new Date().toISOString(),
    };
    upsertCandidate(candidate);
    const test = createLocalTest(candidate.id, skills);
    router.push(`/candidate/test?testId=${test.test_id}&candidateId=${candidate.id}`);
  };

  return (
    <main className="min-h-screen bg-black text-white flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-[#0f0f0f] p-6 rounded-xl border border-[#1f1f1f] w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">Candidate Registration</h1>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <input
          className="w-full p-2 rounded bg-[#141414] border border-[#222]"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div>
          <p className="mb-2">Select skills:</p>
          <div className="grid grid-cols-2 gap-2">
            {ALL_SKILLS.map((skill) => (
              <button
                type="button"
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-2 rounded border ${
                  skills.includes(skill)
                    ? "bg-purple-600 text-white"
                    : "bg-[#151515] text-gray-300"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-white text-black py-2 rounded-lg font-semibold"
        >
          Start Test
        </button>
      </form>
    </main>
  );
}
