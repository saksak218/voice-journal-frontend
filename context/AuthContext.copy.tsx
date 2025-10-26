// context/AuthContext.ts
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";
import { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  const checkAuth = useCallback(async () => {
    try {
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const accessToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (accessToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);

          const response = await api.get<{ data: { user: User } }>(
            "/auth/currentUser"
          );
          setUser(response.data.data.user);
        } catch (error) {
          console.error("Token verification failed:", error);
          await logout();
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      await logout();
    }
  }, [logout]);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const response = await api.post<{
          data: { user: User; accessToken: string };
        }>("/auth/register", {
          name,
          email,
          password,
        });

        const { user, accessToken } = response.data.data;

        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("user", JSON.stringify(user));
        }

        setUser(user);
        if (user.role === "admin") {
          router.push("/admin/dashboard");
        }
        router.push("/dashboard");

        return { success: true };
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || "Registration failed";
        return { success: false, error: message };
      }
    },
    [router]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await api.post<{
          data: { user: User; accessToken: string };
        }>("/auth/login", {
          email,
          password,
        });

        const { user, accessToken } = response.data.data;
        console.log(user, accessToken);

        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("user", JSON.stringify(user));
        }

        setUser(user);

        if (user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }

        return { success: true };
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || "Login failed";
        return { success: false, error: message };
      }
    },
    [router]
  );

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
