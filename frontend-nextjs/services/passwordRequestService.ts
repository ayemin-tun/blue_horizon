import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';
import { useAuthStore } from './store/authStore';

export interface PasswordRequest {
  id: number;
  email: string;
  username: string;
  status: 'PENDING' | 'RESOLVED';
  created_at: string;
  updated_at: string;
}

export interface PasswordMetrics {
  total_pending: number;
  total_resolved: number;
  total_all: number;
}

export interface PaginatedPasswordResponse {
  success: boolean;
  message: string;
  data: {
    requests: PasswordRequest[];
    metrics: PasswordMetrics;
    pagination: {
      page: number;
      limit: number;
      total_items: number;
    };
  };
  error: any;
}

function authHeader(): Record<string, string> {
  const token = useAuthStore.getState().getValidToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const usePasswordRequestsQuery = (page: number, limit: number, search: string, status: string) => {
  return useQuery({
    queryKey: ['passwordRequests', page, limit, search, status],
    queryFn: async () => {
      let url = `/admin/password-requests?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await api.get(url, { headers: authHeader() });
      return response as PaginatedPasswordResponse;
    },
  });
};

export function useResolvePasswordRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, new_password }: { id: number; new_password: string }) =>
      api.patch(`/admin/password-requests/${id}/resolve`, { new_password }, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['passwordRequests'], exact: false });
      }
    },
  });
}