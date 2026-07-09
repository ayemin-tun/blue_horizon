import { useBookingStore } from "@/services/store/bookingStore";
import { formatDuration } from "@/utils/timeHelper";

export default function FlightSummary() {
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