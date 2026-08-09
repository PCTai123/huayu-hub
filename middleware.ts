import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Paths that don't require authentication (public to everyone)
const PUBLIC_PATHS = ["/login", "/register", "/reset-password", "/forgot-password", "/partner"];

// Auth-only pages: redirect authenticated users to dashboard (they don't need login page)
const AUTH_ONLY_PATHS = ["/login", "/register", "/reset-password", "/forgot-password"];

function stripLocale(pathname: string): string {
  // Strip locale prefix (e.g. /vi/login -> /login)
  return pathname.replace(/^\/(vi|en|zh)/, "");
}

function isPublicPath(pathname: string): boolean {
  const strippedPath = stripLocale(pathname);
  return PUBLIC_PATHS.some(
    (p) => strippedPath === p || strippedPath.startsWith(p + "/")
  );
}

function isAuthOnlyPath(pathname: string): boolean {
  const strippedPath = stripLocale(pathname);
  return AUTH_ONLY_PATHS.some(
    (p) => strippedPath === p || strippedPath.startsWith(p + "/")
  );
}

export default function middleware(request: NextRequest) {
  // First, run next-intl middleware for locale handling
  const response = intlMiddleware(request);

  // If next-intl already issued a redirect (e.g. /partner -> /vi/partner), return it immediately
  // to avoid auth checks interfering with locale redirects
  if (response.status === 307 || response.status === 308) {
    return response;
  }

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

  // If authenticated and trying to access auth-only page (login/register), redirect to dashboard
  if (isAuthenticated && isAuthOnlyPath(pathname)) {
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
