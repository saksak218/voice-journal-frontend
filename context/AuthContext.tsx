// context/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, AuthContextType, AuthResult, AuthResponse } from "@/types/auth";
import { AxiosError } from "axios";
import api from "@/lib/api";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Token management utilities
const TOKEN_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  ADMIN_TOKEN: "adminToken",
  USER: "user",
} as const;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is logged in on mount and route changes
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle route protection
  useEffect(() => {
    if (!loading) {
      handleRouteProtection();
    }
  }, [pathname, loading, user]);

  const checkAuth = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
      const storedUser = localStorage.getItem(TOKEN_KEYS.USER);
      const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);

      if (refreshToken && storedUser) {
        const parsedUser: User = JSON.parse(storedUser);

        // Verify access token is still valid
        if (accessToken) {
          try {
            const decoded = jwtDecode<{ exp: number }>(accessToken);
            const currentTime = Date.now() / 1000;

            // If token is expired or about to expire (within 5 minutes), refresh it
            if (decoded.exp < currentTime + 300) {
              await refreshAccessToken();
            }
          } catch (error) {
            // Token decode failed, try to refresh
            await refreshAccessToken();
          }
        }

        setUser(parsedUser);
      } else {
        // No tokens found, clear everything
        clearAuth();
      }
    } catch (error) {
      console.error("Auth check error:", error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const handleRouteProtection = () => {
    const publicRoutes = ["/login", "/register", "/"];
    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname?.startsWith(route)
    );
    const isAdminRoute = pathname?.startsWith("/admin");
    const isDashboardRoute = pathname?.startsWith("/dashboard");

    // If on public route and logged in, redirect to dashboard
    if ((pathname === "/login" || pathname === "/register") && user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
      return;
    }

    // If on protected route and not logged in, redirect to login
    if ((isAdminRoute || isDashboardRoute) && !user) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    // If on admin route and not admin, redirect to dashboard
    if (isAdminRoute && user && user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    // If on dashboard and is admin, redirect to admin dashboard
    if (isDashboardRoute && !isAdminRoute && user && user.role === "admin") {
      router.push("/admin/dashboard");
      return;
    }
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        clearAuth();
        return false;
      }

      const response = await api.post("/auth/refresh", {
        refreshToken,
      });

      if (response.data.success) {
        const { accessToken } = response.data.data;
        localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
        return true;
      }

      clearAuth();
      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      clearAuth();
      return false;
    }
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.USER);
    setUser(null);
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", {
        name,
        email,
        password,
      });

      const { user, accessToken, refreshToken, adminToken } =
        response.data.data!;

      // Save tokens and user to localStorage
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));

      if (adminToken) {
        localStorage.setItem(TOKEN_KEYS.ADMIN_TOKEN, adminToken);
      }

      setUser(user);

      // Redirect based on role
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }

      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message || "Registration failed";
      return { success: false, error: message };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      const { user, accessToken, refreshToken, adminToken } =
        response.data.data!;

      // Save tokens and user to localStorage
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));

      if (adminToken) {
        localStorage.setItem(TOKEN_KEYS.ADMIN_TOKEN, adminToken);
      }

      setUser(user);

      // Handle redirect parameter from URL
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get("redirect");

      if (redirect) {
        router.push(redirect);
      } else if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }

      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data?.message || "Login failed";
      return { success: false, error: message };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear auth state regardless of API response
      clearAuth();
      router.push("/login");
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
