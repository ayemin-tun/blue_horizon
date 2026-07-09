"use client";

interface RouteSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  cities: string[];
}

export default function RouteSelect({ label, value, onChange, cities }: RouteSelectProps) {
  return (
    <div className="flex-1 relative">
      <label className="block text-xs font-bold text-slate-800 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 bg-white rounded-md p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-800 appearance-none pr-8 font-medium"
      >
        {cities.map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center pt-6 text-slate-800 text-[10px]">▼</div>
    </div>
  );
}