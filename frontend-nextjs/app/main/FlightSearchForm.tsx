"use client"

import { useState } from "react";
export default function FlightSearchForm(){

    const [departureDate, setDepartureDate] = useState("20/06/2026");
      const [fromLocation, setFromLocation] = useState("Yangon (RGN)");
      const [toLocation, setToLocation] = useState("Mandalay (MDY)");
    
      const handleSwapLocations = () => {
        const temp = fromLocation;
        setFromLocation(toLocation);
        setToLocation(temp);
      };
    
      const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Searching flights from ${fromLocation} to ${toLocation}...`);
      };

    return (
        <div className="max-w-2xl mx-auto px-4 -mt-36 relative z-30">
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-xl p-8 shadow-lg border border-slate-100 space-y-6"
        >
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-800 mb-2">Depature Date</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full border border-slate-200 rounded-md p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-800"
            />
          </div>

          <div className="flex items-end gap-3 w-full">

            {/* From Input */}
            <div className="flex-1 relative">
              <label className="block text-xs font-bold text-slate-800 mb-2">From</label>
              <select
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-md p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-800 appearance-none pr-8 font-medium"
              >
                <option>Yangon (RGN)</option>
                <option>Mandalay (MDY)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center pt-6 text-slate-800 text-[10px]">▼</div>
            </div>

            {/* ⇄ Swap Button (တစ်လိုင်းတည်းမှာ တန်းစီပြီး အဝိုင်းလေး ဝင်နေမည့်အပိုင်း) */}
            <div className="pb-1.5">
              <button
                type="button"
                onClick={handleSwapLocations}
                className="border border-slate-200 text-blue-900 rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:bg-slate-50 transition active:scale-95 text-sm font-bold"
              >
                ⇄
              </button>
            </div>

            {/* To Input */}
            <div className="flex-1 relative">
              <label className="block text-xs font-bold text-slate-800 mb-2">To</label>
              <select
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-md p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-800 appearance-none pr-8 font-medium"
              >
                <option>Mandalay (MDY)</option>
                <option>Yangon (RGN)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center pt-6 text-slate-800 text-[10px]">▼</div>
            </div>

          </div>

          {/* SEARCH Button (အပြာရောင် ခလုတ်အကြီးကြီး) */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-950 text-white font-semibold py-3 rounded-md text-xs tracking-widest uppercase transition shadow"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    )
}