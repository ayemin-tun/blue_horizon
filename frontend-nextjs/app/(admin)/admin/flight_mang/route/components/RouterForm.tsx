"use client";

import React, { useState } from "react";
import { toast } from "@/services/store/alertStore";

// ─── Lucide Icons Import ───────────────────────────────────────────────────
import { ArrowRight, Loader2 } from "lucide-react";

export interface RoutePayload {
  departure_city: string;
  arrival_city: string;
}

interface RouteFormProps {
  initialData?: RoutePayload;
  onSubmit: (data: RoutePayload) => void;
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
}

export default function RouteForm({ initialData, onSubmit, onCancel, loading, submitLabel }: RouteFormProps) {
  const [form, setForm] = useState<RoutePayload>({
    departure_city: initialData?.departure_city ?? "",
    arrival_city: initialData?.arrival_city ?? "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departure_city.trim() || !form.arrival_city.trim()) {
      toast.warning("Both departure and arrival cities are required.");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Departure City
        </label>
        <input
          id="departure_city"
          name="departure_city"
          type="text"
          value={form.departure_city}
          onChange={handleChange}
          placeholder="e.g. Yangon"
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Arrival City
        </label>
        <input
          id="arrival_city"
          name="arrival_city"
          type="text"
          value={form.arrival_city}
          onChange={handleChange}
          placeholder="e.g. Mandalay"
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
        />
      </div>

      {/* Preview */}
      {(form.departure_city || form.arrival_city) && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
          <span className="text-sm font-semibold text-blue-900">{form.departure_city || "—"}</span>
          <ArrowRight className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-blue-900">{form.arrival_city || "—"}</span>
        </div>
      )}

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