"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlightResult } from "@/services/BookingService";
import { useBookingStore } from "@/services/store/bookingStore";

interface FlightCardProps {
  flight: FlightResult;
}

// Duration formatter
export const formatDuration = (duration: string) => {
  const [h, m] = duration.split(":").map(Number);
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}min`);
  return parts.join(" ") || duration;
};

export default function FlightCard({ flight }: FlightCardProps) {
  const lowSeats = flight.seats_available <= 5;
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const router = useRouter();
  const setFlight = useBookingStore((s) => s.setFlight);

  const handleBook = (seatClass: "economy" | "business") => {
    setFlight(flight, seatClass);
    router.push("/choose-seat");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 hover:shadow-md transition space-y-4">
      {/* Main Row Container */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">

        {/* Airline Info */}
        <div className="flex items-center gap-4 w-full lg:w-56 shrink-0 pb-3 lg:pb-0 border-b border-slate-50 lg:border-none">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-blue-900 font-bold">
            {flight.airline_name.substring(0, 1)}
          </div>
          <div>
            <p className="text-xs font-bold text-blue-900 uppercase leading-tight">{flight.airline_name}</p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">{flight.flight_no}</p>
          </div>
        </div>

        {/* Route Times & Duration */}
        <div className="flex items-center gap-4 flex-1 w-full">
          <div className="text-center shrink-0 min-w-15">
            <p className="text-lg sm:text-xl font-bold text-blue-900 leading-tight">{flight.departure_time}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{flight.departure_city}</p>
          </div>

          {/* Progress bar line */}
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-semibold mb-1">{formatDuration(flight.duration)}</span>
            <div className="w-full flex items-center">
              <div className="w-1.5 h-1.5 rounded-full border border-blue-900 bg-white" />
              <div className="flex-1 h-px bg-blue-900" />
              <div className="w-1.5 h-1.5 rounded-full border border-blue-900 bg-white" />
            </div>
            <span className="text-[9px] text-slate-400 font-medium mt-1 lg:hidden">Direct</span>
          </div>

          <div className="text-center shrink-0 min-w-15">
            <p className="text-lg sm:text-xl font-bold text-blue-900 leading-tight">{flight.arrival_time}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{flight.arrival_city}</p>
          </div>
        </div>

        {/* Desktop Line Divider */}
        <div className="hidden lg:block w-px h-16 bg-slate-100" />

        {/* Price & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t border-slate-50 lg:border-none w-full lg:w-auto">

          {/* Price Box */}
          <div className="w-full sm:w-36 text-left sm:text-center shrink-0 flex sm:flex-col justify-between items-center sm:justify-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Economy</p>
              <p className="text-lg font-bold text-blue-900 mt-0.5">MMK {flight.economy_price.toLocaleString()}</p>
            </div>
            <p className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded sm:bg-transparent ${lowSeats ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50"}`}>
              {flight.seats_available} seats left
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full sm:w-36 shrink-0 flex flex-row sm:flex-col gap-2">
            <button
              onClick={() => handleBook("economy")}
              className="flex-1 sm:w-full bg-blue-900 text-white font-bold py-2.5 rounded-md text-[10px] uppercase hover:bg-blue-950 transition tracking-wider active:scale-95"
            >
              Book
            </button>
            <button
              onClick={() => handleBook("business")}
              className="flex-1 sm:w-full border border-blue-900 text-blue-900 font-bold rounded-md py-2 sm:py-1.5 text-[10px] uppercase hover:bg-blue-50 transition tracking-wider active:scale-95"
            >
              Business <span className="sm:block lg:inline block font-medium">({flight.business_price.toLocaleString()})</span>
            </button>
          </div>

        </div>
      </div>

      {/* Flight Detail Panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isDetailOpen ? "max-h-40 opacity-100 border-t border-slate-100 pt-4 mt-4" : "max-h-0 opacity-0"}`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* flight date */}
          <div>
            <p className="text-slate-400 font-medium">Flight Date</p>
            <p className="text-slate-800 font-bold mt-0.5">
              {flight.flight_date || "N/A"}
            </p>
          </div>

          {/* Default */}
          <div>
            <p className="text-slate-400 font-medium">Baggage Allowance</p>
            <p className="text-slate-800 font-bold mt-0.5">
              20 KG (Check-in) / 7 KG (Cabin)
            </p>
          </div>

          <div>
            <p className="text-slate-400 font-medium">Route Type</p>
            <p className="text-slate-800 font-bold mt-0.5 uppercase">
              {flight.departure_city} → {flight.arrival_city} (Direct)
            </p>
          </div>

          {/* Refund Policy*/}
          <div>
            <p className="text-slate-400 font-medium">Refund Policy</p>
            <p className="text-amber-600 font-bold mt-0.5">
              Non-Refundable
            </p>
          </div>
        </div>
      </div>

      {/* Detail Footer Button with active animation */}
      <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
        <button
          type="button"
          onClick={() => setIsDetailOpen(!isDetailOpen)}
          className="text-xs font-semibold text-blue-900 hover:text-blue-950 transition flex items-center gap-1.5 select-none"
        >
          Flight Detail
          <span className={`text-[9px] transition-transform duration-200 ${isDetailOpen ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>
      </div>
    </div>
  );
}