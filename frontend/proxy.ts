import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "./app/utils/utils";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // kt token khi ở login và register
  if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
    if (token) {
      const response = await getProfile(token);
      if (response?.role === "CANDIDATE") {
        return NextResponse.redirect(new URL("/candidate/dashboard", request.url));
      }
      if (response?.role === "EMPLOYER") {
        return NextResponse.redirect(new URL("/employer/dashboard", request.url));
      }
      if (response?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  // kt token khi ở admin, candidate, employer
  if (pathname.startsWith("/admin") || pathname.startsWith("/candidate") || pathname.startsWith("/employer")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    const response = await getProfile(token);
    if (!response || !response.role) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (pathname.startsWith("/candidate") && response.role !== "CANDIDATE") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname.startsWith("/employer") && response.role !== "EMPLOYER") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname.startsWith("/admin") && response.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// match
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};