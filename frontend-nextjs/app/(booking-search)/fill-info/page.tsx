"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useBookingStore, PassengerInfo } from "@/services/store/bookingStore";
import PassengerForm from "./componenst/PassengerForm";

// ─── Main Page ────────────────────────────────────────────────────────────
export default function FillInfoPage() {
  const router = useRouter();
  const { selectedFlight, selectedSeats, seatCount, passengers, setPassengers } =
    useBookingStore();

  // Redirect guard
  useEffect(() => {
    if (!selectedFlight || selectedSeats.length === 0) {
      router.replace("/choose-seat");
    }
  }, [selectedFlight, selectedSeats, router]);

  // Local form state — initialise from store (enables back-button pre-fill)
  const [forms, setForms] = useState<PassengerInfo[]>(passengers);

  const updatePassenger = (index: number, updated: PassengerInfo) => {
    setForms((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  const isFormValid = forms.every(
    (p) => p.name.trim() && p.nrc.trim() && p.dob && p.gender && p.phone.trim()
  );

  const handleContinue = () => {
    setPassengers(forms);
    router.push("/generate-ticket");
  };

  const handleBack = () => {
    // Persist partial progress before going back
    setPassengers(forms);
    router.push("/choose-seat");
  };

  if (!selectedFlight) return null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="bg-white border border-slate-100 rounded-xl px-6 py-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 3</p>
          <h1 className="text-lg font-bold text-blue-900">Passenger Information</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill in details for all {seatCount} passenger{seatCount > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedSeats.map((seat) => (
            <span
              key={seat}
              className="bg-blue-50 text-blue-900 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100"
            >
              {seat}
            </span>
          ))}
        </div>
      </div>

      {/* Passenger forms */}
      <div className="space-y-5">
        {forms.map((passenger, idx) => (
          <PassengerForm
            key={idx}
            index={idx}
            seatLabel={selectedSeats[idx] ?? `Seat ${idx + 1}`}
            value={passenger}
            onChange={(updated) => updatePassenger(idx, updated)}
          />
        ))}
      </div>

      {/* Validation hint */}
      {!isFormValid && (
        <p className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
          ⚠ Please complete all required fields for every passenger before continuing.
        </p>
      )}

      {/* ─── 💡 Responsive Navigation Buttons ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pb-8">
        <button
          onClick={handleBack}
          className="w-full sm:flex-1 py-3.5 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-50 transition text-center"
        >
          ← Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!isFormValid}
          className={`w-full sm:flex-1 py-3.5 font-bold rounded-xl text-xs uppercase tracking-wider transition text-center ${
            isFormValid
              ? "bg-blue-900 text-white hover:bg-blue-950 active:scale-95"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          Generate Ticket →
        </button>
      </div>
    </div>
  );
}