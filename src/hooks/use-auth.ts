import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores";

/**
 * Custom hook for authentication logic
 * Provides auth state and actions with additional business logic
 */
export function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    login: authLogin,
    logout: authLogout,
    clearError,
    setUser,
    setTokens,
    checkAuth
  } = useAuthStore();

  // Initialize auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Check user role based on roleName
  const isAdmin = user?.roleName === "Admin";
  const isAgent = user?.roleName === "AgentLv1" || user?.roleName === "AgentLv2";
  const isClient = user?.roleName === "Client";

  // Enhanced logout function
  const logout = () => {
    authLogout();
    navigate("/login", { replace: true });
  };

  // Auto-logout on token expiration
  useEffect(() => {
    if (!accessToken) return;

    try {
      // Decode JWT token to check expiration
      const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
      const expirationTime = tokenPayload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      if (expirationTime <= currentTime) {
        // Token is expired, logout user
        logout();
        return;
      }

      // Set timer to logout when token expires
      const timeUntilExpiration = expirationTime - currentTime;
      const logoutTimer = setTimeout(logout, timeUntilExpiration);

      return () => clearTimeout(logoutTimer);
    } catch (error) {
      // Invalid token format - don't logout immediately
      // Let the API calls handle token validation
      console.warn("Invalid token format:", error);
    }
  }, [accessToken]);

  return {
    // State
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,

    // Role checks
    isAdmin,
    isAgent,
    isClient,

    // Actions
    login: authLogin,
    logout,
    clearError,
    setUser,
    setTokens,
  };
}
