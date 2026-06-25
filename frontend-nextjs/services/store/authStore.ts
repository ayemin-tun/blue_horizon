import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  expiry: number | null;
  name: string | null; //  User Name State
  role: string | null; // User Role  State
  setAuth: (token: string, ttl: number, name: string, role: string) => void;
  getValidToken: () => string | null;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      //Initial state is null 
      token: null,
      expiry: null,
      name: null,
      role: null, 

      // Store Token, Expiry, Name and Role if login is success
      setAuth: (token, ttl, name, role) => {
        const expiryTime = new Date().getTime() + ttl; // current time + TTL (ms)
        set({ token, expiry: expiryTime, name, role }); 
      },

      // check token is expire or not 
      getValidToken: () => {
        const { token, expiry } = get();
        if (!token || !expiry) return null;

        const now = new Date().getTime();
        if (now > expiry) {
          // if token is expire, clear everything
          set({ token: null, expiry: null, name: null, role: null });
          return null;
        }
        return token;
      },

      // for logout (Clear all user data)
      logout: () => set({ token: null, expiry: null, name: null, role: null }),
    }),
    {
      name: 'bluehorizon-auth', // store on local storage 
    }
  )
);