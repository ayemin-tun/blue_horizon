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
  flight_date: string;
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
        `/api/bookings/search?date=${encodeURIComponent(date.trim())}&departure_city=${encodeURIComponent(departure_city.trim())}&arrival_city=${encodeURIComponent(arrival_city.trim())}&skip=${skip}&limit=${limit}`
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
      const response = await api.post('/api/bookings', payload);
      return (response as unknown) as CreateBookingResponse;
    },
  });
};

// ─── Booking List API Interfaces ─────────────────────────────────────────
export interface FlightDetails {
  flight_instance_id: number;
  airline_name: string;
  flight_no: string;
  departure_city: string;
  arrival_city: string;
  flight_date: string;
  departure_time: string;
  arrival_time: string;
}

export interface BookedPassenger {
  passenger_id: number;
  name: string;
  nrc: string;
  dob: string;
  gender: string;
  phone: string;
  seat: string;
}


export interface AgentDetails {
  user_id: number;
  name: string;
  email?: string;
}

export interface BookingRecord {
  booking_id: number;
  ticket_code: string;
  user_id?: number | string;
  agent_details?: AgentDetails | null;   // 🆕
  booking_date: string;
  total_price: number;
  seat_class: string;
  status: string;
  flight_details: FlightDetails;
  passengers: BookedPassenger[];
}
export interface BookingMetrics {
  total_booking: number;
  confirmed_booking: number;
  cancelled_booking: number;
}

export interface FetchBookingsResponse {
  success: boolean;
  message: string;
  data: {
    metrics?: BookingMetrics; 
    bookings: BookingRecord[];
    pagination: {
      total: number;
      skip: number;
      limit: number;
    };
  };
}

interface FetchBookingsParams {
  search?: string;       
  status?: string;       
  seat_class?: string;   
  skip?: number;
  limit?: number;
}

interface FetchAgentBookingsParams extends FetchBookingsParams {
  user_id: string;       
}


export const useAdminBookingsQuery = (params: FetchBookingsParams = {}) => {
  const { search = "", status = "", seat_class = "", skip = 0, limit = 10 } = params;

  return useQuery<FetchBookingsResponse, Error>({
    queryKey: ['adminBookings', search, status, seat_class, skip, limit],
    queryFn: async () => {
      let url = `/api/bookings/admin/all?skip=${skip}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search.trim())}`;
      if (status) url += `&status=${encodeURIComponent(status.trim())}`;
      if (seat_class) url += `&seat_class=${encodeURIComponent(seat_class.trim())}`;

      const response = await api.get(url);
      return (response as unknown) as FetchBookingsResponse;
    },
    staleTime: 1000 * 60 * 2, 
  });
};

// ─── 2. Fixed Agent Bookings Query Hook ──────────────────────────────────
export const useAgentBookingsQuery = (params: FetchAgentBookingsParams) => {
  const { user_id, search = "", status = "", seat_class = "", skip = 0, limit = 10 } = params;

  return useQuery<FetchBookingsResponse, Error>({
    queryKey: ['agentBookings', user_id, search, status, seat_class, skip, limit],
    queryFn: async () => {
      let url = `/api/bookings/agent/my-bookings?user_id=${encodeURIComponent(user_id.trim())}&skip=${skip}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search.trim())}`;
      if (status) url += `&status=${encodeURIComponent(status.trim())}`;
      if (seat_class) url += `&seat_class=${encodeURIComponent(seat_class.trim())}`;

      const response = await api.get(url);
      return (response as unknown) as FetchBookingsResponse;
    },
    enabled: !!user_id, 
    staleTime: 1000 * 60 * 2, 
  });
};

// ─── Booking Detail API Interface ────────────────────────────────────────
export interface BookingDetailResponse {
  success: boolean;
  message: string;
  data: BookingRecord | null;
  error: { code: string; details: string } | null;
}

export const useBookingDetailQuery = (bookingId: string | number) => {
  return useQuery<BookingDetailResponse, Error>({
    queryKey: ['bookingDetail', bookingId],
    queryFn: async () => {
      // 💡 Note: If your routing is setup via query param or sub-route, verify this endpoint matches
      const response = await api.get(`/api/bookings/${bookingId}`);
      return (response as unknown) as BookingDetailResponse;
    },
    enabled: !!bookingId, 
  });
};