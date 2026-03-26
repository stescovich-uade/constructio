import type { MockAuthContext } from "./auth.types.js";

export function getMockSession(auth: MockAuthContext | undefined): MockAuthContext | null {
  return auth ?? null;
}
