"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface BaseSelectProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: any) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: LucideIcon; 
  error?: string;
  disabled?: boolean;
}

export default function BaseSelectBox({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "-- Choose an option --",
  icon: Icon, 
  error,
  disabled = false,
}: BaseSelectProps) {
  return (
    <div className="w-full">
      {/* Input Label */}
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
      </label>
      
      <div className="relative">
        {Icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10">
            <Icon className="w-4 h-4" />
          </span>
        )}

        <select
          name={name}
          value={value || ""}
          onChange={(e) => {
            const val = e.target.value;
            onChange(isNaN(Number(val)) || val === "" ? val : Number(val));
          }}
          disabled={disabled}
          className={`w-full pr-10 py-2.5 text-sm border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black appearance-none ${
            Icon ? "pl-10" : "pl-4"
          } ${error ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200"}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt, idx) => (
            <option key={`${opt.value}-${idx}`} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
          ▼
        </span>
      </div>
      {error && <p className="text-xs text-rose-500 mt-1 pl-1">{error}</p>}
    </div>
  );
}