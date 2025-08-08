// src/lib/localTest.ts
export type SkillName = "C/C++" | "Java" | "Python" | "SQL";

export interface CandidateLocal {
  id: string;
  name: string;
  email?: string;
  skills: SkillName[];
  scores: Record<SkillName, number>;  // 0..10
  evidence: Record<SkillName, string>;
  trend: Record<SkillName, string>;
  created_at: string;
}

export interface TestQuestion {
  id: string;
  skill: SkillName;
  q: string;
  options: string[];
  answer: number; // correct index
}

export interface LocalTest {
  test_id: string;
  candidate_id: string;
  questions: TestQuestion[];
  created_at: string;
}

export const ALL_SKILLS: SkillName[] = ["C/C++", "Java", "Python", "SQL"];

export const QUESTION_BANK: Record<SkillName, TestQuestion[]> = {
  "C/C++": [
    { id: "c1", skill: "C/C++", q: "Time complexity of binary search?", options: ["O(n)","O(log n)","O(n log n)","O(1)"], answer: 1 },
    { id: "c2", skill: "C/C++", q: "Keyword that allocates memory in C++?", options: ["malloc","calloc","new","alloc"], answer: 2 },
  ],
  Java: [
    { id: "j1", skill: "Java", q: "Which collection is ordered & allows duplicates?", options: ["Set","Map","List","Queue"], answer: 2 },
    { id: "j2", skill: "Java", q: "JVM stands for?", options: ["Java Virtual Machine","Java Verified Module","Joint VM","JIT VM"], answer: 0 },
  ],
  Python: [
    { id: "p1", skill: "Python", q: "List comprehension returns a…", options: ["dict","set","list","tuple"], answer: 2 },
    { id: "p2", skill: "Python", q: "Which is NOT a Python type?", options: ["int","char","list","dict"], answer: 1 },
  ],
  SQL: [
    { id: "s1", skill: "SQL", q: "Which clause filters rows?", options: ["ORDER BY","WHERE","GROUP BY","LIMIT"], answer: 1 },
    { id: "s2", skill: "SQL", q: "Which improves SELECT speed?", options: ["Primary key","Foreign key","Index","Constraint"], answer: 2 },
  ],
};

// ----------------- LocalStorage helpers -----------------
const C_KEY = "skillRadar.local.candidates";
const T_KEY = "skillRadar.local.tests";

function readJSON<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(k: string, v: T) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getCandidates(): CandidateLocal[] {
  return readJSON<CandidateLocal[]>(C_KEY, []);
}

export function saveCandidates(list: CandidateLocal[]) {
  writeJSON(C_KEY, list);
}

export function upsertCandidate(c: CandidateLocal) {
  const list = getCandidates();
  const idx = list.findIndex(x => x.id === c.id);
  if (idx >= 0) list[idx] = c; else list.unshift(c);
  saveCandidates(list);
}

export function getTests(): LocalTest[] {
  return readJSON<LocalTest[]>(T_KEY, []);
}

export function saveTests(list: LocalTest[]) {
  writeJSON(T_KEY, list);
}

export function createLocalTest(candidate_id: string, skills: SkillName[]): LocalTest {
  // 2 questions per skill
  const qs: TestQuestion[] = skills.flatMap(s =>
    (QUESTION_BANK[s] || []).slice(0, 2)
  );
  const test: LocalTest = {
    test_id: uid("test"),
    candidate_id,
    questions: qs,
    created_at: new Date().toISOString(),
  };
  const all = getTests();
  all.unshift(test);
  saveTests(all);
  return test;
}

export function getLocalTest(test_id: string): LocalTest | undefined {
  return getTests().find(t => t.test_id === test_id);
}

export function scoreAnswers(questions: TestQuestion[], answers: Record<string, number>) {
  // returns { perSkill, overall }
  const totals: Record<SkillName, number> = { "C/C++":0, Java:0, Python:0, SQL:0 };
  const corrects: Record<SkillName, number> = { "C/C++":0, Java:0, Python:0, SQL:0 };

  for (const q of questions) {
    totals[q.skill] += 1;
    const sel = answers[q.id];
    if (sel !== undefined && sel === q.answer) corrects[q.skill] += 1;
  }

  const perSkill: Partial<Record<SkillName, number>> = {};
  const used: SkillName[] = [];
  for (const s of ALL_SKILLS) {
    if (totals[s] > 0) {
      perSkill[s] = Math.round((corrects[s] / totals[s]) * 10 * 10) / 10;
      used.push(s);
    }
  }
  const vals = used.map(s => perSkill[s] || 0);
  const overall = Math.round((vals.reduce((a,b)=>a+b,0) / Math.max(vals.length,1)) * 10) / 10;

  return { perSkill: perSkill as Record<SkillName, number>, overall };
}
