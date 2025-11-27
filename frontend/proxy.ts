import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Named export "proxy" (Next docs hỗ trợ named hoặc default)
export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = (req.cookies.get("role")?.value || "").toLowerCase();
  const { pathname } = req.nextUrl;

  // Chưa login mà vào khu vực protected
  if (
    (pathname.startsWith("/candidate") ||
      pathname.startsWith("/employer") ||
      pathname.startsWith("/admin")) &&
    !token
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Candidate: chỉ candidate
  if (pathname.startsWith("/candidate") && role !== "candidate") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Employer: employer + admin
  if (pathname.startsWith("/employer") && role !== "employer" && role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Admin: chỉ admin
  if (pathname.startsWith("/admin") && role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// matcher vẫn dùng như cũ
export const config = {
  matcher: ["/candidate/:path*", "/employer/:path*", "/admin/:path*"],
};