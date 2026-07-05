import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';
import { useAuthStore } from './store/authStore';

// ─── Interfaces ────────────────────────────────────────────────────────────
export interface ScheduleInstance {
  instance_id: number;
  schedule_id: number;
  flight_no: string;
  airline_name: string;
  route_id: number;
  route_details: string;
  flight_date: string;
  departure_time: string;
  arrival_time: string;
  status: string;
  economy_seats_occupied: number;
  business_seats_occupied: number;
  economy_price: number;
  business_price: number;
}

export interface InstanceUpdatePayload {
  status?: string;
  override_economy_price?: number;
  override_business_price?: number;
}

export interface MetricsInfo {
  total_instances: number;
  total_scheduled: number;
  total_departed: number;
  total_cancelled: number;
}

export interface PaginatedInstanceResponse {
  success: boolean;
  message: string;
  data: {
    metrics: MetricsInfo;
    instances: ScheduleInstance[];
    pagination: { total: number; skip: number; limit: number };
  };
  error: any;
}

// Auth Header Helper
function authHeader(): Record<string, string> {
  const token = useAuthStore.getState().getValidToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── 1. Get Instances Query (GET) ──────────────────────────────────────────
export const useInstancesQuery = (
  page: number, 
  limit: number, 
  search: string, 
  routeId?: number, 
  status?: string,
  fromDate?: string,
  toDate?: string
) => {
  return useQuery({
    queryKey: ['schedule-instances', page, limit, search, routeId, status, fromDate, toDate],
    queryFn: async () => {
      const skip = (page - 1) * limit;
      let url = `/api/schedule-instances?skip=${skip}&limit=${limit}&search=${encodeURIComponent(search)}`;
      if (routeId) url += `&route_id=${routeId}`;
      if (status) url += `&status=${status}`;
      if (fromDate) url += `&from_date=${fromDate}`;
      if (toDate) url += `&to_date=${toDate}`;

      const response = await api.get<PaginatedInstanceResponse>(url);
      return response;
    },
  });
};

// ─── 2. Get Single Instance Detail (GET) ──────────────────────────────────
export const useInstanceDetailQuery = (id: number | null) => {
  return useQuery({
    queryKey: ['schedule-instances', 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get<any>(`/api/schedule-instances/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// ─── 3. Update Instance Mutation (PUT) ─────────────────────────────────────
export function useUpdateInstanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: InstanceUpdatePayload }) =>
      api.put<any>(`/api/schedule-instances/${id}`, payload, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        // Refresh both list and detail view
        queryClient.invalidateQueries({ queryKey: ['schedule-instances'], exact: false });
      }
    },
  });
}