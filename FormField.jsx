import React from "react";
import Tooltip from "./Tooltip.jsx";

export default function FormField({
  label,
  unit,
  tooltip,
  error,
  value,
  onChange,
  placeholder,
  min,
  max,
  step = "any",
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-ink dark:text-slate-200 mb-1.5">
        {label}
        {unit && <span className="text-xs text-slate-400 font-normal">({unit})</span>}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`input-field ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : ""}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
