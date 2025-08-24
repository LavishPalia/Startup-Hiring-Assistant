import {
  type Candidate,
  type Category,
  type EvaluationRow,
  type TeamSelectionResult,
  type WeightConfig,
} from "../types";
import { normalizeString } from "./formatter";
import { CATEGORY_CONFIG, TARGET_CATEGORIES } from "../constants/categories";

export const parseSalary = (candidate: Candidate): number | null => {
  try {
    const raw = candidate.annual_salary_expectation?.["full-time"];
    if (raw == null) return null;

    const numericString = String(raw).replace(/[^\d.-]/g, "");
    const parsedValue = parseFloat(numericString);

    return isNaN(parsedValue) ? null : Math.round(parsedValue);
  } catch {
    return null;
  }
};

export const calculateExperienceHits = (
  candidate: Candidate,
  keywords: string[]
): number => {
  const roles = candidate.work_experiences ?? [];
  let hits = 0;

  for (const role of roles) {
    const roleName = normalizeString(role.roleName);
    if (!roleName) continue;

    if (
      keywords.some((keyword) => roleName.includes(normalizeString(keyword)))
    ) {
      hits += 1;
    }
  }

  return hits;
};

export const calculateSkillHits = (
  candidate: Candidate,
  keywords: string[]
): number => {
  const skills = (candidate.skills ?? [])
    .map((skill) => normalizeString(String(skill ?? "")))
    .filter((skill) => skill.length > 0);

  let hits = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeString(keyword);
    if (
      skills.some(
        (skill) =>
          skill === normalizedKeyword || skill.includes(normalizedKeyword)
      )
    ) {
      hits += 1;
    }
  }

  return hits;
};

export const scoreCandidatesForCategory = (
  candidates: Candidate[],
  category: Category,
  weights: WeightConfig
): EvaluationRow[] => {
  const config = CATEGORY_CONFIG[category];
  const roleKeywords = config.role_keywords.map(normalizeString);
  const skillKeywords = config.skill_keywords.map(normalizeString);

  const rows: EvaluationRow[] = [];

  candidates.forEach((candidate, index) => {
    const experienceHits = calculateExperienceHits(candidate, roleKeywords);
    if (experienceHits === 0) return;

    const skillHits = calculateSkillHits(candidate, skillKeywords);
    const salary = parseSalary(candidate);

    const name =
      candidate.name?.toString() ||
      candidate.email?.toString().split("@")[0] ||
      `Candidate_${index + 1}`;
    const email = candidate.email?.toString() || "";
    const location = candidate.location?.toString() || "";

    rows.push({
      index,
      category,
      name,
      email,
      location,
      salary,
      experienceHits,
      skillHits,
      score: 0,
      raw: candidate,
    });
  });

  if (rows.length === 0) return [];

  const maxExperience = Math.max(1, ...rows.map((row) => row.experienceHits));
  const maxSkills = Math.max(1, ...rows.map((row) => row.skillHits));

  const salaries = rows
    .map((row) => row.salary)
    .filter((salary): salary is number => salary !== null);

  const minSalary = salaries.length ? Math.min(...salaries) : 0;
  const maxSalary = salaries.length ? Math.max(...salaries) : 1;
  const salaryRange = Math.max(1, maxSalary - minSalary);

  for (const row of rows) {
    const experienceScore = row.experienceHits / maxExperience;
    const skillsScore = row.skillHits / maxSkills;
    const salaryScore =
      row.salary === null ? 0.5 : 1 - (row.salary - minSalary) / salaryRange;

    row.score =
      weights.experience * experienceScore +
      weights.skills * skillsScore +
      weights.salary * salaryScore;
  }

  rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.salary !== b.salary) {
      const aSalary = a.salary ?? Number.POSITIVE_INFINITY;
      const bSalary = b.salary ?? Number.POSITIVE_INFINITY;
      return aSalary - bSalary;
    }
    return b.skillHits - a.skillHits;
  });

  return rows;
};

export const selectTeam = (
  candidates: Candidate[],
  weights: WeightConfig,
  enableDiversityNudge: boolean = true
): TeamSelectionResult => {
  const byCategory = {} as Record<Category, EvaluationRow[]>;

  for (const category of TARGET_CATEGORIES) {
    byCategory[category] = scoreCandidatesForCategory(
      candidates,
      category,
      weights
    );
  }

  const selected: EvaluationRow[] = [];
  const locationCounts = new Map<string, number>();

  for (const category of TARGET_CATEGORIES) {
    const candidatesForCategory = byCategory[category];
    if (!candidatesForCategory || candidatesForCategory.length === 0) continue;

    let selectedCandidate = candidatesForCategory[0];

    if (enableDiversityNudge && candidatesForCategory.length > 1) {
      const currentLocationCount =
        locationCounts.get(selectedCandidate.location) || 0;

      const alternativeCandidate = candidatesForCategory.find(
        (candidate) =>
          candidate.score >= selectedCandidate.score * 0.98 &&
          candidate.location !== selectedCandidate.location &&
          (locationCounts.get(candidate.location) || 0) <= currentLocationCount
      );

      if (alternativeCandidate) {
        selectedCandidate = alternativeCandidate;
      }
    }

    selected.push(selectedCandidate);
    locationCounts.set(
      selectedCandidate.location,
      (locationCounts.get(selectedCandidate.location) || 0) + 1
    );
  }

  return { selected, byCategory };
};

export const normalizeWeights = (weights: WeightConfig): WeightConfig => {
  const total = weights.experience + weights.skills + weights.salary;
  return {
    experience: weights.experience / total,
    skills: weights.skills / total,
    salary: weights.salary / total,
  };
};
