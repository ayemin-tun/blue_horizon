export default function FlightCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-4 animate-pulse">
      {/* Main Row Container */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">

        {/* Airline Info Skeleton */}
        <div className="flex items-center gap-4 w-full lg:w-56 shrink-0 pb-3 lg:pb-0 border-b border-slate-50 lg:border-none">
          <div className="w-12 h-12 rounded-lg bg-slate-200 shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3.5 bg-slate-200 rounded w-28" />
            <div className="h-3 bg-slate-100 rounded w-16" />
          </div>
        </div>

        {/* Route Times & Duration Skeleton */}
        <div className="flex items-center gap-4 flex-1 w-full p-3">
          {/* Departure */}
          <div className="text-center shrink-0 min-w-15 space-y-1.5">
            <div className="h-6 bg-slate-200 rounded w-14 mx-auto" />
            <div className="h-2.5 bg-slate-100 rounded w-10 mx-auto" />
          </div>

          {/* Progress bar line */}
          <div className="flex-1 flex flex-col items-center space-y-2">
            <div className="h-2.5 bg-slate-100 rounded w-12" />
            <div className="w-full flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <div className="flex-1 h-px bg-slate-200" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            </div>
          </div>

          {/* Arrival */}
          <div className="text-center shrink-0 min-w-15 space-y-1.5">
            <div className="h-6 bg-slate-200 rounded w-14 mx-auto" />
            <div className="h-2.5 bg-slate-100 rounded w-10 mx-auto" />
          </div>
        </div>

        {/* Desktop Line Divider */}
        <div className="hidden lg:block w-px h-16 bg-slate-100" />

        {/* Price & Actions Skeleton */}
        <div className="flex flex-col sm:flex-row items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t border-slate-50 lg:border-none w-full lg:w-auto">

          {/* Price Box */}
          <div className="w-full sm:w-44 text-left sm:text-center shrink-0 flex sm:flex-col justify-between items-center sm:justify-center p-3 space-y-2">
            <div className="space-y-1">
              <div className="h-2.5 bg-slate-100 rounded w-12 sm:mx-auto" />
              <div className="h-5 bg-slate-200 rounded w-28 sm:mx-auto" />
            </div>
            <div className="h-3 bg-slate-100 rounded w-24 sm:mx-auto" />
          </div>

          {/* Action Buttons */}
          <div className="w-full sm:w-44 shrink-0 flex flex-row sm:flex-col gap-2">
            {/* Economy Book Button Skeleton */}
            <div className="flex-1 sm:w-full h-9 bg-slate-200 rounded-md" />
            
            {/* Business Book Button Skeleton */}
            <div className="flex-1 sm:w-full h-9 bg-slate-100 rounded-md" />
          </div>

        </div>
      </div>

      {/* Detail Footer Button Skeleton */}
      <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
        <div className="h-3 bg-slate-200 rounded w-20" />
      </div>
    </div>
  );
}