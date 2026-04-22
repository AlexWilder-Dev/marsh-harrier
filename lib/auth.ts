import { cookies } from "next/headers";
import { sha256Hex } from "@/lib/hash";

export const SESSION_COOKIE = "mh_admin";

export async function getExpectedToken(): Promise<string> {
  return sha256Hex(process.env.ADMIN_PASSWORD ?? "");
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return token === (await getExpectedToken());
}

export async function createSession(
  password: string
): Promise<{ valid: boolean; token: string }> {
  if (password !== (process.env.ADMIN_PASSWORD ?? "")) {
    return { valid: false, token: "" };
  }
  return { valid: true, token: await sha256Hex(password) };
}
