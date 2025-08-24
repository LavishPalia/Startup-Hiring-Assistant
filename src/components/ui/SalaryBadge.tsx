import React from "react";
import { formatCurrency } from "../../utils/formatter";

interface SalaryBadgeProps {
  amount: number | null;
}

export const SalaryBadge: React.FC<SalaryBadgeProps> = ({ amount }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
      {formatCurrency(amount)}
    </span>
  );
};
