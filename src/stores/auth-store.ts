import { create } from "zustand";
import { persist } from "zustand/middleware";
import authAPI from "@/services/api/auth-api";
import { userAPI } from "../services/api/user-api";
import type { LoginRequest } from "@/types/auth";
import type { ApiError } from "@/types/api";

// Types for authentication
interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  roleName: string;
  parentId: string | null;
}

interface AuthState {
  // State
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;
  checkAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.login(credentials);

          if (response.success) {
            const { accessToken, refreshToken, ...userData } = response.data;

            // Store tokens
            localStorage.setItem("accessToken", accessToken);
            if (refreshToken) {
              localStorage.setItem("refreshToken", refreshToken);
            }

            const authUser: AuthUser = {
              _id: userData._id,
              fullName: userData.fullName,
              email: userData.email,
              phone: userData.phone,
              roleName: userData.roleName,
              parentId: userData.parentId,
            };

            set({
              user: authUser,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          const apiError = error as ApiError;
          
          // Log error for debugging
          console.error("Login error:", apiError);
          
          set({
            error: apiError.message || "Đăng nhập thất bại",
            isLoading: false,
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
          });

          // Clear tokens from localStorage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          
          // Re-throw error so LoginForm can handle it
          throw error;
        }
      },

      refreshAccessToken: async () => {
        try {
          const response = await userAPI.refreshToken();

          if (response.success) {
            const { accessToken } = response.data;

            // Update stored token
            localStorage.setItem("accessToken", accessToken);

            set({
              accessToken,
              error: null,
            });
          }
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      logout: () => {
        // Clear tokens from localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user: AuthUser) => {
        set({ user });
      },

      setTokens: (accessToken: string, refreshToken?: string) => {
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        set({
          accessToken,
          refreshToken: refreshToken || get().refreshToken,
          isAuthenticated: true,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      checkAuth: () => {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (accessToken && refreshToken) {
          set({
            accessToken,
            refreshToken,
            isAuthenticated: true,
          });
        } else {
          get().logout();
        }
      },
    }),
    {
      name: "auth-storage",
      // Only persist essential auth data
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export type { AuthStore };
