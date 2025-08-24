import React from "react";

interface WeightSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  colorClass: string;
}

export const WeightSlider: React.FC<WeightSliderProps> = ({
  label,
  value,
  onChange,
  colorClass,
}) => {
  const percentage = Math.round(value * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{label}</span>
        <span
          className={`text-xs font-medium ${colorClass.replace(
            "bg-",
            "text-"
          )}`}
        >
          {percentage}%
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={percentage}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${colorClass} 0%, ${colorClass} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
          }}
        />
        <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 rounded-lg pointer-events-none">
          <div
            className={`h-2 rounded-l-lg ${colorClass}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
