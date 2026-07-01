import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiResponse } from './apiClient';
import { useAuthStore } from './store/authStore';

export interface Route {
  route_id: number;
  departure_city: string;
  arrival_city: string;
  is_deleted: boolean;
}

export interface RoutePayload {
  departure_city: string;
  arrival_city: string;
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

export interface PaginatedRouteResponse {
  success: boolean;
  data: Route[];
  pagination: PaginationInfo;
}

// --1. get Mutation hook (Post) --
export const useRoutesQuery = (page: number, limit: number, search: string) => {
  return useQuery({
    queryKey: ['routes', page, limit, search], 
    queryFn: async () => {
      const skip = (page - 1) * limit;
      
      const response = await api.get(
        `/api/routes?skip=${skip}&limit=${limit}&search=${encodeURIComponent(search)}`
      );
      return response;
    },
  });
};

// ─── 2. Create Mutation Hook (POST) ───────────────────────────────────────
export function useCreateRouteMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: RoutePayload) => 
      api.post<Route>('/api/routes/', payload, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['routes'] });
      }
    },
  });
}

// ─── 3. Update Mutation Hook (PUT) ────────────────────────────────────────
export function useUpdateRouteMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RoutePayload }) => 
      api.put<Route>(`/api/routes/${id}`, payload, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['routes'] });
      }
    },
  });
}

// ─── 4. Delete Mutation Hook (DELETE) ─────────────────────────────────────
export function useDeleteRouteMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => 
      api.delete<null>(`/api/routes/${id}`, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['routes'] });
      }
    },
  });
}