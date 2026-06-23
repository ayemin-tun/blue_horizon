"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export default function Input({ label, id, type = "text", ...props }: InputProps): React.JSX.Element {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-800 mb-2">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-all focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-sm placeholder-slate-400"
        {...props}
      />
    </div>
  );
}