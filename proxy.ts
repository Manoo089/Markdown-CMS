import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("authjs.session-token"); // NextAuth Cookie-Name
  const isLoggedIn = !!sessionCookie;

  const isOnDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isOnLogin = request.nextUrl.pathname.startsWith("/login");

  // Nicht eingeloggt + versucht Dashboard → Redirect zu Login
  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Eingeloggt + auf Login-Seite → Redirect zu Dashboard
  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
