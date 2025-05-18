import { create } from "zustand";

interface User {
  id: string;
  username: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const authStore = (set) => ({
  user: null,
  login: (userInfo) => set((state) => ({ user: userInfo })),
});

const useAuthStore = create<AuthStore>(authStore);
