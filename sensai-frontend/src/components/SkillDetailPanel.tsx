import React, { useState } from "react";

interface SkillDetailPanelProps {
  data: { score: number; evidence: string; trend: string };
}

type TabKey = "overview" | "code" | "logs" | "trend" | "reviews";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "code", label: "Code" },
  { key: "logs", label: "Logs" },
  { key: "trend", label: "Trend" },
  { key: "reviews", label: "Reviews" },
];

const SkillDetailPanel = ({ data }: SkillDetailPanelProps) => {
  const [active, setActive] = useState<TabKey>("overview");

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Skill Evidence</h3>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={[
                "px-3 py-1.5 rounded-full text-sm transition-all border",
                isActive
                  ? "bg-white text-black border-white shadow"
                  : "bg-[#131313] text-gray-200 hover:bg-[#1c1c1c] border-[#1f1f1f]",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-[#1f1f1f] bg-[#121212] p-4">
        {active === "overview" && (
          <div className="space-y-2">
            <p>
              <span className="text-gray-400">Score:</span>{" "}
              <span className="font-medium">{data.score}/10</span>
            </p>
            <p>
              <span className="text-gray-400">Summary:</span>{" "}
              <span>{data.evidence}</span>
            </p>
            <p>
              <span className="text-gray-400">Trend:</span>{" "}
              <span>{data.trend}</span>
            </p>
          </div>
        )}

        {active === "code" && (
          <div className="text-sm">
            <p className="text-gray-400 mb-2">
              Best attempt (sample placeholder — wire to your code artefacts):
            </p>
            <pre className="bg-[#0f0f0f] rounded-lg p-3 overflow-x-auto border border-[#1f1f1f]">
{`SELECT name, COUNT(*) as c
FROM orders
GROUP BY name
ORDER BY c DESC;`}
            </pre>
          </div>
        )}

        {active === "logs" && (
          <div className="text-sm space-y-2">
            <div className="bg-[#101010] border border-[#1f1f1f] rounded-lg p-3">
              <code>2025-08-01 12:04:31 — Fixed N+1 join by adding index on user_id</code>
            </div>
            <div className="bg-[#101010] border border-[#1f1f1f] rounded-lg p-3">
              <code>2025-08-01 12:06:10 — Switched to window function for ranking</code>
            </div>
          </div>
        )}

        {active === "trend" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-300">
              Attempts over time (placeholder sparkline):
            </p>
            {/* simple sparkline */}
            <div className="h-16 w-full bg-[#0f0f0f] rounded-lg border border-[#1f1f1f] overflow-hidden relative">
              <div className="absolute left-0 top-1/2 w-full h-[1px] bg-[#222]" />
              <div className="flex items-end h-full px-2 gap-2">
                {[5, 6, 7, 8, 9].map((v, i) => (
                  <div
                    key={i}
                    style={{ height: `${v * 10}%` }}
                    className="w-6 bg-[#2a6df5] rounded-t"
                    title={`Attempt ${i + 1}: ${v}/10`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {active === "reviews" && (
          <div className="space-y-3">
            <div className="bg-[#101010] rounded-lg p-3 border border-[#1f1f1f]">
              <p className="text-sm">
                <span className="text-gray-400">Reviewer A:</span>{" "}
                Strong fundamentals; explained trade-offs clearly.
              </p>
            </div>
            <div className="bg-[#101010] rounded-lg p-3 border border-[#1f1f1f]">
              <p className="text-sm">
                <span className="text-gray-400">Reviewer B:</span>{" "}
                Good SQL hygiene; missed one edge case initially but fixed fast.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillDetailPanel;
