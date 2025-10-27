// components/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { tokenManager } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({
  children,
  requireAdmin = false,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const hasTokens = tokenManager.hasTokens();
      const isAdmin = tokenManager.isAdmin();

      // Public routes - redirect if logged in
      if (pathname === "/login" || pathname === "/register") {
        if (hasTokens) {
          router.push(isAdmin ? "/admin/dashboard" : "/dashboard");
          return;
        }
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Protected routes - require authentication
      if (!hasTokens) {
        router.push(`/register?redirect=${pathname}`);
        return;
      }

      // Admin routes - require admin token
      if (requireAdmin && !isAdmin) {
        router.push("/dashboard");
        return;
      }

      // Verify admin token if present
      if (requireAdmin && isAdmin) {
        try {
          const adminToken = tokenManager.getAdminToken();
          if (adminToken) {
            const decoded = jwtDecode<{ role?: string }>(adminToken);
            if (decoded?.role !== "admin") {
              router.push("/dashboard");
              return;
            }
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          tokenManager.clearTokens();
          router.push("/login");
          return;
        }
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router, requireAdmin]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
