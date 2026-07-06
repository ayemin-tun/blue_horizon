"use client";

import React from "react";
import { useRoutesQuery, Route, PaginatedRouteResponse } from "@/services/routeService";
import { MapPin } from "lucide-react";
import BaseSelectBox, { SelectOption }  from "@/components/BaseSelectBox";
import { useFlightsQuery } from "@/services/flightService"; 

interface RouteSelectProps {
  value: number;
  onChange: (routeId: number) => void;
  error?: string;
}

export default function RouteSelect({ value, onChange, error }: RouteSelectProps) {
  
  const { data: apiResponse, isLoading, isError } = useRoutesQuery(1, 100, "");

  const res = apiResponse as unknown as PaginatedRouteResponse;
  const routes: Route[] = res?.data || [];

  // Options mapping: e.g., "Yangon ➔ Mandalay"
  const routeOptions: SelectOption[] = routes.map((route) => ({
    value: route.route_id,
    label: `${route.departure_city} ➔ ${route.arrival_city}`,
  }));

  return (
    <BaseSelectBox
      label="Select Route"
      name="route_id"
      value={value}
      onChange={onChange}
      options={routeOptions}
      icon={MapPin} 
      error={error}
      disabled={isLoading || isError}
      placeholder={
        isLoading 
          ? "Loading routes..." 
          : isError 
          ? "Failed to load routes" 
          : "-- Choose a Route --"
      }
    />
  );
}