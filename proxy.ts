import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get tokens from cookies
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const adminToken = request.cookies.get("adminToken")?.value;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Protected routes
  const protectedRoutes = ["/dashboard", "/admin"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAdminRoute = pathname.startsWith("/admin");

  // If trying to access protected route without refresh token
  if (isProtectedRoute && !refreshToken) {
    const loginUrl = new URL("/register", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedRoute && !isAdminRoute) {
    if (adminToken) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // Additional check for admin routes: verify role from access token
  if (isAdminRoute && refreshToken) {
    if (!adminToken) {
      // No access token, redirect to login
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    try {
      const decodedToken = jwtDecode<{ role?: string }>(adminToken);
      if (decodedToken?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If logged in and trying to access login/register, redirect to dashboard
  if ((pathname === "/login" || pathname === "/register") && refreshToken) {
    if (adminToken) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
