import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';
import { useAuthStore } from './store/authStore';

// ─── Interfaces ────────────────────────────────────────────────────────────
export interface Flight {
    airline: any;
    flight_id: number;
    airline_id: number;
    flight_no: string;
    total_seats: number;
    is_deleted: boolean;
}

export interface FlightPayload {
    airline_id: number;
    flight_no: string;
    total_seats: number;
}

export interface PaginationInfo {
    total: number;
    skip: number;
    limit: number;
}

export interface FlightMetricsInfo {
    total_flight: number;
    recently_joined: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    error: any;
}

export interface PaginatedFlightResponse {
    success: boolean;
    message: string;
    data: {
        metrics: FlightMetricsInfo;
        flights: Flight[];
        pagination: PaginationInfo;
    };
    error: any;
}


// Auth Header Helper
function authHeader(): Record<string, string> {
    const token = useAuthStore.getState().getValidToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── 1. Get Flights Query (GET) ─────────────────────────────────────────────
export const useFlightsQuery = (page: number, limit: number, search: string) => {
    return useQuery({
        queryKey: ['flights', page, limit, search],
        queryFn: async () => {
            const skip = (page - 1) * limit;
            let url = `/api/flights?skip=${skip}&limit=${limit}`;

            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }

            const response = await api.get<PaginatedFlightResponse>(url, { headers: authHeader() });
            return response;
        },
    });
};

// ─── 2. Create Agent Mutation (POST) ───────────────────────────────────────
export function useCreateFlightMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: FlightPayload) =>
            api.post<Flight>('/api/flights', payload, { headers: authHeader() }),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ['flights'], exact: false });
            }
        },
    });
}

// ─── 3. Update Flight Mutation (PUT) ───────────────────────────────────────
export function useUpdateFlightMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: FlightPayload }) =>
            api.put<Flight>(`/api/flights/${id}`, payload, { headers: authHeader() }),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ['flights'], exact: false });
            }
        },
    });
}



// ─── 4. Delete Flight Mutation (DELETE) ─────────────────────────────────────
export function useDeleteFlightMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            api.delete<null>(`/api/flights/${id}`, { headers: authHeader() }),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ['flights'], exact: false });
            }
        },
    });
}

