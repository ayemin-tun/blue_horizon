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
  flight_instance_id: number;
  airline_name: string;
  flight_no: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  departure_city: string;
  arrival_city: string;
  flight_date:string;
  economy_price: number;
  business_price: number;
  seats_available: number;
  economy_seats_available: number; 
  business_seats_available: number;
}

export interface FlightSearchResponse {
  success: boolean;
  message: string;
  data: FlightResult[];
}

interface SearchParams {
  date: string;
  departure_city: string;
  arrival_city: string;
  skip?: number;  
  limit?: number;
}

export const useSearchFlightsMutation = () => {
  return useMutation<FlightSearchResponse, Error, SearchParams>({
    mutationFn: async (params: SearchParams) => {
      const { date, departure_city, arrival_city, skip = 0, limit = 5 } = params; 

      const response = await api.get(
        `/api/bookings/search?date=${encodeURIComponent(date)}&departure_city=${encodeURIComponent(departure_city)}&arrival_city=${encodeURIComponent(arrival_city)}&skip=${skip}&limit=${limit}`
      );
      return (response as unknown) as FlightSearchResponse;
    },
  });
};

// ─── Create Booking API Interfaces ───────────────────────────────────────
export interface PassengerPayload {
  name: string;
  nrc: string;
  dob: string;
  gender: string;
  phone: string;
}

export interface CreateBookingPayload {
  flight_instance_id: number;
  user_id: number | null;
  seat_class: string;
  total_price: number;
  passengers: PassengerPayload[];
  booked_at: string;
}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  data: {
    booking_id: number;
    ticket_id: string;
    flight_instance_id: number;
    seat_class: string;
    total_price: number;
    booked_at: string;
    passengers: Array<PassengerPayload & { passenger_id: number; seat: string }>;
  };
  error: { code: string; details: string } | null;
}

export const useCreateBookingMutation = () => {
  return useMutation<CreateBookingResponse, Error, CreateBookingPayload>({
    mutationFn: async (payload: CreateBookingPayload) => {
      // Assuming your api configuration client handles baseline URLs internally
      const response = await api.post('/api/bookings', payload);
      return (response as unknown) as CreateBookingResponse;
    },
  });
};