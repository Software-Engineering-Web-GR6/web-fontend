import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, LoginCredentials, User } from "../types";
import { authApi } from "../services/authApi";
import { clearStoredAuth, setStoredToken } from "../utils/authStorage";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          setStoredToken(response.token);
          localStorage.setItem("role", response.user.role);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error.response?.data?.detail ||
              error.response?.data?.message ||
              "Đăng nhập thất bại",
          });
          throw error;
        }
      },

      logout: () => {
        clearStoredAuth();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
