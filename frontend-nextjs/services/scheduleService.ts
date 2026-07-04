import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';
import { useAuthStore } from './store/authStore';

// ─── Interfaces ────────────────────────────────────────────────────────────
export interface Schedule {
  schedule_id: number;
  flight_id: number;
  flight_no: string;
  airline_name: string;
  route_id: number;
  route_details: string;
  departure_time: string;
  arrival_time: string;
  flight_type: string;
  economy_price: number;
  business_price: number;
}

export interface SchedulePayload {
  flight_id: number;
  route_id: number;
  flight_type: string;
  departure_time: string;
  arrival_time: string;
  economy_price: number;
  business_price: number;
}

export interface PaginationInfo {
  total: number;
  skip: number;
  limit: number;
}

export interface MetricsInfo {
  total_schedules: number;
  total_outbound: number;
  total_inbound: number;
}

export interface PaginatedScheduleResponse {
  success: boolean;
  message: string;
  data: {
    metrics: MetricsInfo;
    schedules: Schedule[];
    pagination: PaginationInfo;
  };
  error: any;
}

export interface SingleScheduleResponse {
  success: boolean;
  message: string;
  data: Schedule & {
    departure_city: string;
    arrival_city: string;
  };
  error: any;
}

// Auth Header Helper
function authHeader(): Record<string, string> {
  const token = useAuthStore.getState().getValidToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── 1. Get Schedules Query (GET) ──────────────────────────────────────────
export const useSchedulesQuery = (page: number, limit: number, search: string, routeId?: number) => {
  return useQuery({
    queryKey: ['schedules', page, limit, search, routeId],
    queryFn: async () => {
      const skip = (page - 1) * limit;
      let url = `/api/schedules?skip=${skip}&limit=${limit}&search=${encodeURIComponent(search)}`;
      if (routeId) {
        url += `&route_id=${routeId}`;
      }

      const response = await api.get<PaginatedScheduleResponse>(url);
      return response;
    },
  });
};

// ─── 1.5. Get Single Schedule Detail Query (GET) ───────────────────────────
export const useScheduleDetailQuery = (id: number | null) => {
  return useQuery({
    queryKey: ['schedules', 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get<SingleScheduleResponse>(`/api/schedules/${id}`);
      return response;
    },
    enabled: !!id, 
  });
};

// ─── 2. Create Schedule Mutation (POST) ────────────────────────────────────
export function useCreateScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SchedulePayload) =>
      api.post<any>('/api/schedules', payload, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['schedules'], exact: false });
      }
    },
  });
}

// ─── 3. Update Schedule Mutation (PUT) ──────────────────────────────────────
export function useUpdateScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SchedulePayload }) =>
      api.put<any>(`/api/schedules/${id}`, payload, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['schedules'], exact: false });
      }
    },
  });
}

// ─── 4. Delete Schedule Mutation (DELETE) ──────────────────────────────────
export function useDeleteScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api.delete<null>(`/api/schedules/${id}`, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['schedules'], exact: false });
      }
    },
  });
}