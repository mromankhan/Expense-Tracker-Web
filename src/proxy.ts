import { NextResponse } from "next/server";
import type { NextRequest, NextProxy } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/expenseTracker",
  "/addExpense",
  "/history",
  "/stats",
  "/setIncome",
  "/settings",
];

// Routes only for unauthenticated users
const AUTH_ROUTES = ["/login", "/signup", "/resetPassword"];

export const proxy: NextProxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has("spendwise-auth");

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/expenseTracker", request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/).*)",
  ],
};
