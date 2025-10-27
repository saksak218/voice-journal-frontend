import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Admin routes
  const isAdminRoute = pathname.startsWith("/admin");

  // Dashboard routes (non-admin protected)
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // For server-side rendering, we can't access localStorage
  // So middleware will just pass through, and we'll handle auth on client
  // Or use a different approach with server components

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
