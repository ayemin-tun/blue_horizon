"use client";

import React from "react";
import { useFlightsQuery, PaginatedFlightResponse } from "@/services/flightService";
import { Plane } from "lucide-react";
import BaseSelectBox, { SelectOption }  from "@/components/BaseSelectBox";

interface FlightSelectProps {
  value: number;
  onChange: (flightId: number) => void;
  error?: string;
}

export default function FlightSelect({ value, onChange, error }: FlightSelectProps) {
  const { data: apiResponse, isLoading, isError } = useFlightsQuery(1, 100, "");

  // check backend response structure
  const res = apiResponse as unknown as PaginatedFlightResponse;
  
  const flights = Array.isArray(res?.data) 
    ? res.data 
    : (res?.data as any)?.flights || [];

  const flightOptions: SelectOption[] = Array.isArray(flights) 
    ? flights.map((flight: any) => ({
        value: flight.flight_id,
        label: `${flight.flight_no} (${flight.airline?.airline_name || 'Airline'})`,
      }))
    : [];

  return (
    <BaseSelectBox
      label="Select Flight"
      name="flight_id"
      value={value}
      onChange={onChange}
      options={flightOptions}
      icon={Plane}
      error={error}
      disabled={isLoading || isError}
      placeholder={
        isLoading 
          ? "Loading flights..." 
          : isError 
          ? "Failed to load flights" 
          : "-- Choose a Flight --"
      }
    />
  );
}