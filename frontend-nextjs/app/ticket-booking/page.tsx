"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSearchFlightsMutation, FlightResult } from "@/services/BookingService";
import FlightCard from "./components/FlightCard";

export default function TicketBookingPage() {
  const searchParams = useSearchParams();
  const { mutate, data, isPending, isError } = useSearchFlightsMutation();

  const date = searchParams.get("date") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  useEffect(() => {
    if (date && from && to) {
      mutate({ date, departure_city: from, arrival_city: to });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, from, to]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-blue-50 rounded-xl px-6 py-5 mb-8">
        <p className="text-xs font-bold text-blue-900 uppercase tracking-widest">
          Available flights
        </p>
        <p className="text-sm text-slate-700 mt-1">
          Showing flights for{" "}
          <span className="font-semibold">{from}</span> →{" "}
          <span className="font-semibold">{to}</span> on{" "}
          <span className="font-semibold">{date}</span>
        </p>
      </div>

      {isPending && (
        <div className="text-center py-16 text-slate-500 text-sm">Searching flights…</div>
      )}

      {isError && (
        <div className="text-center py-16 text-red-600 text-sm">
          Something went wrong while searching. Please try again.
        </div>
      )}

      {data && !data.success && (
        <div className="text-center py-16 text-slate-500 text-sm">
          No flights found for this route and date.
        </div>
      )}

      {data?.success && (
        <div className="space-y-5">
          {data.data.map((flight) => (
            <FlightCard key={flight.flight_no} flight={flight} />
          ))}
        </div>
      )}
    </div>
  );
}