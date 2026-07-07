"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSearchFlightsMutation } from "@/services/BookingService";
import FlightCard from "./components/FlightCard";
import FlightSearchForm from "../main/FlightSearchForm";
import Pagination from "@/components/Pagination";

export default function TicketBookingPage() {
  const searchParams = useSearchParams();
  const { mutate, data, isPending, isError } = useSearchFlightsMutation();
  
  const date = searchParams.get("date") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  // ─── Pagination States ───────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const LIMIT = 5; 

  // URL Params or Page change, call API again
  useEffect(() => {
    if (date && from && to) {
      const currentSkip = (page - 1) * LIMIT; // Page 1 
      
      mutate({ 
        date, 
        departure_city: from, 
        arrival_city: to,
        skip: currentSkip, 
        limit: LIMIT       
      });
    }
  }, [date, from, to, page]); 

  
  useEffect(() => {
    setPage(1);
  }, [date, from, to]);

  
  const paginationInfo = (data as any)?.pagination;
  const flights = data?.success ? data.data : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      <FlightSearchForm variant="horizontal" />

      <div className="bg-blue-50 rounded-xl px-6 py-5 mb-8 mt-6">
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

      {/* Flight Cards Listing */}
      {data?.success && (
        <div className="space-y-5">
          {flights.map((flight) => (
            <FlightCard key={flight.flight_no} flight={flight} />
          ))}
        </div>
      )}

      {/* ─── PAGINATION SECTION */}
      {!isPending && paginationInfo?.total && paginationInfo.total > LIMIT && (
        <div className="w-full mt-8 flex justify-center">
          <Pagination
            currentPage={page}
            totalCount={paginationInfo.total}
            pageSize={LIMIT}
            onPageChange={(newPage) => setPage(newPage)} 
          />
        </div>
      )}
    </div>
  );
}