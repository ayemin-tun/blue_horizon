import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient'; // မင်းရဲ့ apiClient လမ်းကြောင်းအတိုင်း ပြင်ပါ
import { useAuthStore } from './store/authStore';

// ─── Interfaces ────────────────────────────────────────────────────────────
export interface Airline {
  id?: number;          // Fallback id
  airline_id: number;   // Backend က သုံးထားတဲ့ တကယ့် ID
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

// ─── 1. Get Airlines Query Hook (GET) ───────────────────────────────────────
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
        // exact: false ပေးလိုက်ခြင်းဖြင့် ['airlines', page, limit] သုံးထားသမျှ pagination keys တွေကိုပါ အကုန် automatic refetch လုပ်ခိုင်းတာဖြစ်ပါတယ်
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