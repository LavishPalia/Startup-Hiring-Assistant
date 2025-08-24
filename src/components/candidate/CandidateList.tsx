import React from "react";
import { type EvaluationRow } from "../../types";
import { CandidateCard } from "./CandidateCard";

interface CandidateListProps {
  candidates: EvaluationRow[];
  columns?: number;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  columns = 2,
}) => {
  const gridClass = `grid grid-cols-1 ${
    columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
  } gap-4`;

  return (
    <div className={gridClass}>
      {candidates.map((candidate) => (
        <CandidateCard
          key={`${candidate.category}-${candidate.email}`}
          candidate={candidate}
        />
      ))}
    </div>
  );
};
