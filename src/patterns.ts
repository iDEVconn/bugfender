/**
 * Default noise patterns — matched against captured exception messages /
 * stacks to drop browser cruft that adds no signal.
 */
export const DEFAULT_NOISE_PATTERNS: readonly RegExp[] = [
  /^ResizeObserver loop/i,
  /^Script error\.?$/,
  /^Non-Error promise rejection captured/i,
];

/**
 * Default PII patterns — anything that matches is treated as personally
 * identifiable and stripped from log payloads before they ever leave the
 * SDK. UUIDs (8-4-4-4-12 hyphen form) are intentionally NOT matched so
 * `user.id` remains loggable as a non-secret identifier.
 */
export const DEFAULT_PII_PATTERNS: readonly RegExp[] = [
  // Email addresses
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  // JWT (header.payload.signature in base64url)
  /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  // Bearer / Authorization header values
  /Bearer\s+[A-Za-z0-9_\-.+/=]{8,}/i,
  // Long hex blobs (32+ chars) — service-role keys, encryption keys,
  // BYOK API keys after hex-encoding, etc.
  /\b[a-f0-9]{32,}\b/i,
  // E.164-ish phone numbers: explicit `+` prefix OR a pure 10+ digit run
  // with no adjacent word / hyphen char. Lookarounds prevent matching the
  // 12-digit segment inside a hyphen-separated UUID.
  /\+\d{10,}|(?<![\w-])\d{10,}(?![\w-])/,
];
