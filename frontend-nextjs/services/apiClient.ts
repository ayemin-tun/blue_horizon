const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

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
async function request<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return await response.json();
  } catch (error) {
    // Backend server Down error Cache
    return {
      success: false,
      message: 'Network Error',
      data: null,
      error: { 
        code: 'NETWORK_FAILURE', 
        details: 'Cannot connect to backend server. Please check your connection or start FastAPI server.' 
      }
    };
  }
}

// For POST and GET Helper 
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body: any, options?: RequestInit) => 
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
};