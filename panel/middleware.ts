import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PREFIXES = ["/login", "/api/auth", "/_next", "/favicon.ico", "/sitemap.xml", "/robots.txt"];
const PUBLIC_EXACT = ["/"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_EXACT.includes(pathname)) return NextResponse.next();
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return NextResponse.next();
  if (!req.cookies.get("token")?.value)
    return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}
