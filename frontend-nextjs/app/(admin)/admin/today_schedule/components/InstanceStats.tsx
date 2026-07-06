'use client';

interface MetricsType {
  total_instances?: number;
  total_scheduled?: number;
  total_cancelled?: number;
}

interface StatsProps {
  metrics?: MetricsType; 
}

export default function InstanceStats({ metrics }: StatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs text-slate-500 font-medium">Total Schedule</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">
                    {metrics?.total_instances ?? 0}
                </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs text-slate-500 font-medium">Total Scheduled</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                    {metrics?.total_scheduled ?? 0}
                </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs text-slate-500 font-medium">Total Cancelled</p>
                <p className="text-2xl font-bold text-red-400 mt-1">
                    {metrics?.total_cancelled ?? 0}
                </p>
            </div>
        </div>
    );
}