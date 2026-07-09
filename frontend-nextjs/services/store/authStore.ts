import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  expiry: number | null;
  userId: number | null; 
  name: string | null;   
  role: string | null;   
  phone_no: string | null;
  email: string | null;

  setAuth: (token: string, ttl: number, userId: number, name: string, role: string,phone_no: string, email: string) => void; // 👈 Updated parameter
  getValidToken: () => string | null;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state is null 
      token: null,
      expiry: null,
      userId: null, 
      name: null,
      role: null,
      phone_no:null,
      email:null,


      // Store Token, Expiry, User ID, Name and Role if login is successful
      setAuth: (token, ttl, userId, name, role,phone_no, email) => {
        const expiryTime = new Date().getTime() + ttl; // current time + TTL (ms)
        set({ token, expiry: expiryTime, userId, name, role,phone_no, email }); 
      },

      // Check if token is expired or not 
      getValidToken: () => {
        const { token, expiry } = get();
        if (!token || !expiry) return null;

        const now = new Date().getTime();
        if (now > expiry) {
          // If token is expired, clear everything
          set({ token: null, expiry: null, userId: null, name: null, role: null,phone_no: null,email: null }); // 👈 Added userId
          return null;
        }
        return token;
      },

      // For logout (Clear all user data)
      logout: () => set({ token: null, expiry: null, userId: null, name: null, role: null,phone_no: null,email: null }), // 👈 Added userId
    }),
    {
      name: 'bluehorizon-auth', // store on local storage 
    }
  )
);