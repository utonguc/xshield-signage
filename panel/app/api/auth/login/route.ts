import { NextRequest, NextResponse } from "next/server";
import { loginApi } from "@/lib/api";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  try {
    const data = await loginApi(email, password);
    const res = NextResponse.json({ ok: true });
    res.cookies.set("token", data.token, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24, path: "/" });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
