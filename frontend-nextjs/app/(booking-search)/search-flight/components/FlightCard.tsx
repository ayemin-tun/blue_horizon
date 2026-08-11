"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlightResult } from "@/services/BookingService";
import { useBookingStore } from "@/services/store/bookingStore";
import { formatDuration, formatDisplayTime } from "@/utils/timeHelper";

interface FlightCardProps {
  flight: FlightResult;
}

export default function FlightCard({ flight }: FlightCardProps) {
  const isEconomyLow = flight.economy_seats_available > 0 && flight.economy_seats_available <= 5;
  const isBusinessLow = flight.business_seats_available > 0 && flight.business_seats_available <= 3;
  const totalSeatsLeft = flight.economy_seats_available + flight.business_seats_available;

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const router = useRouter();
  const setFlight = useBookingStore((s) => s.setFlight);

  const handleBook = (seatClass: "economy" | "business") => {
    setFlight(flight, seatClass);
    router.push("/choose-seat");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Top Main Section */}
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          {/* 1. Airline & Flight Info */}
          <div className="flex items-center gap-3.5 min-w-[180px] shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center shrink-0 text-white font-black text-lg shadow-sm">
              {flight.airline_name.substring(0, 1)}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-tight leading-tight">
                {flight.airline_name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {flight.flight_no}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {totalSeatsLeft} seats left
                </span>
              </div>
            </div>
          </div>

          {/* 2. Departure -> Arrival Timeline */}
          <div className="flex items-center gap-3 sm:gap-6 flex-1 max-w-md mx-auto w-full px-2">
            <div className="text-left sm:text-center shrink-0 min-w-[70px]">
              <p className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {formatDisplayTime(flight.departure_time)}
              </p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                {flight.departure_city}
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {formatDuration(flight.duration)}
              </span>
              <div className="w-full flex items-center gap-1">
                <div className="w-2 h-2 rounded-full border-2 border-blue-900 bg-white shrink-0" />
                <div className="flex-1 h-[2px] bg-gradient-to-r from-blue-900 via-indigo-600 to-blue-900" />
                <div className="w-2 h-2 rounded-full border-2 border-blue-900 bg-white shrink-0" />
              </div>
              <span className="text-[10px] font-medium text-slate-400 mt-1">Direct</span>
            </div>

            <div className="text-right sm:text-center shrink-0 min-w-[70px]">
              <p className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {formatDisplayTime(flight.arrival_time)}
              </p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                {flight.arrival_city}
              </p>
            </div>
          </div>

          {/* 3. Class Booking Cards / Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">

            {/* Economy Card Option */}
            <div className="flex flex-col justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition min-w-[150px]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Economy</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  flight.economy_seats_available <= 0
                    ? "bg-slate-200 text-slate-600"
                    : isEconomyLow
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}>
                  {flight.economy_seats_available <= 0 ? "Sold Out" : `${flight.economy_seats_available} left`}
                </span>
              </div>
              <p className="text-base font-black text-blue-950 mb-2">
                MMK {flight.economy_price.toLocaleString()}
              </p>
              <button
                onClick={() => handleBook("economy")}
                disabled={flight.economy_seats_available <= 0}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1 ${
                  flight.economy_seats_available <= 0
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed active:scale-100"
                    : "bg-blue-900 text-white hover:bg-blue-950 shadow-sm"
                }`}
              >
                {flight.economy_seats_available <= 0 ? "Sold Out" : "Book Economy"}
              </button>
            </div>

            {/* Business Card Option */}
            <div className="flex flex-col justify-between p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/30 hover:bg-amber-50/50 transition min-w-[150px]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Business</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  flight.business_seats_available <= 0
                    ? "bg-slate-200 text-slate-600"
                    : isBusinessLow
                    ? "bg-amber-200 text-amber-900"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {flight.business_seats_available <= 0 ? "Sold Out" : `${flight.business_seats_available} left`}
                </span>
              </div>
              <p className="text-base font-black text-amber-950 mb-2">
                MMK {flight.business_price.toLocaleString()}
              </p>
              <button
                onClick={() => handleBook("business")}
                disabled={flight.business_seats_available <= 0}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1 ${
                  flight.business_seats_available <= 0
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed active:scale-100"
                    : "bg-amber-900 text-white hover:bg-amber-950 shadow-sm"
                }`}
              >
                {flight.business_seats_available <= 0 ? "Sold Out" : "Book Business"}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Flight Detail Collapsible Panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out bg-slate-50/70 border-t ${
          isDetailOpen ? "max-h-48 border-slate-200 opacity-100" : "max-h-0 border-transparent opacity-0"
        }`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs p-5">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flight Date</p>
            <p className="text-xs font-bold text-slate-800 mt-1">
              {flight.flight_date || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Baggage Allowance</p>
            <p className="text-xs font-bold text-slate-800 mt-1">
              20 KG (Check-in) / 7 KG (Cabin)
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Route Type</p>
            <p className="text-xs font-bold text-slate-800 mt-1 uppercase">
              {flight.departure_city} → {flight.arrival_city} (Direct)
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Refund Policy</p>
            <p className="text-xs font-bold text-amber-700 mt-1">
              Non-Refundable
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar / Details Toggle */}
      <div className="px-5 py-2.5 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsDetailOpen(!isDetailOpen)}
          className="text-xs font-bold text-blue-900 hover:text-blue-950 transition flex items-center gap-1.5 select-none"
        >
          Flight Details
          <span className={`text-[10px] transition-transform duration-200 ${isDetailOpen ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>
      </div>
    </div>
  );
}