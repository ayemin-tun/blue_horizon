import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  expiry: number | null;
  userId: number | null; // 👈 Added User ID State
  name: string | null;   // User Name State
  role: string | null;   // User Role State
  setAuth: (token: string, ttl: number, userId: number, name: string, role: string) => void; // 👈 Updated parameter
  getValidToken: () => string | null;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state is null 
      token: null,
      expiry: null,
      userId: null, // 👈 Initialized as null
      name: null,
      role: null, 

      // Store Token, Expiry, User ID, Name and Role if login is successful
      setAuth: (token, ttl, userId, name, role) => {
        const expiryTime = new Date().getTime() + ttl; // current time + TTL (ms)
        set({ token, expiry: expiryTime, userId, name, role }); 
      },

      // Check if token is expired or not 
      getValidToken: () => {
        const { token, expiry } = get();
        if (!token || !expiry) return null;

        const now = new Date().getTime();
        if (now > expiry) {
          // If token is expired, clear everything
          set({ token: null, expiry: null, userId: null, name: null, role: null }); // 👈 Added userId
          return null;
        }
        return token;
      },

      // For logout (Clear all user data)
      logout: () => set({ token: null, expiry: null, userId: null, name: null, role: null }), // 👈 Added userId
    }),
    {
      name: 'bluehorizon-auth', // store on local storage 
    }
  )
);