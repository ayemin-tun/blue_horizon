'use client';

interface MetricsType {
  total_schedules?: number;
  total_outbound?: number;
  total_inbound?: number;
}

interface StatsProps {
  metrics?: MetricsType; 
}

export default function ScheduleStats({ metrics }: StatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs text-slate-500 font-medium">Total Schedule</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">
                    {metrics?.total_schedules ?? 0}
                </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs text-slate-500 font-medium">Total Outbound</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                    {metrics?.total_outbound ?? 0}
                </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs text-slate-500 font-medium">Total Inbound</p>
                <p className="text-2xl font-bold text-gray-400 mt-1">
                    {metrics?.total_inbound ?? 0}
                </p>
            </div>
        </div>
    );
}