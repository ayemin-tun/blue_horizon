'use client';

interface MetricsType {
  total?: number;
  active?: number;
  inactive?: number;
  recent_joined?: number;
}

interface AgentStatsProps {
  metrics?: MetricsType; 
}

export default function AgentStats({ metrics }: AgentStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs text-slate-500 font-medium">Total Agent</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">
                    {metrics?.total ?? 0}
                </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs text-slate-500 font-medium">Active Agent</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                    {metrics?.active ?? 0}
                </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs text-slate-500 font-medium">InActive Agent</p>
                <p className="text-2xl font-bold text-gray-400 mt-1">
                    {metrics?.inactive ?? 0}
                </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs text-slate-500 font-medium">Recent Joined</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                    {metrics?.recent_joined ?? 0}
                </p>
            </div>
        </div>
    );
}