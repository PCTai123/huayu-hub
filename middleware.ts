import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Paths that don't require authentication
const PUBLIC_PATHS = ["/login", "/register", "/reset-password", "/forgot-password", "/partner"];

function isPublicPath(pathname: string): boolean {
  // Strip locale prefix (e.g. /vi/login -> /login)
  const strippedPath = pathname.replace(/^\/(vi|en|zh)/, "");
  return PUBLIC_PATHS.some(
    (p) => strippedPath === p || strippedPath.startsWith(p + "/")
  );
}

export default function middleware(request: NextRequest) {
  // First, run next-intl middleware for locale handling
  const response = intlMiddleware(request);

  // Check auth: look for Supabase auth session cookie
  // Supabase stores session in cookies named sb-<project-ref>-auth-token
  const authCookie = request.cookies.getAll().find((c) =>
    c.name.startsWith("sb-") && c.name.includes("auth-token")
  );

  const isAuthenticated = Boolean(authCookie);
  const pathname = request.nextUrl.pathname;

  // If not authenticated and trying to access a protected page
  if (!isAuthenticated && !isPublicPath(pathname)) {
    const locale = pathname.split("/")[1] || "vi";
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access login/register page, redirect to dashboard (locale root)
  if (isAuthenticated && isPublicPath(pathname)) {
    const locale = pathname.split("/")[1] || "vi";
    const dashboardUrl = new URL(`/${locale}/`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - api, trpc, _next, _vercel routes
  // - files with extensions (e.g. favicon.ico)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
