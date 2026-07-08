"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";
import { useBookingStore, PassengerInfo } from "@/services/store/bookingStore";
import PassengerForm from "./componenst/PassengerForm"; // စာလုံးပေါင်းသတ်ပုံအမှန်အတိုင်း ထားရှိပေးထားပါသည်

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

  // 💡 Form တစ်ခုချင်းစီရဲ့ Validation Status ကို မှတ်ထားမယ့် Array State (Reset မဖြစ်အောင် ကာကွယ်ရန်)
  const [formValidities, setFormValidities] = useState<boolean[]>([]);

  const updatePassenger = (index: number, updated: PassengerInfo) => {
    setForms((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  // 💡 Child (PassengerForm) က လှမ်းပို့လိုက်တဲ့ Validity ကို လက်ခံပြီး သိမ်းဆည်းခြင်း
  const handleFormValidate = (index: number, isValid: boolean) => {
    setFormValidities((prev) => {
      const next = [...prev];
      next[index] = isValid;
      return next;
    });
  };

  // 💡 ခရီးသည်အားလုံးရဲ့ Form အရေအတွက် ပြည့်စုံပြီး Format တွေပါ မှန်ကန်မှ ခလုတ်ကို ဖွင့်ပေးမည်
  const isFormValid = 
    formValidities.length === forms.length && formValidities.every((v) => v === true);

  const handleContinue = () => {
    if (!isFormValid) return; // Form မမှန်ရင် ရှေ့ဆက်မသွားစေရန် Guard ထားခြင်း
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
            onValidate={handleFormValidate} // 💡 Child ဆီက validation ကို စောင့်ဖမ်းရန် လှမ်းထည့်ပေးလိုက်ခြင်း
          />
        ))}
      </div>

      {/* Validation hint */}
      {!isFormValid && (
        <p className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
          ⚠ Please complete all required fields with a valid format for every passenger before continuing.
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
              ? "bg-blue-900 text-white hover:bg-blue-950 active:scale-95 cursor-pointer"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          Generate Ticket →
        </button>
      </div>
    </div>
  );
}