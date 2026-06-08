/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: "rose" | "emerald" | "blue" | "indigo" | "amber" | "slate";
  showValue?: boolean;
  valueSuffix?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  color = "rose",
  showValue = true,
  valueSuffix = ""
}: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  const barColors = {
    rose: "bg-rose-500",
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    amber: "bg-amber-500",
    slate: "bg-slate-500"
  };

  const trackColors = {
    rose: "bg-rose-50/50 border-rose-100",
    emerald: "bg-emerald-50/50 border-emerald-100",
    blue: "bg-blue-50/50 border-blue-100",
    indigo: "bg-indigo-50/50 border-indigo-100",
    amber: "bg-amber-50/50 border-amber-100",
    slate: "bg-slate-100/50 border-slate-200"
  };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              {label}
            </span>
          )}
          {showValue && (
            <span className="font-mono text-xs font-bold text-neutral-800">
              {value.toLocaleString()}{valueSuffix}
            </span>
          )}
        </div>
      )}
      <div className={`h-2.5 w-full rounded-full border p-[1px] ${trackColors[color]}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColors[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
