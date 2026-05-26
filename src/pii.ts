import { state } from "./state";

/**
 * True when `text` matches any active PII pattern. Use to gate user-facing
 * strings before logging them. Returns false for `null` / `undefined` /
 * empty so callers can pass optional fields without nullish-coalescing.
 */
export function containsPII(text: string | null | undefined): boolean {
  if (!text) return false;
  return state.piiPatterns.some((re) => re.test(text));
}
