import React from "react";
import { motion } from "framer-motion";
import { type EvaluationRow } from "../../types";
import { SalaryBadge } from "../ui/SalaryBadge";

interface CandidateCardProps {
  candidate: EvaluationRow;
  showCategory?: boolean;
  rank?: number;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  showCategory = true,
  rank,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-lg border border-slate-200 p-4 bg-white"
    >
      {showCategory && (
        <div className="text-sm text-slate-500 mb-1">{candidate.category}</div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-900 truncate">
          {rank && `${rank}. `}
          {candidate.name}
        </h3>
        <SalaryBadge amount={candidate.salary} />
      </div>

      <div className="text-xs text-slate-500 truncate mb-2">
        {candidate.email}
      </div>
      <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        {candidate.location}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-slate-50 rounded">
          <div className="text-slate-400 mb-1">Exp</div>
          <div className="font-semibold text-slate-900">
            {candidate.experienceHits}
          </div>
        </div>
        <div className="p-2 bg-slate-50 rounded">
          <div className="text-slate-400 mb-1">Skills</div>
          <div className="font-semibold text-slate-900">
            {candidate.skillHits}
          </div>
        </div>
        <div className="p-2 bg-slate-50 rounded">
          <div className="text-slate-400 mb-1">Score</div>
          <div className="font-semibold text-slate-900">
            {candidate.score.toFixed(2)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
