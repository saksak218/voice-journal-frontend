// context/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User, AuthContextType, AuthResult, AuthResponse } from "@/types/auth";
import { AxiosError } from "axios";
import api from "@/lib/api";

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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (accessToken && storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);

        // Optionally verify token by fetching user data
        // try {
        //   const response = await api.get<AuthResponse>(
        //     `/auth/currentUser/${user?.id}`
        //   );
        //   if (response.data.data?.user) {
        //     setUser(response.data.data.user);
        //     console.log(user);
        //   }
        // } catch (error) {
        //   console.error("Token verification failed:", error);
        //   logout();
        // }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      const { user, accessToken } = response.data.data!;

      // Save access token and user to localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      router.push("/dashboard");

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

      const { user, accessToken } = response.data.data!;

      localStorage.setItem("accessToken", accessToken);

      // Save access token and user to localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

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
      const message = axiosError.response?.data?.message || "Login failed";
      return { success: false, error: message };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
