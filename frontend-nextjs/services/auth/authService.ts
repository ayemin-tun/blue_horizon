import { useMutation } from '@tanstack/react-query';
import { api, ApiResponse } from '../apiClient';

export function useLoginMutation() {
  return useMutation({
    mutationFn: async ({ email, password }: any) => {
      return api.post('/api/login', { email, password });
    }
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async ({ username, email, password }: any) => {
      return api.post('/api/register', { username, email, password });
    }
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      // Adjusted endpoint to perfectly match Backend Prefix + Router Path
      return api.post('/api/auth/forgot-password', { email });
    }
  });
}