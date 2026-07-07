"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/services/store/bookingStore";
import { formatDuration } from "@/app/search-flight/components/FlightCard";

// ─── Ticket ID Generator ────────────────────────────────────────────────
function generateTicketId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "BH-";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// ─── Barcode-style visual strip ─────────────────────────────────────────
function BarcodeStrip({ value }: { value: string }) {
  // Generate deterministic bar widths from the ticket ID
  const bars = value
    .split("")
    .map((c) => c.charCodeAt(0))
    .flatMap((code) => [
      1 + (code % 3),
      1 + ((code * 7) % 2),
      1 + ((code * 13) % 3),
    ]);

  return (
    <div className="flex items-end gap-px h-12 overflow-hidden">
      {bars.map((w, i) => (
        <div
          key={i}
          style={{ width: `${w * 2}px`, height: `${60 + ((i * 17) % 20)}%` }}
          className="bg-blue-900 rounded-sm shrink-0"
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function GenerateTicketPage() {
  const router = useRouter();
  const {
    selectedFlight,
    seatClass,
    selectedSeats,
    passengers,
    seatCount,
    ticketId,
    setTicketId,
    reset,
  } = useBookingStore();

  const generatedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showJson, setShowJson] = useState(false);

  // Redirect guard
  useEffect(() => {
    if (!selectedFlight || passengers.length === 0 || !passengers[0].name) {
      router.replace("/fill-info");
    }
  }, [selectedFlight, passengers, router]);

  // Generate ticket ID once on mount and persist to store + localStorage
  useEffect(() => {
    if (generatedRef.current) return;
    generatedRef.current = true;

    const existingId = useBookingStore.getState().ticketId;
    let id: string;

    if (existingId) {
      id = existingId;
    } else {
      id = generateTicketId();
      setTicketId(id);
    }

    const currentFlight = useBookingStore.getState().selectedFlight;
    const currentClass = useBookingStore.getState().seatClass;
    const currentSeats = useBookingStore.getState().selectedSeats;
    const currentPassengers = useBookingStore.getState().passengers;
    const currentPrice = currentClass === "business" ? currentFlight?.business_price ?? 0 : currentFlight?.economy_price ?? 0;

    // Full booking summary JSON payload (Backend ready)
    const bookingData = {
      ticket_id: id,
      flight_no: currentFlight?.flight_no,
      airline_name: currentFlight?.airline_name,
      departure_city: currentFlight?.departure_city,
      arrival_city: currentFlight?.arrival_city,
      departure_time: currentFlight?.departure_time,
      arrival_time: currentFlight?.arrival_time,
      flight_date: currentFlight?.flight_date,
      seat_class: currentClass,
      seat_count: currentPassengers.length,
      total_price: currentPrice * currentPassengers.length,
      passengers: currentPassengers.map((p, idx) => ({
        name: p.name,
        nrc: p.nrc,
        dob: p.dob,
        gender: p.gender,
        phone: p.phone,
        seat: currentSeats[idx] || "Auto-Assigned"
      })),
      booked_at: new Date().toISOString(),
    };

    const existing = JSON.parse(
      localStorage.getItem("bluehorizon-tickets") || "[]"
    );
    // Avoid duplicates
    if (!existing.find((b: { ticket_id: string }) => b.ticket_id === id)) {
      existing.push(bookingData);
      localStorage.setItem("bluehorizon-tickets", JSON.stringify(existing));
    }

    // Animate in
    setTimeout(() => setIsVisible(true), 100);
  }, [setTicketId]);

  const handleBookAnother = () => {
    reset();
    router.push("/");
  };

  if (!selectedFlight || !ticketId) return null;

  const price =
    seatClass === "business"
      ? selectedFlight.business_price
      : selectedFlight.economy_price;
  const totalPrice = price * seatCount;

  const formattedDate = selectedFlight.flight_date
    ? new Date(selectedFlight.flight_date).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const backendPayload = {
    ticket_id: ticketId,
    flight_no: selectedFlight.flight_no,
    airline_name: selectedFlight.airline_name,
    departure_city: selectedFlight.departure_city,
    arrival_city: selectedFlight.arrival_city,
    departure_time: selectedFlight.departure_time,
    arrival_time: selectedFlight.arrival_time,
    flight_date: selectedFlight.flight_date,
    seat_class: seatClass,
    seat_count: seatCount,
    total_price: totalPrice,
    passengers: passengers.map((p, idx) => ({
      name: p.name,
      nrc: p.nrc,
      dob: p.dob,
      gender: p.gender,
      phone: p.phone,
      seat: selectedSeats[idx] || "Auto-Assigned"
    })),
    booked_at: new Date().toISOString()
  };

  return (
    <div
      className={`space-y-6 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Success Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4 flex items-center gap-4 print:hidden">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-800">Booking Confirmed!</p>
          <p className="text-xs text-emerald-600 mt-0.5">
            Your ticket has been generated and saved. Please keep your ticket ID safe.
          </p>
        </div>
      </div>

      {/* ── Boarding Pass Card ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">

        {/* Top: Dark Header */}
        <div className="bg-blue-900 px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">
              Blue Horizon Airways — Boarding Pass
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-3xl font-black text-white">{selectedFlight.departure_city}</p>
                <p className="text-xs text-blue-300 font-semibold">{selectedFlight.departure_time}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-blue-300">{formatDuration(selectedFlight.duration)}</span>
                <div className="flex items-center gap-1 w-20">
                  <div className="w-1.5 h-1.5 rounded-full border border-blue-300" />
                  <div className="flex-1 h-px bg-blue-500" />
                  <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                  </svg>
                </div>
                <span className="text-[9px] text-blue-400">Direct</span>
              </div>
              <div>
                <p className="text-3xl font-black text-white">{selectedFlight.arrival_city}</p>
                <p className="text-xs text-blue-300 font-semibold">{selectedFlight.arrival_time}</p>
              </div>
            </div>
          </div>

          {/* Ticket ID + Barcode */}
          <div className="flex flex-col items-end gap-2">
            <p className="text-[10px] text-blue-300 font-semibold uppercase tracking-widest">Ticket ID</p>
            <p className="text-xl font-black text-white tracking-widest">{ticketId}</p>
            <BarcodeStrip value={ticketId} />
          </div>
        </div>

        {/* Tear line */}
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-100 -ml-2.5 shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
          <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-100 -mr-2.5 shrink-0" />
        </div>

        {/* Flight Details Grid */}
        <div className="px-8 py-5 grid grid-cols-2 sm:grid-cols-4 gap-5 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Airline</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedFlight.airline_name}</p>
            <p className="text-[10px] text-slate-400">{selectedFlight.flight_no}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{formattedDate}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class</p>
            <span className={`inline-block mt-0.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
              seatClass === "business"
                ? "bg-amber-50 text-amber-700"
                : "bg-blue-50 text-blue-700"
            }`}>
              {seatClass}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seats</p>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {selectedSeats.map((s) => (
                <span key={s} className="text-[10px] font-bold bg-blue-900 text-white px-2.5 py-0.5 rounded-full">
                  Assigned at Check-in
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Passengers Section */}
        <div className="px-8 py-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Passenger Details
          </p>
          <div className="space-y-3">
            {passengers.map((p, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-x-6 gap-y-1 bg-slate-50 rounded-lg px-4 py-3 border border-slate-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-800 truncate">{p.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Seat: <span className="font-bold text-blue-900">Auto-Assigned</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  NRC: <span className="font-bold text-slate-700">{p.nrc}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium capitalize">
                  {p.gender} · DOB: {p.dob}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {p.phone}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-slate-50 border-t border-slate-100 px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-6 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Price per seat</p>
                <p className="font-bold text-slate-800 mt-0.5">MMK {price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Passengers</p>
                <p className="font-bold text-slate-800 mt-0.5">{seatCount}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Baggage</p>
                <p className="font-bold text-slate-800 mt-0.5">20 + 7 KG</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Amount</p>
              <p className="text-2xl font-black text-blue-900">MMK {totalPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible JSON Preview Box for Developer / Backend Integration */}
      <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-lg print:hidden">
        <button
          type="button"
          onClick={() => setShowJson(!showJson)}
          className="w-full flex items-center justify-between px-6 py-4 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/50 transition cursor-pointer select-none"
        >
          <span className="flex items-center gap-2">
            <span className="font-mono text-emerald-400">{"{ }"}</span>
            Backend API Booking JSON Payload (Future Use)
          </span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            {showJson ? "Hide JSON ▲" : "Show JSON ▼"}
          </span>
        </button>

        {showJson && (
          <div className="border-t border-slate-800 p-6 bg-slate-950 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto max-h-[350px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
              <span className="text-[10px] text-slate-500">Method: POST /api/bookings</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(backendPayload, null, 2));
                  alert("JSON Payload copied to clipboard!");
                }}
                className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
              >
                Copy JSON
              </button>
            </div>
            <pre>{JSON.stringify(backendPayload, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Important Notes */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-6 py-4 text-xs space-y-1 print:hidden">
        <p className="font-bold text-amber-800 mb-2">⚠ Important Notes</p>
        <p className="text-amber-700">• Please arrive at the airport at least 2 hours before departure.</p>
        <p className="text-amber-700">• Carry a printed or digital copy of this ticket along with valid ID.</p>
        <p className="text-amber-700">• This ticket is non-refundable and non-transferable.</p>
        <p className="text-amber-700">• Ticket ID: <strong className="text-amber-800">{ticketId}</strong></p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pb-8 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 py-3.5 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-50 transition flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Ticket
        </button>
        <button
          onClick={handleBookAnother}
          className="flex-1 py-3.5 bg-blue-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-blue-950 transition active:scale-95 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Book Another Flight
        </button>
      </div>
    </div>
  );
}
