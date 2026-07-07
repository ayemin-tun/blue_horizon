"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function BookingStepper() {
  const pathname = usePathname();

  const steps = [
    { id: 1, label: "Route Selection", paths: ["/search-flight"], link: "/search-flight" },
    { id: 2, label: "Choose Seat", paths: ["/choose-seat"], link: "/choose-seat" },
    { id: 3, label: "Fill Information", paths: ["/fill-info"], link: "/fill-info" },
    { id: 4, label: "Generate Ticket", paths: ["/generate-ticket"], link: "/generate-ticket" },
  ];

  const currentStep = steps.find((step) => step.paths.includes(pathname))?.id || 1;

  return (
    <div className="w-full bg-white border border-slate-100 rounded-xl px-8 py-5 flex items-center justify-between select-none">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        const isClickable = step.id <= currentStep; 

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            
            {isClickable ? (
              <Link 
                href={step.link} 
                className="flex items-center gap-3 cursor-pointer group"
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
              </Link>
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