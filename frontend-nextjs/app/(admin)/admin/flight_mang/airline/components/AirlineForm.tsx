"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/services/store/alertStore";
import { Loader2 } from "lucide-react";

export interface AirlinePayload {
  airline_name: string;

  country: string;
}

interface AirlineFormProps {
  initialData?: AirlinePayload;
  onSubmit: (data: AirlinePayload) => void;
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
}

export default function AirlineForm({ initialData, onSubmit, onCancel, loading, submitLabel }: AirlineFormProps) {
  const [form, setForm] = useState<AirlinePayload>({
    airline_name: initialData?.airline_name ?? "",

    country: initialData?.country ?? "",
  });

  // change initial data on edit form
  useEffect(() => {
    if (initialData) {
      setForm({
        airline_name: initialData.airline_name ?? "",
       
        country: initialData.country ?? "",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.airline_name.trim()  || !form.country.trim()) {
      toast.warning("All fields are required.");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 1. Airline Name Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Airline Name
        </label>
        <input
          id="airline_name"
          name="airline_name"
          type="text"
          value={form.airline_name}
          onChange={handleChange}
          placeholder="e.g. Myanmar National Airlines"
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
        />
      </div>
      
     

      {/* 3. Country Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Country
        </label>
        <input
          id="country"
          name="country"
          type="text"
          value={form.country}
          onChange={handleChange}
          placeholder="e.g. Myanmar"
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
        />
      </div>

      {/* Actions Button Area */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2 focus:outline-none"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}