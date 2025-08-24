import { type EvaluationRow } from "../types";

export const convertToCSV = (rows: EvaluationRow[]): string => {
  const headers = [
    "Category",
    "Name",
    "Email",
    "Location",
    "SalaryUSD",
    "ExperienceHits",
    "SkillHits",
    "Score",
  ];

  const data = rows.map((row) => [
    row.category,
    row.name,
    row.email,
    row.location,
    row.salary ?? "",
    row.experienceHits,
    row.skillHits,
    row.score.toFixed(3),
  ]);

  const escapeValue = (value: string): string => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const headerRow = headers.map(escapeValue).join(",");
  const dataRows = data.map((row) =>
    row.map(String).map(escapeValue).join(",")
  );

  return [headerRow, ...dataRows].join("\n");
};
