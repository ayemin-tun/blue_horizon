import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';
import { useAuthStore } from './store/authStore';

// ─── Interfaces ────────────────────────────────────────────────────────────
export interface Agent {
  agent_id: number;
  username: string;
  email: string;
  phone_no: string;
  status: string;
  joined_date: string;
  is_deleted: boolean;
  is_email_verified: boolean;
}

export interface AgentPayload {
  username: string;
  email: string;
  password?: string;
  phone_no?: string;
  status?: string;
  is_email_verified: boolean;
}

export interface AgentStatusPayload {
  status: string;
}

export interface PaginationInfo {
  total: number;
  skip: number;
  limit: number;
}

export interface MetricsInfo {
  total: number;
  active: number;
  inactive: number;
  recent_joined: number;
}

export interface PaginatedAgentResponse {
  success: boolean;
  message: string;
  data: {
    metrics: MetricsInfo;
    agents: Agent[];
    pagination: PaginationInfo;
  };
  error: any;
}

// Auth Header Helper
function authHeader(): Record<string, string> {
  const token = useAuthStore.getState().getValidToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── 1. Get Agents Query (GET) ─────────────────────────────────────────────
export const useAgentsQuery = (page: number, limit: number, search: string,status:string) => {
  return useQuery({
    queryKey: ['agents', page, limit, search,status],
    queryFn: async () => {
      const skip = (page - 1) * limit;
      let url = `/api/agents?skip=${skip}&limit=${limit}&search=${encodeURIComponent(search)}`;
      if (status) {
        url += `&status=${encodeURIComponent(status)}`;
      }

      const response = await api.get(url);
      return response;
    },
    staleTime: 0,                     // Always refetch on focus / mount
    refetchInterval: 15000,           // Auto-poll every 15 seconds
    refetchIntervalInBackground: true, // Keep polling even when tab is inactive
  });
};

// ─── 2. Create Agent Mutation (POST) ───────────────────────────────────────
export function useCreateAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AgentPayload) =>
      api.post<Agent>('/api/agents', payload, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['agents'], exact: false });
      }
    },
  });
}

// ─── 3. Update Agent Status Mutation (PATCH) ───────────────────────────────
export function useUpdateAgentStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AgentStatusPayload }) =>
      api.patch<Agent>(`/api/agents/${id}/status`, payload, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['agents'], exact: false });
      }
    },
  });
}

// ─── 4. Delete Agent Mutation (DELETE) ─────────────────────────────────────
export function useDeleteAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api.delete<null>(`/api/agents/${id}`, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['agents'], exact: false });
      }
    },
  });
}

// ─── 5. Update Agent All Data Mutation (PUT) ───────────────────────────────
export function useUpdateAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AgentPayload }) =>
      api.put<Agent>(`/api/agents/${id}`, payload, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['agents'], exact: false });
      }
    },
  });
}

export interface AgentEmailVerifyPayload {   // 🆕
  is_email_verified: boolean;
}

// ─── 6. Update Agent Email Verification Mutation (PATCH) — quick table action ───
export function useUpdateAgentEmailVerificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AgentEmailVerifyPayload }) =>
      api.patch<Agent>(`/api/agents/${id}/verify-email`, payload, { headers: authHeader() }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['agents'], exact: false });
      }
    },
  });
}
