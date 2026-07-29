// components/FlightSearchFormSkeleton.tsx
interface FlightSearchFormSkeletonProps {
  variant?: "vertical" | "horizontal";
}

export default function FlightSearchFormSkeleton({
  variant = "vertical",
}: FlightSearchFormSkeletonProps) {
  const isHorizontal = variant === "horizontal";

  return (
    <div
      className={`bg-white rounded-xl shadow-md border border-slate-100 animate-pulse ${
        isHorizontal
          ? "p-4 md:p-5 flex flex-col md:flex-row md:items-end gap-4 w-full"
          : "p-6 md:p-8 space-y-6 flex flex-col w-full"
      }`}
    >
      {/* ── Departure Date Skeleton ── */}
      <div className={`w-full ${isHorizontal ? "md:w-[22%]" : "w-full"}`}>
        <div className="h-3.5 bg-slate-200 rounded w-24 mb-2"></div>
        <div className="h-10 bg-slate-100 border border-slate-200 rounded-md w-full"></div>
      </div>

      {/* ── Locations Section Skeleton (From, Swap, To) ── */}
      <div className={`flex items-end gap-2 sm:gap-3 w-full ${isHorizontal ? "md:flex-1" : "w-full"}`}>
        {/* From Input */}
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-200 rounded w-12 mb-2"></div>
          <div className="h-10 bg-slate-100 border border-slate-200 rounded-md w-full"></div>
        </div>

        {/* Swap Button Skeleton */}
        <div className="pb-1 shrink-0">
          <div className="w-9 h-9 bg-slate-200 rounded-full"></div>
        </div>

        {/* To Input */}
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-200 rounded w-12 mb-2"></div>
          <div className="h-10 bg-slate-100 border border-slate-200 rounded-md w-full"></div>
        </div>
      </div>

      {/* ── Submit Button Skeleton ── */}
      <div className={`w-full ${isHorizontal ? "md:w-[15%] md:pb-0.5" : "pt-2"}`}>
        <div className="h-11 bg-slate-200 rounded-md w-full"></div>
      </div>
    </div>
  );
}