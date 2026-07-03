"use client";

import React from "react";
import { useAirlinesQuery, Airline, PaginatedAirlineResponse } from "@/services/airlineService";
import { Building2 } from "lucide-react";
import BaseSelectBox, { SelectOption }  from "@/components/BaseSelectBox";

interface AirlineSelectProps {
  value: number;
  onChange: (airlineId: number) => void;
  error?: string;
}

export default function AirlineSelect({ value, onChange, error }: AirlineSelectProps) {
  const { data: apiResponse, isLoading, isError } = useAirlinesQuery(1, 100, "");

  const res = apiResponse as unknown as PaginatedAirlineResponse;
  const airlines: Airline[] = res?.data || [];

//   fetch airline data from backend
  const airlineOptions: SelectOption[] = airlines.map((airline) => ({
    value: airline.airline_id,
    label: `${airline.airline_name} (${airline.country})`,
  }));

  return (
    <BaseSelectBox
      label="Select Airline"
      name="airline_id"
      value={value}
      onChange={onChange}
      options={airlineOptions}
      icon={Building2} 
      error={error}
      disabled={isLoading || isError}
      placeholder={isLoading ? "Loading airlines..." : isError ? "Failed to load airlines" : "-- Choose an Airline --"}
    />
  );
}