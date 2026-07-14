"use client";

import React, { useState } from "react";
import { Loader2, Clock, Navigation, AlertCircle, Banknote, ChevronDown, ChevronUp } from "lucide-react";
import { Schedule, SchedulePayload } from "@/services/scheduleService";
import FlightSelect from "./FlightSelect";
import RouteSelect from "./RouteSelect";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ScheduleFormPreview from "./ScheduleFormPreview";
import { useFlightsQuery } from "@/services/flightService";
import { useRoutesQuery } from "@/services/routeService";

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

  // Accordion open/close state for Business Rules
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const { data: flightsRes } = useFlightsQuery(1, 100, "");
  const { data: routesRes } = useRoutesQuery(1, 100, "");

  const flightsList = (flightsRes?.data as any)?.flights || [];
  const routesList = (routesRes?.data as any) || [];

  const selectedFlightObj = flightsList.find((f: any) => f.flight_id === form.flight_id);
  const selectedRouteObj = routesList.find((r: any) => r.route_id === form.route_id);

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
    setForm((prev) => ({
      ...prev,
      route_id: routeId,
    }));

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

      {/* Right Side: Preview Field & Accordion Rules */}
      <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-4 space-y-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Real-time Preview</p>

        {form.flight_id > 0 || form.route_id > 0 ? (
          <ScheduleFormPreview
            flightId={form.flight_id}
            routeId={form.route_id}
            departureTime={form.departure_time}
            arrivalTime={form.arrival_time}
            economyPrice={form.economy_price}
            businessPrice={form.business_price}
            flightNo={selectedFlightObj?.flight_no}
            airlineName={selectedFlightObj?.airline?.airline_name || selectedFlightObj?.airline_name}
            routeDetails={selectedRouteObj?.route_details || (selectedRouteObj ? `${selectedRouteObj.departure_city} ➔ ${selectedRouteObj.arrival_city}` : undefined)}
          />
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-55">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8 5.3 6.2c-.6-.1-1.2.1-1.5.6l-.3.5c-.2.5-.1 1.1.4 1.4l6.9 3.8-3.8 3.8-2.6-.7c-.5-.1-1 .1-1.3.5l-.3.4c-.2.4-.1.9.3 1.1l4.5 2.3 2.3 4.5c.2.4.7.5 1.1.3l.4-.3c.4-.3.6-.8.5-1.3l-.7-2.6 3.8-3.8 3.8 6.9c.3.5.9.6 1.4.4l.5-.3c.5-.3.7-.9.6-1.5z" /></svg>
            </div>
            <p className="text-xs font-semibold text-slate-500">No Schedule Selected</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-55">
              Please select a flight and route to view the live ticket preview here.
            </p>
          </div>
        )}

        {/* ⚡ Accordion: Schedule Business Rules */}
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl overflow-hidden transition-all duration-300">
          <button
            type="button"
            onClick={() => setIsRulesOpen(!isRulesOpen)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-amber-100/30 transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider">Schedule Business Rules</span>
            </div>
            {isRulesOpen ? (
              <ChevronUp className="w-4 h-4 text-amber-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-600" />
            )}
          </button>

          {isRulesOpen && (
            <div className="px-4 pb-4.5 space-y-3 border-t border-amber-100/50 pt-3">
              <ul className="space-y-3.5 text-[11px] leading-relaxed text-amber-900/80">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>
                    <strong>Dynamic Flight Direction:</strong> Flight direction is determined dynamically. The first route assigned to a flight automatically becomes <code className="bg-amber-100/80 px-1 py-0.5 rounded text-amber-900 font-mono text-[10px]">OUTBOUND</code>, while the matching return route will be auto-detected as <code className="bg-amber-100/80 px-1 py-0.5 rounded text-amber-900 font-mono text-[10px]">INBOUND</code> by the backend.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>
                    <strong>Turnaround Time Rule:</strong> There must be a minimum ground turnaround time of <strong>3 hours (180 minutes)</strong> between the arrival of the outbound flight and the departure of the inbound flight.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>
                    <strong>Pricing Rule:</strong> Business Class ticket pricing must strictly be higher than Economy Class pricing.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Left Side: Form Fields  */}
      <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-7">

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
        <div className="flex gap-3 pt-4 border-t border-slate-100">
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
    </div>
  );
}