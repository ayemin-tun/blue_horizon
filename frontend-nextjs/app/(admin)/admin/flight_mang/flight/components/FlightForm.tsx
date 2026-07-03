"use client";

import React, { useState } from "react";
import { toast } from "@/services/store/alertStore";
import { Loader2, Plane, Armchair } from "lucide-react";
import { Flight, FlightPayload } from "@/services/flightService";
import AirlineSelect from "./AirlineSelect";
import FlightFormPreview from "./FlightFormPreview";


interface FlightFormProps {
  initialData?: Flight | null;
  onSubmit: (data: FlightPayload) => void;
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
}

export default function FlightForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
  submitLabel
}: FlightFormProps) {

  // Controlled Form State
  const [form, setForm] = useState<FlightPayload>({
    airline_id: initialData?.airline_id ?? 0,
    flight_no: initialData?.flight_no ?? "",
    total_seats: initialData?.total_seats ?? 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: name === "flight_no" ? value : Number(value) 
    }));
  };

  const handleAirlineChange = (airlineId: number) => {
    setForm((prev) => ({ ...prev, airline_id: airlineId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.airline_id) {
      toast.warning("Please select a valid Airline.");
      return;
    }
    if (!form.flight_no.trim()) {
      toast.warning("Flight Number is required.");
      return;
    }
    if (form.total_seats <= 0) {
      toast.warning("Total Seats must be greater than 0.");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Airline Select Dropdown */}
      <AirlineSelect 
        value={form.airline_id} 
        onChange={handleAirlineChange} 
      />

      {/* Flight Number Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Flight Number
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Plane className="w-4 h-4" />
          </span>
          <input
            name="flight_no"
            type="text"
            value={form.flight_no}
            onChange={handleChange}
            placeholder="e.g. BH-101"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
          />
        </div>
      </div>

      {/* Total Seats Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Total Seats
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Armchair className="w-4 h-4" />
          </span>
          <input
            name="total_seats"
            type="number"
            value={form.total_seats || ""}
            onChange={handleChange}
            placeholder="e.g. 120"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      {/*flight preview*/}
      <FlightFormPreview 
        flightNo={form.flight_no}
        totalSeats={form.total_seats}
        airlineId={form.airline_id}
      />

      {/* Action Buttons */}
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