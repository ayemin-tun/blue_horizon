import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  expiry: number | null;
  setAuth: (token: string, ttl: number) => void;
  getValidToken: () => string | null;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      expiry: null,

      // Store Token if login is success
      setAuth: (token, ttl) => {
        const expiryTime = new Date().getTime() + ttl; // current time + TTL (ms)
        set({ token, expiry: expiryTime });
      },

      // check token is expire or not 
      getValidToken: () => {
        const { token, expiry } = get();
        if (!token || !expiry) return null;

        const now = new Date().getTime();
        if (now > expiry) {
          // if token is null auto login 
          set({ token: null, expiry: null });
          return null;
        }
        return token;
      },

      //for logout
      logout: () => set({ token: null, expiry: null }),
    }),
    {
      name: 'bluehorizon-auth', // store on local storage 
    }
  )
);