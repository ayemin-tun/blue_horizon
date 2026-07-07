"use client";

import { usePathname, useRouter } from "next/navigation";
import { useBookingStore } from "@/services/store/bookingStore";

export default function BookingStepper() {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedFlight } = useBookingStore(); // Store ထဲက selectedFlight ကို ယူမယ်

  const steps = [
    { id: 1, label: "Route Selection", paths: ["/search-flight"] },
    { id: 2, label: "Choose Seat", paths: ["/choose-seat"] },
    { id: 3, label: "Fill Information", paths: ["/fill-info"] },
    { id: 4, label: "Generate Ticket", paths: ["/generate-ticket"] },
  ];

  const currentStep = steps.find((step) => step.paths.includes(pathname))?.id || 1;

  // ─── Click နှိပ်တဲ့အခါ သွားမယ့် လမ်းကြောင်း တွက်ချက်ခြင်း ───
  const handleStepClick = (stepId: number) => {
    if (stepId === 1) {
      // ၁။ Route Selection ကို ပြန်သွားရင် Store ထဲမှာ ရွေးထားတာရှိရင် Query Param နဲ့ သွားမယ်
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
    <div className="w-full bg-white border border-slate-100 rounded-xl px-8 py-5 flex items-center justify-between select-none">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isClickable = step.id <= currentStep; // မိမိ လက်ရှိ ရောက်နေတဲ့ အဆင့်ထက် ငယ်တဲ့/တူတဲ့ အဆင့်တွေကိုပဲ နှိပ်ခွင့်ပေးမယ်

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            
            {isClickable ? (
              <button 
                type="button"
                onClick={() => handleStepClick(step.id)} // Link အစား function ကို တိုက်ရိုက် ခေါ်မယ်
                className="flex items-center gap-3 cursor-pointer group text-left focus:outline-none"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-900 ring-2 ring-blue-900/20"
                      : "bg-blue-900 text-white group-hover:bg-blue-800"
                  }`}
                >
                  {step.id}
                </div>
                <span
                  className={`text-xs font-semibold tracking-wide transition-colors ${
                    isActive ? "text-blue-900 border-b-2 border-blue-900 pb-0.5" : "text-slate-700 group-hover:text-blue-900"
                  }`}
                >
                  {step.label}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3 opacity-50 cursor-not-allowed">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-500">
                  {step.id}
                </div>
                <span className="text-xs font-semibold tracking-wide text-slate-500">
                  {step.label}
                </span>
              </div>
            )}

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-6 h-px bg-slate-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}