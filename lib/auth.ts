import { cookies } from "next/headers";

export const SESSION_COOKIE = "mh_admin";

async function tokenFor(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getExpectedToken(): Promise<string> {
  return tokenFor(process.env.ADMIN_PASSWORD ?? "");
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
  return { valid: true, token: await tokenFor(password) };
}
