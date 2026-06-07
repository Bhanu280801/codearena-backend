import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string | number;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => {
        localStorage.removeItem("token")
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: "auth-storage", // stores auth state in localStorage
    }
  )
)
