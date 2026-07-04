"use client";

import React from "react";
import { useRoutesQuery, Route, PaginatedRouteResponse } from "@/services/routeService";
import { MapPin } from "lucide-react";
import BaseSelectBox, { SelectOption }  from "@/components/BaseSelectBox";

interface RouteSelectProps {
  value: number | string;
  onChange: (routeId: any) => void;
  error?: string;
  placeholder?: string;
}

export default function RouteFilter({ value, onChange, error, placeholder }: RouteSelectProps) {
  const { data: apiResponse, isLoading, isError } = useRoutesQuery(1, 100, "");

  const res = apiResponse as unknown as PaginatedRouteResponse;
  const routes: Route[] = res?.data || [];

  const routeOptions: SelectOption[] = routes.map((route) => ({
    value: route.route_id,
    label: `${route.departure_city} ➔ ${route.arrival_city}`,
  }));

  const defaultPlaceholder = isLoading 
    ? "Loading routes..." 
    : isError 
    ? "Failed to load routes" 
    : "All";

  return (
    <BaseSelectBox
      label=""
      name="route_id"
      value={value}
      onChange={onChange}
      options={routeOptions}
      icon={MapPin} 
      error={error}
      disabled={isLoading || isError}
      placeholder={placeholder || defaultPlaceholder} 
    />
  );
}