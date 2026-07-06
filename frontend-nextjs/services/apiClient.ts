import { useAuthStore } from "@/services/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

type ApiOptions = RequestInit & { requiresAuth?: boolean };

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  error: {
    code: string;
    details: string;
  } | null;
}

// 🌐 Global Request Handler
async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  const { requiresAuth = false, ...restOptions } = options; // Default false (no Token require)

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(restOptions.headers as Record<string, string>),
    };

    // requiresAuth: true for token add
    if (requiresAuth) {
      const token = useAuthStore.getState().getValidToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...restOptions,
      headers: headers,
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Network Error',
      data: null,
      error: {
        code: 'NETWORK_FAILURE',
        details: 'Cannot connect to backend server.'
      }
    };
  }
}

// Helper Default is false no token requires
export const api = {
  get: <T>(endpoint: string, options?: ApiOptions) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body: any, options?: ApiOptions) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),

  put: <T>(endpoint: string, body: any, options?: ApiOptions) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),

  patch: <T>(endpoint: string, body: any, options?: ApiOptions) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),

  delete: <T>(endpoint: string, options?: ApiOptions) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};