
"use client";

import React from "react";
import { useAirlinesQuery, Airline, PaginatedAirlineResponse } from "@/services/airlineService";

interface FlightPreviewProps {
  flightNo: string;
  totalSeats: number;
  airlineId: number;
}

export default function FlightFormPreview({ flightNo, totalSeats, airlineId }: FlightPreviewProps) {
  const { data: apiResponse } = useAirlinesQuery(1, 100, "");
  const res = apiResponse as unknown as PaginatedAirlineResponse;
  const airlines: Airline[] = res?.data || [];

  const selectedAirline = airlines.find((a) => a.airline_id === airlineId);

  if (!flightNo && totalSeats === 0 && airlineId === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 pb-3 text-xs space-y-1">
      <p className="text-blue-900 font-bold">Flight Preview:</p>
      
      <div className="flex items-center justify-between">
        <p className="text-slate-600 font-medium">
          Flight No: <span className="font-mono font-bold text-slate-900">{flightNo || "—"}</span>
        </p>
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
          {totalSeats ? `${totalSeats.toLocaleString()} Seats` : "0 Seats"}
        </span>
      </div>
      
      {selectedAirline ? (
        <p className="text-[11px] text-slate-500 font-medium mt-1">
          Airline: <span className="text-blue-950 font-semibold">{selectedAirline.airline_name}</span> 
          <span className="text-slate-400 text-[10px] ml-1">({selectedAirline.country})</span>
        </p>
      ) : airlineId > 0 ? (
        <p className="text-[10px] text-slate-400 mt-1">Selected Airline ID: #{airlineId}</p>
      ) : null}
    </div>
  );
}