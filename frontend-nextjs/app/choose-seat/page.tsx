"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/services/store/bookingStore";
import { formatDuration } from "@/app/search-flight/components/FlightCard";

const MAX_SEATS = 5;

// ─── Flight Summary Strip ─────────────────────────────────────────────────
function FlightSummary() {
  const { selectedFlight, seatClass } = useBookingStore();
  if (!selectedFlight) return null;

  const price =
    seatClass === "business"
      ? selectedFlight.business_price
      : selectedFlight.economy_price;

  return (
    <div className="bg-white border border-slate-100 rounded-xl px-6 py-4 flex flex-wrap items-center gap-x-8 gap-y-3 shadow-sm mb-6">
      {/* Airline */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Airline</p>
        <p className="text-sm font-bold text-blue-900">{selectedFlight.airline_name}</p>
        <p className="text-[10px] text-slate-400 font-semibold">{selectedFlight.flight_no}</p>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-lg font-bold text-blue-900">{selectedFlight.departure_time}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">{selectedFlight.departure_city}</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-400">{formatDuration(selectedFlight.duration)}</span>
          <div className="flex items-center gap-1 w-24">
            <div className="w-1.5 h-1.5 rounded-full border border-blue-900" />
            <div className="flex-1 h-px bg-blue-900" />
            <div className="w-1.5 h-1.5 rounded-full border border-blue-900" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-900">{selectedFlight.arrival_time}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">{selectedFlight.arrival_city}</p>
        </div>
      </div>

      {/* Class & Price */}
      <div className="ml-auto text-right">
        <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-1 ${
          seatClass === "business"
            ? "bg-amber-50 text-amber-700"
            : "bg-blue-50 text-blue-700"
        }`}>
          {seatClass}
        </span>
        <p className="text-lg font-bold text-blue-900">MMK {price.toLocaleString()}<span className="text-xs font-medium text-slate-400"> / seat</span></p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function ChooseSeatPage() {
  const router = useRouter();
  const { selectedFlight, seatClass, seatCount, setSeats } = useBookingStore();

  // Redirect if no flight selected
  useEffect(() => {
    if (!selectedFlight) {
      router.replace("/search-flight");
    }
  }, [selectedFlight, router]);

  // Local state for passenger/seat count
  const [count, setCount] = useState(seatCount);

  const handleContinue = () => {
    // Save seats as generic placeholders: e.g. ["Seat assigned at airport", ...]
    const genericSeats = Array.from({ length: count }, (_, idx) => `Seat ${idx + 1} (Airport Check-in)`);
    setSeats(count, genericSeats);
    router.push("/fill-info");
  };

  const handleBack = () => {
    if (selectedFlight) {
      const date = encodeURIComponent(selectedFlight.flight_date);
      const from = encodeURIComponent(selectedFlight.departure_city);
      const to = encodeURIComponent(selectedFlight.arrival_city);

      router.push(`/search-flight?date=${date}&from=${from}&to=${to}`);
    } else {
      router.push("/search-flight");
    }
  };

  if (!selectedFlight) return null;

  const price =
    seatClass === "business"
      ? selectedFlight.business_price
      : selectedFlight.economy_price;
  const totalPrice = price * count;

  return (
    <div className="space-y-6">
      <FlightSummary />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Side: Airport Seating Info ─────────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-blue-900">Airport Check-in Seating</h2>
            <p className="text-xs text-slate-500 mt-1">
              Blue Horizon follows a budget-airline style seat assignment process.
            </p>
          </div>

          {/* Seating Illustration / Feature Box */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Free Seat Assignment</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                To keep fares low, seats are auto-assigned at the airport check-in counter at no additional charge. If you are travelling in a group, our counter agents will do their best to seat you together, subject to availability upon check-in.
              </p>
            </div>
          </div>

          {/* Budget Airline Seating Policies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-100 rounded-xl p-5 hover:shadow-sm transition">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">✓</span>
                <h5 className="text-xs font-bold text-slate-800 uppercase">No Selection Fee</h5>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                You won't be charged any additional seat selection fees. Seat allocation is completely free during check-in.
              </p>
            </div>

            <div className="border border-slate-100 rounded-xl p-5 hover:shadow-sm transition">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">ℹ</span>
                <h5 className="text-xs font-bold text-slate-800 uppercase">Class Upgrade Benefits</h5>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Business class passengers are automatically reserved premium spacious seats on our front rows.
              </p>
            </div>
          </div>
        </div>

        {/* ── Right Panel: Quantity & Price Summary ─────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Seat Count Picker */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 text-center">
              Number of Seats
            </h3>
            <div className="flex items-center justify-between px-4">
              <button
                type="button"
                onClick={() => setCount((c) => Math.max(1, c - 1))}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-blue-900 font-bold hover:bg-slate-50 transition active:scale-90 text-xl"
              >
                −
              </button>
              <span className="text-4xl font-extrabold text-blue-900">{count}</span>
              <button
                type="button"
                onClick={() => setCount((c) => Math.min(MAX_SEATS, c + 1))}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-blue-900 font-bold hover:bg-slate-50 transition active:scale-90 text-xl"
              >
                +
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-3">You can book up to {MAX_SEATS} seats at most</p>
          </div>

          {/* Pricing Box */}
          <div className="bg-blue-900 rounded-xl p-6 text-white shadow-md">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-blue-200">Seat Class</span>
              <span className="font-bold capitalize">{seatClass}</span>
            </div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-blue-200">Price per seat</span>
              <span className="font-bold">MMK {price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs mb-4">
              <span className="text-blue-200">Total passengers</span>
              <span className="font-bold">× {count}</span>
            </div>
            <div className="border-t border-blue-700 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-bold">Total Amount</span>
              <span className="text-xl font-black">MMK {totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-50 transition"
            >
              ← Back
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 py-3 bg-blue-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-blue-950 transition active:scale-95 text-center shadow-md"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
