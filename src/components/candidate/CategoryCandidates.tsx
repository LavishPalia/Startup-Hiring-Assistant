import React from "react";
import { type Category, type EvaluationRow } from "../../types";
import { CandidateCard } from "./CandidateCard";

interface CategoryCandidatesProps {
  category: Category;
  candidates: EvaluationRow[];
}

export const CategoryCandidates: React.FC<CategoryCandidatesProps> = ({
  category,
  candidates,
}) => {
  return (
    <div>
      <h3 className="text-md font-medium text-slate-800 mb-3">{category}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {candidates.slice(0, 3).map((candidate, index) => (
          <CandidateCard
            key={`${category}-${candidate.email}`}
            candidate={candidate}
            showCategory={false}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
};
