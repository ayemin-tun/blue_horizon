import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';
import { useAuthStore } from './store/authStore';

export interface PasswordRequest {
  id: number;
  agent_id: number;
  username: string;
  email: string;
  status: 'pending' | 'resolved';
  created_at: string;
}

export interface PaginatedPasswordResponse {
  success: boolean;
  message: string;
  data: {
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

// 1. Get Password Requests Query (GET)
export const usePasswordRequestsQuery = (page: number, limit: number, search: string, status: string) => {
  return useQuery({
    queryKey: ['passwordRequests', page, limit, search, status],
    queryFn: async () => {
      const skip = (page - 1) * limit;
      let url = `/api/password-requests?skip=${skip}&limit=${limit}&search=${encodeURIComponent(search)}`;
      if (status) {
        url += `&status=${encodeURIComponent(status)}`;
      }

      const response = await api.get(url, { headers: authHeader() });
      return response as PaginatedPasswordResponse;
    },
  });
};

// 2. Resolve Password Request Mutation (PATCH)
export function useResolvePasswordRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api.patch(`/api/password-requests/${id}/resolve`, {}, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['passwordRequests'], exact: false });
      }
    },
  });
}