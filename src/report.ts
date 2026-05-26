import { Bugfender } from "@bugfender/sdk";
import { containsPII } from "./pii";
import { state } from "./state";

/**
 * Send an error log. `tag` is a free-form string that becomes the
 * Bugfender tag — pkg consumers commonly narrow it via a union, e.g.
 * `type AppTag = "auth" | "payment"` then call `reportError<AppTag>(...)`.
 *
 * Drops the report silently when the SDK isn't initialized OR when the
 * combined text contains PII — the second guard ensures the SDK never
 * sees secrets even if a careless caller interpolates a JWT into the
 * message.
 */
export function reportError<T extends string = string>(
  tag: T,
  text: string,
  error?: unknown,
): void {
  if (!state.initialized) return;
  const detail = error instanceof Error ? `${text}: ${error.message}` : text;
  if (containsPII(detail)) return;
  Bugfender.error({ tag, text: detail });
}

/** Send a warning log. Same PII guard semantics as `reportError`. */
export function reportWarning<T extends string = string>(tag: T, text: string): void {
  if (!state.initialized) return;
  if (containsPII(text)) return;
  Bugfender.warn({ tag, text });
}

/**
 * Send a high-visibility issue (Bugfender's `sendIssue`). Drops the
 * call when either field contains PII.
 */
export function reportIssue(title: string, body: string): void {
  if (!state.initialized) return;
  if (containsPII(title) || containsPII(body)) return;
  Bugfender.sendIssue(title, body);
}
