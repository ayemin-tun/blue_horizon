import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './apiClient';

export interface CitiesResponse {
  success: boolean;
  cities: string[];
}
// City list Fetching Hook
export const useCitiesQuery = () => {
  return useQuery<CitiesResponse, Error>({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await api.get('/api/bookings/cities');
      return (response as unknown) as CitiesResponse;
    },
    staleTime: 1000 * 60 * 5, 
  });
};

// ─── Search Flight API Interface ──────────────────────────────────────────
export interface FlightResult {
  airline_name: string;
  flight_no: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  departure_city: string;
  arrival_city: string;
  economy_price: number;
  business_price: number;
  seats_available: number;
}

export interface FlightSearchResponse {
  success: boolean;
  message: string;
  data: FlightResult[];
}

export interface SearchParams {
  date: string;
  departure_city: string;
  arrival_city: string;
}

// ─── Search Mutation Hook ────────────────────────────────────────────────
export const useSearchFlightsMutation = () => {
  return useMutation<FlightSearchResponse, Error, SearchParams>({
    mutationFn: async (params: SearchParams) => {
      const { date, departure_city, arrival_city } = params;
      const response = await api.get(
        `/api/bookings/search?date=${encodeURIComponent(date)}&departure_city=${encodeURIComponent(departure_city)}&arrival_city=${encodeURIComponent(arrival_city)}`
      );
      return (response as unknown) as FlightSearchResponse;
    },
  });
};