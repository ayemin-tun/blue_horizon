import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';
import { useAuthStore } from './store/authStore';

// ─── Interfaces ────────────────────────────────────────────────────────────
export interface Airline {
  id?: number;          
  airline_id: number;   
  airline_name: string;
  country: string;
  is_deleted: boolean;
}

export interface AirlinePayload {
  airline_name: string;

  
  country: string;
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

// Auth Header Helper
function authHeader(): Record<string, string> {
  const token = useAuthStore.getState().getValidToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}


// --1. get Mutation hook (Get) --
export const useAirlinesQuery = (page: number, limit: number, search: string) => {
  return useQuery({
    queryKey: ['airlines', page, limit, search], 
    queryFn: async () => {
      const skip = (page - 1) * limit;
      
      const response = await api.get(
        `/api/airlines?skip=${skip}&limit=${limit}&search=${encodeURIComponent(search)}`
      );
      return response;
    },
  });
};

// ─── 2. Create Mutation Hook (POST) ───────────────────────────────────────
export function useCreateAirlineMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AirlinePayload) => 
      api.post<Airline>('/api/airlines/', payload, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['airlines'], exact: false });
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
        queryClient.invalidateQueries({ queryKey: ['airlines'], exact: false });
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
        queryClient.invalidateQueries({ queryKey: ['airlines'], exact: false });
      }
    },
  });
}