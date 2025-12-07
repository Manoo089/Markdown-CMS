import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth Proxy
 *
 * Handles authentication redirects for protected routes.
 *
 * Route Structure:
 * - /login → Public (auth group)
 * - /admin/* → Protected + Admin required (handled by layout)
 * - /* → Protected (dashboard group, handled by layout)
 *
 * The actual auth/admin checks are done in the layouts,
 * this proxy just handles the login redirect flow.
 */
export function proxy(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token"); // Production cookie name
  const isLoggedIn = !!sessionCookie;

  const pathname = request.nextUrl.pathname;

  // Public routes that don't require auth
  const publicRoutes = ["/login"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // API routes are handled separately
  const isApiRoute = pathname.startsWith("/api");

  // Skip proxy for public routes and API
  if (isPublicRoute || isApiRoute) {
    // If logged in and trying to access login → redirect to dashboard
    if (pathname === "/login" && isLoggedIn) {
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }
    return NextResponse.next();
  }

  // Protected routes: redirect to login if not authenticated
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
