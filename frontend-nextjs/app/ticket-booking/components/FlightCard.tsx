"use client";

import { FlightResult } from "@/services/BookingService";

interface FlightCardProps {
  flight: FlightResult;
  onBook?: (flight: FlightResult) => void;
  onBusinessSelect?: (flight: FlightResult) => void;
}

// Duration formatter (အပြင်ဘက်မှာ သီးသန့်ထားလိုက်မယ်)
export const formatDuration = (duration: string) => {
  const [h, m] = duration.split(":").map(Number);
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}min`);
  return parts.join(" ") || duration;
};

export default function FlightCard({ flight, onBook, onBusinessSelect }: FlightCardProps) {
  const lowSeats = flight.seats_available <= 5;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex items-center gap-6 hover:shadow-md transition">
      {/* Airline */}
      <div className="flex items-center gap-4 w-56 shrink-0">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-blue-900 font-bold">
            {flight.airline_name.substring(0,2)}
        </div>
        <div>
          <p className="text-xs font-bold text-blue-900 uppercase leading-tight">{flight.airline_name}</p>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{flight.flight_no}</p>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-4 flex-1">
        <div className="text-center">
          <p className="text-xl font-bold text-blue-900 leading-tight">{flight.departure_time}</p>
          <p className="text-[10px] font-semibold text-slate-400 uppercase">{flight.departure_city}</p>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <span className="text-[10px] text-slate-400 font-medium mb-1">{formatDuration(flight.duration)}</span>
          <div className="w-full flex items-center">
            <div className="w-2 h-2 rounded-full border border-blue-900" />
            <div className="flex-1 h-px bg-blue-900" />
            <div className="w-2 h-2 rounded-full border border-blue-900" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-xl font-bold text-blue-900 leading-tight">{flight.arrival_time}</p>
          <p className="text-[10px] font-semibold text-slate-400 uppercase">{flight.arrival_city}</p>
        </div>
      </div>

      <div className="w-px h-16 bg-slate-100" />

      {/* Price */}
      <div className="w-36 shrink-0 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Economy</p>
        <p className="text-lg font-bold text-blue-900 mt-0.5">MMK {flight.economy_price.toLocaleString()}</p>
        <p className={`text-[10px] font-bold mt-1 ${lowSeats ? "text-amber-600" : "text-emerald-600"}`}>
          {flight.seats_available} seats left
        </p>
      </div>

      {/* Actions */}
      <div className="w-36 shrink-0 flex flex-col gap-2">
        <button onClick={() => onBook?.(flight)} className="w-full bg-blue-900 text-white font-bold py-2 rounded-md text-[10px] uppercase hover:bg-blue-950 transition">
          Book
        </button>
        <button onClick={() => onBusinessSelect?.(flight)} className="w-full border border-blue-900 text-blue-900 font-bold rounded-md py-1.5 text-[10px] uppercase hover:bg-blue-50 transition">
          Business {flight.business_price.toLocaleString()}
        </button>
      </div>
    </div>
  );
}