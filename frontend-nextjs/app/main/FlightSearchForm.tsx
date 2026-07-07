"use client";

import { useEffect, useState } from "react";
import RouteSelect from "./RouteSelect";
import { useCitiesQuery } from "@/services/BookingService";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/services/store/authStore";
import { toast } from "@/services/store/alertStore";

interface FlightSearchFormProps {
  variant?: "vertical" | "horizontal";
}

export default function FlightSearchForm({ variant = "vertical" }: FlightSearchFormProps) {
  const { data, isLoading } = useCitiesQuery();
  const router = useRouter();
  const searchParams = useSearchParams();
  const authStore = useAuthStore();

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const parseUrlDate = (urlDate: string | null) => {
    if (!urlDate) return getTodayDate();
    const parts = urlDate.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return getTodayDate();
  };

  const [cities, setCities] = useState<string[]>([]);
  const [fromLocation, setFromLocation] = useState(searchParams.get("from") || "");
  const [toLocation, setToLocation] = useState(searchParams.get("to") || "");
  const [departureDate, setDepartureDate] = useState(parseUrlDate(searchParams.get("date")));

  useEffect(() => {
    if (data?.success) {
      setCities(data.cities);
      if (!searchParams.get("from")) setFromLocation(data.cities[0]);
      if (!searchParams.get("to")) setToLocation(data.cities[1] || data.cities[0]);
    }
  }, [data, searchParams]);

  useEffect(() => {
    const urlFrom = searchParams.get("from");
    const urlTo = searchParams.get("to");
    const urlDate = searchParams.get("date");

    if (urlFrom) setFromLocation(urlFrom);
    if (urlTo) setToLocation(urlTo);
    if (urlDate) setDepartureDate(parseUrlDate(urlDate));
  }, [searchParams]);

  if (isLoading) return <div>Loading...</div>;

  const handleSwapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // ── Auth check ──────────────────────────────────────────────────────
    const token = authStore.getValidToken();
    const role = authStore.role;

    if (!token) {
      toast.error("Please log in to search and book flights.");
      router.push("/login");
      return;
    }

    if (role === "admin") {
      toast.warning("Admins cannot book flights. Redirecting to dashboard.");
      router.push("/admin/dashboard");
      return;
    }

    // ── Proceed to search ──────────────────────────────────────────────
    const formattedDate = departureDate.split("-").reverse().join("/");
    const query = new URLSearchParams({
      date: formattedDate,
      from: fromLocation,
      to: toLocation
    }).toString();

    router.push(`/search-flight?${query}`);
  };

  const isHorizontal = variant === "horizontal";

  return (
    <form
      onSubmit={handleSearch}
      className={`bg-white rounded-xl shadow-lg border border-slate-100 transition-all ${
        isHorizontal 
          ? "p-5 flex flex-row items-end gap-4 w-full justify-between" 
          : "p-8 space-y-6 flex flex-col"
      }`}
    >
      {/* Departure Date Input */}
      <div className={isHorizontal ? "w-[20%]" : "w-full"}>
        <label className="block text-xs font-bold text-slate-800 mb-2">Departure Date</label>
        <input
          type="date"
          value={departureDate}
          min={getTodayDate()}
          onChange={(e) => setDepartureDate(e.target.value)}
          className="w-full border border-slate-200 rounded-md p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-800"
        />
      </div>

      {/* Locations Section */}
      <div className={`flex items-end gap-3 ${isHorizontal ? "flex-1" : "w-full"}`}>
        {/* From Input */}
        <div className="flex-1">
          <RouteSelect
            label="From"
            value={fromLocation}
            onChange={setFromLocation}
            cities={cities}
          />
        </div>

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
        <div className="flex-1">
          <RouteSelect
            label="To"
            value={toLocation}
            onChange={setToLocation}
            cities={cities}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className={isHorizontal ? "w-[15%] pb-0.5" : "pt-2 w-full"}>
        <button
          type="submit"
          className="w-full bg-blue-900 hover:bg-blue-950 text-white font-semibold py-3 rounded-md text-xs tracking-widest uppercase transition shadow"
        >
          Search
        </button>
      </div>
    </form>
  );
}