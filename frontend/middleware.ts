// [Task]: T-008
// [From]: speckit.plan §6, speckit.specify §2.1

import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED = ["/tasks"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = getSessionCookie(request);

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/tasks", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/tasks/:path*", "/login", "/signup"],
};
