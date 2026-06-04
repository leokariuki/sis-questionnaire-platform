import { cookies, headers } from "next/headers";

/**
 * Lightweight admin gate (spec §"Data privacy and access"). A shared token
 * guards /admin and admin APIs. For production behind WordPress, place the
 * app behind SSO or restrict by network as well.
 */
export const ADMIN_COOKIE = "sis_admin";

export function expectedToken(): string {
  return process.env.ADMIN_TOKEN || "change-me-in-production";
}

/** True if the request carries a valid admin token (cookie, header, or query). */
export function isAuthorized(queryKey?: string | null): boolean {
  const token = expectedToken();
  if (queryKey && queryKey === token) return true;
  const h = headers();
  const headerToken = h.get("x-admin-token");
  if (headerToken && headerToken === token) return true;
  const c = cookies().get(ADMIN_COOKIE)?.value;
  return Boolean(c && c === token);
}
