import React from "react";
import { type WeightConfig } from "../../types";
import { Card } from "../ui/Card";
import { SectionTitle } from "../ui/SectionTitle";
import { WeightSlider } from "../ui/WeightSlider";
import { normalizeWeights } from "../../utils/scoring";
import { formatCurrency } from "../../utils/formatter";

interface WeightControlsProps {
  weights: WeightConfig;
  onWeightsChange: (weights: WeightConfig) => void;
  enableDiversity: boolean;
  onDiversityChange: (enabled: boolean) => void;
  totalCost: number;
}

export const WeightControls: React.FC<WeightControlsProps> = ({
  weights,
  onWeightsChange,
  enableDiversity,
  onDiversityChange,
  totalCost,
}) => {
  const normalizedWeights = normalizeWeights(weights);

  const handleWeightChange = (key: keyof WeightConfig, value: number) => {
    onWeightsChange({ ...weights, [key]: value });
  };

  return (
    <Card className="mb-6">
      <SectionTitle>Scoring Weights</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <WeightSlider
          label="Experience"
          value={normalizedWeights.experience}
          onChange={(value) => handleWeightChange("experience", value)}
          colorClass="bg-emerald-500"
        />
        <WeightSlider
          label="Skills"
          value={normalizedWeights.skills}
          onChange={(value) => handleWeightChange("skills", value)}
          colorClass="bg-indigo-500"
        />
        <WeightSlider
          label="Salary (lower is better)"
          value={normalizedWeights.salary}
          onChange={(value) => handleWeightChange("salary", value)}
          colorClass="bg-amber-500"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-slate-100">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enableDiversity}
            onChange={(e) => onDiversityChange(e.target.checked)}
            className="rounded text-slate-900 focus:ring-slate-900"
          />
          Apply diversity nudge (location spread)
        </label>
        <div className="sm:ml-auto text-sm text-slate-700">
          Total cost:{" "}
          <span className="font-semibold">{formatCurrency(totalCost)}</span>
        </div>
      </div>
    </Card>
  );
};
