import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiResponse } from './apiClient';
import { useAuthStore } from './store/authStore';

export interface Airline {
  airline_id: number;
  airline_name: string;
  country: string;
  is_deleted: boolean;
}

export interface AirlinePayload {
  airline_name: string;
  country: string;
}

function authHeader(): Record<string, string> {
  const token = useAuthStore.getState().getValidToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface PaginationInfo {
  total: number;
  skip: number;
  limit: number;
}

export interface PaginatedAirlineResponse {
  success: boolean;
  data: Airline[];
  pagination: PaginationInfo;
}

export function useAirlinesQuery(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit; 
  
  return useQuery({
    queryKey: ['airlines', page, limit],
    queryFn: () => 
      api.get<PaginatedAirlineResponse>(`/api/airlines/?skip=${skip}&limit=${limit}`, { 
        headers: authHeader() 
      }),
  });
}

// ─── 2. Create Mutation Hook (POST) ───────────────────────────────────────
export function useCreateAirlineMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AirlinePayload) => 
      api.post<Airline>('/api/airlines/', payload, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['airlines'] });
      }
    },
  });
}

// ─── 3. Update Mutation Hook (PUT) ────────────────────────────────────────
export function useUpdateAirlineMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AirlinePayload }) => 
      api.put<Airline>(`/api/airlines/${id}`, payload, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['airlines'] });
      }
    },
  });
}

// ─── 4. Delete Mutation Hook (DELETE) ─────────────────────────────────────
export function useDeleteAirlineMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => 
      api.delete<null>(`/api/airlines/${id}`, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['airlines'] });
      }
    },
  });
}
