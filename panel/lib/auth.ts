import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getToken(): Promise<string> {
  const token = (await cookies()).get("token")?.value;
  if (!token) redirect("/login");
  return token;
}
