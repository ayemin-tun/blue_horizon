"use client";

import { useEffect, useState } from "react";
import RouteSelect from "./RouteSelect";
import { useCitiesQuery } from "@/services/BookingService";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/services/store/authStore";
import { toast } from "@/services/store/alertStore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// ─── Helpers: departureDate is stored as "YYYY-MM-DD" string ──────────────
function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDateString(date: Date | null): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface FlightSearchFormProps {
  variant?: "vertical" | "horizontal";
}

export default function FlightSearchForm({ variant = "vertical" }: FlightSearchFormProps) {
  const { data, isLoading } = useCitiesQuery();
  const router = useRouter();
  const searchParams = useSearchParams();
  const authStore = useAuthStore();

  // NOTE: Avoid `new Date().toISOString()` here — it converts to UTC first,
  // which rolls the date back by one day for timezones ahead of UTC
  // (e.g. Myanmar/Singapore, UTC+6:30 / +8) whenever UTC midnight hasn't
  // happened yet even though it's already "tomorrow" locally. Build the
  // string from local date parts instead so it always matches the user's
  // wall-clock date.
  const getTodayDate = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
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
      <div className={`departure-date-field ${isHorizontal ? "w-[20%]" : "w-full"}`}>
        <label className="block text-xs font-bold text-slate-800 mb-2">Departure Date</label>
        <DatePicker
          selected={parseDateString(departureDate)}
          onChange={(date: Date | null) => setDepartureDate(formatDateString(date))}
          minDate={parseDateString(getTodayDate()) ?? undefined}
          dateFormat="dd/MM/yyyy"
          placeholderText="Select date"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          wrapperClassName="w-full"
          autoComplete="off"
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