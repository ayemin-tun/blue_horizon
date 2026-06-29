// components/Admin/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  unit: string;
  subText: string;
  trendText?: string;
  trendColor?: string; // e.g., "text-green-600"
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, value, unit, subText, trendText, trendColor = "text-gray-500"
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col gap-1 w-full min-w-70">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-3xl font-bold text-gray-950">{value}</p>
        <span className="text-xl font-medium text-indigo-700">{unit}</span>
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-xs">
        {trendText && (
          <span className={`${trendColor} font-semibold flex items-center gap-0.5`}>
            {trendColor.includes('green') ? '▲' : '▼'} {trendText}
          </span>
        )}
        <span className="text-gray-500">{subText}</span>
      </div>
    </div>
  );
};

export default StatCard;