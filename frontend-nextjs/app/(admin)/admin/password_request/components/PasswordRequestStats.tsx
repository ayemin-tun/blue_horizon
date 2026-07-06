'use client';

interface MetricsType {
  total_pending?: number;
  total_resolved?: number;
  total_all?: number;
}

export default function PasswordRequestStats({ metrics }: { metrics?: MetricsType }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <p className="text-xs text-slate-500 font-medium">Pending Requests</p>
        <p className="text-2xl font-bold text-amber-600 mt-1">{metrics?.total_pending ?? 0}</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <p className="text-xs text-slate-500 font-medium">Resolved Requests</p>
        <p className="text-2xl font-bold text-emerald-600 mt-1">{metrics?.total_resolved ?? 0}</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <p className="text-xs text-slate-500 font-medium">Total Requests</p>
        <p className="text-2xl font-bold text-blue-800 mt-1">{metrics?.total_all ?? 0}</p>
      </div>
    </div>
  );
}