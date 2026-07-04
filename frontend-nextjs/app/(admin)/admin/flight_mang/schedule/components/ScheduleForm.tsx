"use client";

import React, { useState } from "react";
import { Loader2, Clock, Navigation, AlertCircle, Banknote } from "lucide-react"; 
import { Schedule, SchedulePayload } from "@/services/scheduleService";
import FlightSelect from "./FlightSelect";
import RouteSelect from "./RouteSelect";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ScheduleFormProps {
  initialData?: Schedule | null;
  onSubmit: (data: SchedulePayload) => void;
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
}

interface FormErrors {
  flight_id?: string;
  route_id?: string;
  departure_time?: string;
  arrival_time?: string;
  economy_price?: string;
  business_price?: string;
}

export default function ScheduleForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
  submitLabel
}: ScheduleFormProps) {

  // Controlled Form State
  const [form, setForm] = useState<SchedulePayload>({
    flight_id: initialData?.flight_id ?? 0,
    route_id: initialData?.route_id ?? 0,
    flight_type: initialData?.flight_type ?? "OUTBOUND",
    departure_time: initialData?.departure_time ?? "",
    arrival_time: initialData?.arrival_time ?? "",
    economy_price: initialData?.economy_price ?? 0,
    business_price: initialData?.business_price ?? 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Handle Strings & Numbers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numberFields = ["flight_id", "route_id", "economy_price", "business_price"];

    setForm((prev) => ({
      ...prev,
      [name]: numberFields.includes(name) ? Number(value) : value
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Custom Select Dropdowns Handle Functions
  const handleFlightChange = (flightId: number) => {
    setForm((prev) => ({ ...prev, flight_id: flightId }));
    if (errors.flight_id) setErrors((prev) => ({ ...prev, flight_id: undefined }));
  };

  const handleRouteChange = (routeId: number) => {
    setForm((prev) => ({ ...prev, route_id: routeId }));
    if (errors.route_id) setErrors((prev) => ({ ...prev, route_id: undefined }));
  };

  // Form Validation & Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!form.flight_id) {
      newErrors.flight_id = "Please select a valid Flight.";
    }
    if (!form.route_id) {
      newErrors.route_id = "Please select a valid Route.";
    }
    if (!form.departure_time.trim()) {
      newErrors.departure_time = "Departure time is required.";
    }
    if (!form.arrival_time.trim()) {
      newErrors.arrival_time = "Arrival time is required.";
    }
    if (form.economy_price <= 0) {
      newErrors.economy_price = "Economy price must be greater than 0.";
    }
    if (form.business_price <= 0) {
      newErrors.business_price = "Business price must be greater than 0.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* 1. Flight & Route Select Group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FlightSelect
            value={form.flight_id}
            onChange={handleFlightChange}
          />
          {errors.flight_id && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.flight_id}
            </p>
          )}
        </div>

        <div>
          <RouteSelect
            value={form.route_id}
            onChange={handleRouteChange}
          />
          {errors.route_id && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.route_id}
            </p>
          )}
        </div>
      </div>

      {/* 2. Flight Type Select (OUTBOUND / INBOUND) */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Flight Type
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Navigation className="w-4 h-4" />
          </span>
          <select
            name="flight_type"
            value={form.flight_type}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black appearance-none"
          >
            <option value="OUTBOUND">OUTBOUND</option>
            <option value="INBOUND">INBOUND</option>
          </select>
        </div>
      </div>

      {/* 3. Timings (Departure & Arrival Time) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Departure Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Departure Time
          </label>
          <div className="relative datepicker-wrapper">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-50">
              <Clock className="w-4 h-4" />
            </span>
            <DatePicker
              selected={
                form.departure_time
                  ? (() => {
                    const [hrs, mins] = form.departure_time.split(":").map(Number);
                    const d = new Date();
                    d.setHours(hrs, mins, 0, 0);
                    return d;
                  })()
                  : null
              }
              onChange={(date: Date | null) => {
                if (date) {
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  setForm(prev => ({ ...prev, departure_time: `${hours}:${minutes}` }));
                  if (errors.departure_time) setErrors((prev) => ({ ...prev, departure_time: undefined }));
                }
              }}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              timeFormat="hh:mm aa"
              dateFormat="hh:mm aa"
              placeholderText="Select Departure Time"
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${errors.departure_time ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'}`}
            />
          </div>
          {errors.departure_time && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.departure_time}
            </p>
          )}
        </div>

        {/* Arrival Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Arrival Time
          </label>
          <div className="relative datepicker-wrapper">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-50">
              <Clock className="w-4 h-4" />
            </span>
            <DatePicker
              selected={
                form.arrival_time 
                  ? (() => {
                    const [hrs, mins] = form.arrival_time.split(":").map(Number); 
                    const d = new Date();
                    d.setHours(hrs, mins, 0, 0);
                    return d;
                  })()
                  : null
              }
              onChange={(date: Date | null) => {
                if (date) {
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  setForm(prev => ({ ...prev, arrival_time: `${hours}:${minutes}` }));
                  if (errors.arrival_time) setErrors((prev) => ({ ...prev, arrival_time: undefined }));
                }
              }}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              timeFormat="hh:mm aa"
              dateFormat="hh:mm aa"
              placeholderText="Select Arrival Time"
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${errors.arrival_time ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'}`}
            />
          </div>
          {errors.arrival_time && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.arrival_time}
            </p>
          )}
        </div>
      </div>

      {/* 4. Pricing (Economy & Business Price) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Economy Price */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Economy Price (MMK)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Banknote className="w-4 h-4" /> 
            </span>
            <input
              name="economy_price"
              type="number"
              value={form.economy_price || ""}
              onChange={handleChange}
              placeholder="e.g. 200000" 
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.economy_price ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'}`}
            />
          </div>
          {errors.economy_price && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.economy_price}
            </p>
          )}
        </div>

        {/* Business Price */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Business Price (MMK) 
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Banknote className="w-4 h-4" />
            </span>
            <input
              name="business_price"
              type="number"
              value={form.business_price || ""}
              onChange={handleChange}
              placeholder="e.g. 350000"
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.business_price ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'}`}
            />
          </div>
          {errors.business_price && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.business_price}
            </p>
          )}
        </div>
      </div>

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