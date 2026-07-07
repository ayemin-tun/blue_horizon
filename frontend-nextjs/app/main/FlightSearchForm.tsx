"use client";

import { useEffect, useState } from "react";
import RouteSelect from "./RouteSelect";
import { useCitiesQuery } from "@/services/BookingService";
import { useRouter } from "next/navigation";

export default function FlightSearchForm() {
  const { data, isLoading } = useCitiesQuery();
  const router = useRouter();
  // State 
  const [cities, setCities] = useState<string[]>([]);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };
  const [departureDate, setDepartureDate] = useState(getTodayDate());

  // data update on state changes
  useEffect(() => {
    if (data?.success) {
      setCities(data.cities);
      setFromLocation(data.cities[0]);
      setToLocation(data.cities[1] || data.cities[0]);
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;

  const handleSwapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedDate = departureDate.split("-").reverse().join("/");

    const query = new URLSearchParams({
      date: formattedDate,
      from: fromLocation,
      to: toLocation
    }).toString();

    router.push(`/ticket-booking?${query}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 -mt-36 relative z-30">
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-xl p-8 shadow-lg border border-slate-100 space-y-6"
      >
        <div className="w-full">
          <label className="block text-xs font-bold text-slate-800 mb-2">Departure Date</label>
          <input
            type="date"
            value={departureDate}
            min={getTodayDate()}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full border border-slate-200 rounded-md p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-800"
          />
        </div>

        <div className="flex items-end gap-3 w-full">
          {/* From Input */}
          <RouteSelect
            label="From"
            value={fromLocation}
            onChange={setFromLocation}
            cities={cities}
          />

          {/* Swap Button */}
          <div className="pb-1.5">
            <button
              type="button"
              onClick={handleSwapLocations}
              className="border border-slate-200 text-blue-900 rounded-full w-8 h-8 flex items-center justify-center hover:bg-slate-50 transition active:scale-95 text-sm font-bold"
            >
              ⇄
            </button>
          </div>

          {/* To Input */}
          <RouteSelect
            label="To"
            value={toLocation}
            onChange={setToLocation}
            cities={cities}
          />
        </div>

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
  );
}