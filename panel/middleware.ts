import { NextRequest, NextResponse } from "next/server";

const PUBLIC = ["/login", "/api/auth", "/_next", "/favicon.ico"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next();
  if (!req.cookies.get("token")?.value)
    return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}
