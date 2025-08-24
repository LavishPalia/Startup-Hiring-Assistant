export interface WorkExp {
  roleName?: string | null;
  [k: string]: unknown;
}

export interface SalaryBlock {
  "full-time"?: string | number | null;
  [k: string]: unknown;
}

export interface Candidate {
  name?: string | null;
  email?: string | null;
  location?: string | null;
  annual_salary_expectation?: SalaryBlock | null;
  skills?: (string | null)[] | null;
  work_experiences?: WorkExp[] | null;
  [k: string]: unknown;
}

export type Category =
  | "Full Stack Developer"
  | "Marketing Specialist"
  | "Accounting"
  | "Cybersecurity Analyst"
  | "Data Scientist";

export interface EvaluationRow {
  index: number;
  category: Category;
  name: string;
  email: string;
  location: string;
  salary: number | null;
  experienceHits: number;
  skillHits: number;
  score: number;
  raw: Candidate;
}

export interface TeamSelectionResult {
  selected: EvaluationRow[];
  byCategory: Record<Category, EvaluationRow[]>;
}

export interface WeightConfig {
  experience: number;
  skills: number;
  salary: number;
}
