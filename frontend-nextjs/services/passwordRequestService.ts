import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';
import { useAuthStore } from './store/authStore';

export interface PasswordRequest {
  id: number;
  email: string;
  username: string;
  phone_no: string;
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
    metrics: PasswordMetrics;
    requests: PasswordRequest[];
    pagination: {
      total: number;
      skip: number;
      limit: number;
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
      const skip = (page - 1) * limit;
      let url = `/api/admin/password-requests?skip=${skip}&limit=${limit}&search=${encodeURIComponent(search)}`;
      if (status) {
        url += `&status=${encodeURIComponent(status)}`;
      }
      const response = await api.get(url);
      return response;
    },
  });
};

// ─── 2. Resolve Password Request Mutation (PATCH) ──────────────────────────
export interface ResolvePasswordPayload {
  new_password: string;
}

export function useResolvePasswordRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ResolvePasswordPayload }) =>
      api.patch(`/api/admin/password-requests/${id}/resolve`, payload, { headers: authHeader() }),
    
    onSuccess: (res) => {
      if (res.success) {
         queryClient.invalidateQueries({ queryKey: ['passwordRequests'], exact: false });
      }
    },
  });
}

export interface PendingCountResponse {
  success: boolean;
  message: string;
  data: {
    pending_count: number;
  };
  error: any;
}

export const usePendingPasswordRequestsCountQuery = () => {
  return useQuery<any>({
    queryKey: ['passwordRequests', 'pendingCount'],
    queryFn: async () => {
      const response = await api.get('/api/admin/password-requests/pending-count', {
        headers: authHeader(),
      });
      return response;
    },
    refetchInterval: 30000, 
  });
};
