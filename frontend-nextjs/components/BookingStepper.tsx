"use client";

import { usePathname, useRouter } from "next/navigation";
import { useBookingStore } from "@/services/store/bookingStore";

export default function BookingStepper() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Zustand Store ထဲက ဒေတာ အခြေအနေတွေကို ယူမယ်
  const { selectedFlight, selectedSeats, passengers } = useBookingStore();

  const steps = [
    { id: 1, label: "Select Flight", paths: ["/search-flight"] },
    { id: 2, label: "Choose Seat", paths: ["/choose-seat"] },
    { id: 3, label: "Fill Information", paths: ["/fill-info"] },
    { id: 4, label: "Generate Ticket", paths: ["/generate-ticket"] },
  ];

  const currentStep =
    steps.find((step) => step.paths.some((p) => pathname.startsWith(p)))?.id || 1;

  // ─── 💡 Real-time ခလုတ်နှိပ်ခွက် စစ်ဆေးခြင်း Logic ───
  const checkIsClickable = (stepId: number) => {
    if (stepId === currentStep) return true;
    if (stepId === 1) return true;
    if (stepId === 2) return !!selectedFlight;
    if (stepId === 3) return !!selectedFlight && selectedSeats.length > 0;
    if (stepId === 4) {
      const isFormValid = passengers.length > 0 && passengers.every(
        (p) => p.name?.trim() && p.nrc?.trim() && p.dob && p.gender && p.phone?.trim()
      );
      return !!selectedFlight && selectedSeats.length > 0 && isFormValid;
    }
    return false;
  };

  // ─── Stepper ခလုတ်နှိပ်တဲ့အခါ သွားမယ့် လမ်းကြောင်း ───
  const handleStepClick = (stepId: number) => {
    if (stepId === 1) {
      if (selectedFlight) {
        const date = encodeURIComponent(selectedFlight.flight_date);
        const from = encodeURIComponent(selectedFlight.departure_city);
        const to = encodeURIComponent(selectedFlight.arrival_city);
        router.push(`/search-flight?date=${date}&from=${from}&to=${to}`);
      } else {
        router.push("/search-flight");
      }
    } else if (stepId === 2) {
      router.push("/choose-seat");
    } else if (stepId === 3) {
      router.push("/fill-info");
    } else if (stepId === 4) {
      router.push("/generate-ticket");
    }
  };

  return (
    <div className="w-full bg-white border border-slate-100 rounded-xl px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between select-none shadow-sm mb-6">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        const isClickable = checkIsClickable(step.id);

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            {isClickable ? (
              <button
                type="button"
                onClick={() => handleStepClick(step.id)}
                title={step.label} // Mobile မှာ label ပုန်းနေချိန် နှိပ်ရင် ဘာ step လဲသိအောင် tooltip ပြပေးခြင်း
                className="flex items-center gap-2 sm:gap-3 cursor-pointer group text-left focus:outline-none"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                    isCompleted
                      ? "bg-blue-900 text-white"
                      : isActive
                      ? "bg-blue-100 text-blue-900 ring-2 ring-blue-900/30"
                      : "bg-blue-50 text-blue-900 border border-blue-100 hover:bg-blue-100"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                {/* 💡 Mobile မှာ စာသားဖျောက်ထားပြီး `sm:` (Desktop) မှ ဖော်ပေးရန် `hidden sm:inline` သုံးထားပါတယ် */}
                <span
                  className={`hidden sm:inline text-xs font-semibold tracking-wide transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-blue-900 border-b-2 border-blue-900 pb-0.5"
                      : "text-slate-600 group-hover:text-blue-900"
                  }`}
                >
                  {step.label}
                </span>
              </button>
            ) : (
              <div 
                className="flex items-center gap-2 sm:gap-3 opacity-40 cursor-not-allowed"
                title={step.label}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-500 shrink-0">
                  {step.id}
                </div>
                {/* 💡 Mobile မှာ စာသားဖျောက်ရန် */}
                <span className="hidden sm:inline text-xs font-semibold tracking-wide text-slate-400 whitespace-nowrap">
                  {step.label}
                </span>
              </div>
            )}

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 mx-2 sm:mx-5 h-px transition-colors ${
                  step.id < currentStep ? "bg-blue-900/30" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}