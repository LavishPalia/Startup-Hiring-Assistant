// src/App.tsx
// Frontend assignment: Budget‑aware, skill‑weighted hiring slate from an uploaded JSON file
// Works with the provided /mnt/data/form-submissions.json, or manual upload via UI
// TailwindCSS recommended; uses framer-motion for subtle animations

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import candidates from "./data/form-submissions.json";

// ----------------------------- Types ----------------------------------------

type WorkExp = { roleName?: string | null };

type SalaryBlock = { [k: string]: unknown } & {
  "full-time"?: string | number | null;
};

type Candidate = {
  name?: string | null;
  email?: string | null;
  location?: string | null;
  annual_salary_expectation?: SalaryBlock | null;
  skills?: (string | null)[] | null;
  work_experiences?: WorkExp[] | null;
  // Accept passthrough props from unknown shapes
  [k: string]: unknown;
};

type Category =
  | "Full Stack Developer"
  | "Marketing Specialist"
  | "Accounting"
  | "Cybersecurity Analyst"
  | "Data Scientist";

// ------------------------ Category configuration ----------------------------

const CATEGORY_CONFIG: Record<
  Category,
  { role_keywords: string[]; skill_keywords: string[] }
> = {
  "Full Stack Developer": {
    role_keywords: [
      "full stack developer",
      "senior full stack",
      "frontend engineer",
      "backend engineer",
      "software engineer",
    ],
    skill_keywords: [
      "react",
      "node",
      "typescript",
      "python",
      "java",
      "sql",
      "postgresql",
      "mongodb",
      "docker",
      "kubernetes",
      "aws",
      "gcp",
      "azure",
      "rest apis",
      "graphql",
      "next js",
      "redux",
      "django",
      "flask",
    ],
  },
  "Marketing Specialist": {
    role_keywords: [
      "marketing specialist",
      "marketing manager",
      "digital marketing",
      "growth",
      "brand",
      "content",
      "seo",
      "sem",
      "ppc",
      "social media",
    ],
    skill_keywords: [
      "seo",
      "sem",
      "google ads",
      "facebook ads",
      "content",
      "copywriting",
      "email",
      "crm",
      "analytics",
      "ga4",
      "hubspot",
      "marketo",
      "social",
    ],
  },
  Accounting: {
    role_keywords: [
      "accountant",
      "accounting",
      "accounts payable",
      "accounts receivable",
      "financial analyst",
      "bookkeeper",
      "controller",
      "tax",
    ],
    skill_keywords: [
      "accounting",
      "excel",
      "gaap",
      "quickbooks",
      "sap",
      "oracle",
      "financial reporting",
      "reconciliation",
      "tax",
    ],
  },
  "Cybersecurity Analyst": {
    role_keywords: [
      "cybersecurity",
      "security engineer",
      "security analyst",
      "security operations",
      "soc",
      "information security",
      "appsec",
    ],
    skill_keywords: [
      "security",
      "network security",
      "siem",
      "threat",
      "vulnerability",
      "splunk",
      "ids",
      "ips",
      "owasp",
      "incident response",
    ],
  },
  "Data Scientist": {
    role_keywords: [
      "data scientist",
      "ml engineer",
      "machine learning engineer",
      "research scientist",
      "ai engineer",
    ],
    skill_keywords: [
      "python",
      "pandas",
      "numpy",
      "scikit",
      "sklearn",
      "pytorch",
      "tensorflow",
      "sql",
      "nlp",
      "computer vision",
      "statistics",
      "r",
    ],
  },
};

const TARGET_CATEGORIES: Category[] = [
  "Full Stack Developer",
  "Marketing Specialist",
  "Accounting",
  "Cybersecurity Analyst",
  "Data Scientist",
];

// ----------------------------- Utilities ------------------------------------

const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();

const parseSalary = (c: Candidate): number | null => {
  try {
    const raw = c.annual_salary_expectation?.["full-time"];
    if (raw == null) return null;
    const digits = String(raw).replace(/[^0-9]/g, "");
    return digits ? Number(digits) : null;
  } catch {
    return null;
  }
};

const formatMoney = (n: number | null | undefined) =>
  n == null
    ? "N/A"
    : n.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      });

// ----------------------------- Scoring --------------------------------------

type EvalRow = {
  idx: number;
  category: Category;
  name: string;
  email: string;
  location: string;
  salary: number | null;
  expHits: number;
  skillHits: number;
  score: number; // computed later
  raw: Candidate;
};

function expHits(c: Candidate, keywords: string[]): number {
  const roles = c.work_experiences ?? [];
  let total = 0;
  for (const r of roles) {
    const role = norm(r.roleName ?? "");
    if (!role) continue;
    if (keywords.some((k) => role.includes(norm(k)))) total += 1;
  }
  return total;
}

function skillsHits(c: Candidate, keywords: string[]): number {
  const skills = (c.skills ?? []).map((s) => norm(String(s ?? "")));
  let hits = 0;
  for (const k of keywords) {
    const needle = norm(k);
    if (skills.some((s) => s === needle || s.includes(needle))) hits += 1;
  }
  return hits;
}

function scoreCategory(
  data: Candidate[],
  category: Category,
  weights: { exp: number; skill: number; salary: number }
): EvalRow[] {
  const cfg = CATEGORY_CONFIG[category];
  const RKW = cfg.role_keywords.map(norm);
  const SKW = cfg.skill_keywords.map(norm);

  const rows: EvalRow[] = [];
  data.forEach((cand, idx) => {
    const eHits = expHits(cand, RKW);
    if (eHits === 0) return; // require some relevant experience
    const sHits = skillsHits(cand, SKW);
    const sal = parseSalary(cand);
    const name =
      (cand.name as string) ||
      String(cand.email ?? "").split("@")[0] ||
      `Candidate_${idx + 1}`;
    const email = String(cand.email ?? "");
    const location = String(cand.location ?? "");
    rows.push({
      idx,
      category,
      name,
      email,
      location,
      salary: sal,
      expHits: eHits,
      skillHits: sHits,
      score: 0,
      raw: cand,
    });
  });

  if (rows.length === 0) return [];

  const maxExp = Math.max(1, ...rows.map((r) => r.expHits));
  const maxSkill = Math.max(1, ...rows.map((r) => r.skillHits));
  const salaries = rows
    .map((r) => r.salary)
    .filter((s): s is number => s != null);
  const minSal = salaries.length ? Math.min(...salaries) : 0;
  const maxSal = salaries.length ? Math.max(...salaries) : 1;
  const salRange = Math.max(1, maxSal - minSal);

  const invSalary = (s: number | null) =>
    s == null ? 0.5 : 1 - (s - minSal) / salRange;

  for (const r of rows) {
    const expS = r.expHits / maxExp;
    const skillS = r.skillHits / maxSkill;
    const salS = invSalary(r.salary);
    r.score =
      weights.exp * expS + weights.skill * skillS + weights.salary * salS;
  }

  rows.sort(
    (a, b) =>
      b.score - a.score || // score desc
      (a.salary ?? Number.POSITIVE_INFINITY) -
        (b.salary ?? Number.POSITIVE_INFINITY) || // lower salary first
      b.skillHits - a.skillHits // more skills first
  );

  return rows;
}

function chooseTeam(
  data: Candidate[],
  weights: { exp: number; skill: number; salary: number },
  diversityNudge = true
): { chosen: EvalRow[]; byCat: Record<Category, EvalRow[]> } {
  const byCat = {} as Record<Category, EvalRow[]>;
  for (const cat of TARGET_CATEGORIES)
    byCat[cat] = scoreCategory(data, cat, weights);

  const chosen: EvalRow[] = [];
  const usedCountries = new Map<string, number>();

  for (const cat of TARGET_CATEGORIES) {
    const list = byCat[cat];
    if (!list || list.length === 0) continue;
    let pick = list[0];

    if (diversityNudge && usedCountries.get(pick.location) && list.length > 1) {
      const alt = list[1];
      if (alt.score >= 0.98 * pick.score) pick = alt; // prefer slight runner-up to diversify geography
    }

    chosen.push(pick);
    usedCountries.set(
      pick.location,
      (usedCountries.get(pick.location) ?? 0) + 1
    );
  }

  return { chosen, byCat };
}

// ------------------------------- UI -----------------------------------------

const defaultWeights = { exp: 0.45, skill: 0.35, salary: 0.2 };

function normalizeWeights(w: { exp: number; skill: number; salary: number }) {
  const sum = w.exp + w.skill + w.salary;
  return { exp: w.exp / sum, skill: w.skill / sum, salary: w.salary / sum };
}

function SalaryBadge({ n }: { n: number | null }) {
  return (
    <span className="text-xs rounded-full px-2 py-0.5 bg-emerald-100 text-emerald-700">
      {formatMoney(n)}
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/80 shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-semibold text-gray-800 mb-3">{children}</h2>
  );
}

function toCSV(rows: EvalRow[]): string {
  const header = [
    "Category",
    "Name",
    "Email",
    "Country",
    "Location",
    "SalaryUSD",
    "ExpHits",
    "SkillHits",
    "Score",
  ];
  const body = rows.map((r) =>
    [
      r.category,
      r.name,
      r.email,
      r.location,
      r.salary ?? "",
      r.expHits,
      r.skillHits,
      r.score.toFixed(3),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header.join(","), ...body].join("\n");
}

export default function App() {
  const [weights, setWeights] = useState(defaultWeights);
  const [diversity, setDiversity] = useState(true);

  const W = useMemo(() => normalizeWeights(weights), [weights]);

  const results = useMemo(
    () => chooseTeam(candidates, W, diversity),
    [W, diversity]
  );

  const total = useMemo(() => {
    if (!results) return 0;
    return results.chosen.reduce((acc, r) => acc + (r.salary ?? 0), 0);
  }, [results]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800">
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Startup Hiring Assistant
            </h1>
            <p className="text-sm text-slate-600">
              Select one candidate per role (budget & skill aware) — upload JSON
              or auto‑load attached file.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-800"
              onClick={() => {
                const blob = new Blob([toCSV(results?.chosen ?? [])], {
                  type: "text/csv;charset=utf-8;",
                });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "hiring_slate.csv";
                a.click();
                URL.revokeObjectURL(a.href);
              }}
              disabled={!results || (results?.chosen.length ?? 0) === 0}
            >
              Export CSV
            </button>
          </div>
        </header>

        {/* Controls */}
        <Card>
          <SectionTitle>Scoring Weights</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(
              [
                { key: "exp", label: "Experience", color: "emerald" },
                { key: "skill", label: "Skills", color: "indigo" },
                {
                  key: "salary",
                  label: "Salary (lower is better)",
                  color: "amber",
                },
              ] as const
            ).map(({ key, label, color }) => (
              <div key={key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <span className={`text-${color}-700 text-xs font-medium`}>
                    {(normalizeWeights(weights)[key] * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(W[key] * 100)}
                  onChange={(e) =>
                    setWeights({
                      ...weights,
                      [key]: Number(e.target.value) / 100,
                    })
                  }
                />
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={diversity}
                onChange={(e) => setDiversity(e.target.checked)}
              />
              Apply diversity nudge (country spread)
            </label>
            <div className="ml-auto text-sm text-slate-600">
              Total cost:{" "}
              <span className="font-semibold">{formatMoney(total)}</span>
            </div>
          </div>
        </Card>

        {/* Results */}
        {results && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Recommended team */}
              <Card>
                <SectionTitle>Recommended Hiring Slate</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.chosen.map((r) => (
                    <motion.div
                      key={r.category}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="text-sm text-slate-500">{r.category}</div>

                      <div className="flex items-center justify-between">
                        <div className="mt-1 text-lg font-semibold">
                          {r.name}
                        </div>
                        <SalaryBadge n={r.salary} />
                      </div>

                      <div className="text-xs text-slate-500">{r.email}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {r.location}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 text-center text-xs">
                        <div>
                          <div className="text-slate-400">Exp hits</div>
                          <div className="font-semibold">{r.expHits}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Skill hits</div>
                          <div className="font-semibold">{r.skillHits}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Score</div>
                          <div className="font-semibold">
                            {r.score.toFixed(3)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Transparency: top 3 per category */}
              <Card>
                <SectionTitle>Top 3 per Category</SectionTitle>
                <div className="space-y-4">
                  {TARGET_CATEGORIES.map((cat) => (
                    <div key={cat}>
                      <div className="text-sm font-medium text-slate-700 mb-2">
                        {cat}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {(results.byCat[cat] ?? []).slice(0, 3).map((r, i) => (
                          <div
                            key={r.email + i}
                            className="rounded-xl border border-slate-200 p-3 bg-white"
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-sm truncate mr-2">
                                {i + 1}. {r.name}
                              </div>
                              <SalaryBadge n={r.salary} />
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {r.location}
                            </div>
                            <div className="mt-2 grid grid-cols-3 text-center text-[11px]">
                              <div>
                                <span className="text-slate-400">Exp</span>{" "}
                                {r.expHits}
                              </div>
                              <div>
                                <span className="text-slate-400">Skills</span>{" "}
                                {r.skillHits}
                              </div>
                              <div>
                                <span className="text-slate-400">Score</span>{" "}
                                {r.score.toFixed(3)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar: How it works */}
            <aside>
              <Card>
                <SectionTitle>How the Algorithm Works</SectionTitle>
                <ol className="list-decimal ml-5 text-sm space-y-2 text-slate-700">
                  <li>
                    We check each candidate’s <strong>expected salary</strong> —
                    lower salaries score better for budget-friendliness.
                  </li>
                  <li>
                    We look at their <strong>past job titles</strong> to see if
                    they match the role (e.g. “Full Stack Developer”).
                  </li>
                  <li>
                    We scan their <strong>skills</strong> for keywords relevant
                    to the job.
                  </li>
                  <li>
                    Each of these signals is <strong>scaled fairly</strong> so
                    they can be compared apples-to-apples.
                  </li>
                  <li>
                    We combine them into a single score using the weights you
                    set above.
                  </li>
                  <li>
                    Candidates are ranked by score. If two are close, the system
                    prefers the one with a lower salary or more skills.
                  </li>
                  <li>
                    Finally, we pick the top person for each role. With the
                    diversity option on, we try to spread hires across different
                    countries when possible.
                  </li>
                </ol>
                <p className="text-xs text-slate-500 mt-3">
                  You can adjust the sliders above to give more importance to
                  experience, skills, or budget. The weights always add up to
                  100%.
                </p>
              </Card>
            </aside>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-slate-500">
          Built for a startup with $100M funding: balances seniority, skills,
          and runway.
        </div>
      </div>
    </div>
  );
}
