import { useMutation } from '@tanstack/react-query';
import { api, ApiResponse } from '../apiClient';

// Login Mutation Hook
export function useLoginMutation() {
  return useMutation({
    mutationFn: async ({ email, password }: any) => {
      return api.post('/api/login', { email, password });
    }
  });
}

// sRegister Mutation Hook
export function useRegisterMutation() {
  return useMutation({
    mutationFn: async ({ username, email, password }: any) => {
      return api.post('/api/register', { username, email, password });
    }
  });
}