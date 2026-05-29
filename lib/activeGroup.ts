import { cookies } from "next/headers";

const ACTIVE_GROUP_KEY = "foodmates_active_group";

/**
 * Read the active group ID from the cookie (server-side).
 * Returns null if not set.
 */
export function getActiveGroupId(): string | null {
  const cookieStore = cookies();
  return cookieStore.get(ACTIVE_GROUP_KEY)?.value ?? null;
}
