"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore, PassengerInfo } from "@/services/store/bookingStore";

// ─── Single Passenger Form Card ───────────────────────────────────────────
interface PassengerFormProps {
  index: number;
  seatLabel: string;
  value: PassengerInfo;
  onChange: (updated: PassengerInfo) => void;
}

function PassengerForm({ index, seatLabel, value, onChange }: PassengerFormProps) {
  const handleField = (field: keyof PassengerInfo, val: string) => {
    onChange({ ...value, [field]: val });
  };

  const inputClass =
    "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-800 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700/20 transition";

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="bg-blue-900 px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">
            Passenger {index + 1}
          </p>
          <p className="text-sm font-bold text-white">
            Seat <span className="text-blue-200">{seatLabel}</span>
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      {/* Form Fields */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Ko Aung Kyaw"
            value={value.name}
            onChange={(e) => handleField("name", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* NRC / Passport */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            NRC / Passport No. <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 12/AhMaNa(N)123456"
            value={value.nrc}
            onChange={(e) => handleField("nrc", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Date of Birth <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={value.dob}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => handleField("dob", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Gender <span className="text-rose-500">*</span>
          </label>
          <select
            value={value.gender}
            onChange={(e) => handleField("gender", e.target.value)}
            className={inputClass}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            placeholder="e.g. 09-XXXXXXXXX"
            value={value.phone}
            onChange={(e) => handleField("phone", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}

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

      {/* Navigation */}
      <div className="flex gap-4 pb-8">
        <button
          onClick={handleBack}
          className="flex-1 sm:flex-none sm:w-40 py-3 border border-slate-200 text-slate-700 font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-slate-50 transition"
        >
          ← Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!isFormValid}
          className={`flex-1 sm:flex-none sm:w-56 py-3 font-bold rounded-lg text-xs uppercase tracking-wider transition ${
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
