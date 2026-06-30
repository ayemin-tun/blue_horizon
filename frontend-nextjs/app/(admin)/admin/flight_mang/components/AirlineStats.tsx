'use client';

interface AirlineStatsProps {
  totalCount: number;
  filteredCount: number;
}

export default function AirlineStats({ totalCount, filteredCount }: AirlineStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4">
        <p className="text-xs text-slate-500 font-medium">Total Airlines</p>
        <p className="text-2xl font-bold text-blue-900 mt-1">{totalCount}</p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4">
        <p className="text-xs text-slate-500 font-medium">Showing</p>
        <p className="text-2xl font-bold text-blue-900 mt-1">{filteredCount}</p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 col-span-2 sm:col-span-1">
        <p className="text-xs text-slate-500 font-medium">Status</p>
        <p className="text-sm font-bold text-emerald-600 mt-1">All Active</p>
      </div>
    </div>
  );
}
