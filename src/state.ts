import { DEFAULT_PII_PATTERNS } from "./patterns";

/**
 * Module-level state. Kept private to the pkg; consumers read it via
 * `isBugfenderEnabled()` and write it via `initBugfender()`.
 */
export const state = {
  initialized: false,
  piiPatterns: [...DEFAULT_PII_PATTERNS] as RegExp[],
};

export function setInitialized(value: boolean): void {
  state.initialized = value;
}

export function setPiiPatterns(patterns: RegExp[]): void {
  state.piiPatterns = patterns;
}

/** True when `initBugfender` ran successfully. Reports become no-ops otherwise. */
export function isBugfenderEnabled(): boolean {
  return state.initialized;
}
