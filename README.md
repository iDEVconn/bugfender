# @idevconn/bugfender

Bugfender SDK helpers with built-in PII / noise filtering and typed tags. Framework-agnostic. The Bugfender SDK is a peer dependency.

## Features

- `initBugfender()` accepts a config object — no implicit env reads, so the pkg works in browser apps, server bundles, or tests.
- PII-aware: every report runs the message + (optional) stack through a regex set covering emails, JWTs, Bearer tokens, long hex blobs, and phone numbers. Matches are silently dropped before they reach the SDK.
- Built-in noise filter for `ResizeObserver loop` / `Script error` / `Non-Error promise rejection`.
- Typed tags via `reportError<MyTag>("…")` — narrow with a union type per app.
- Safe to call any helper before `initBugfender()` — they no-op so callers don't need to guard.
- The pkg's `containsPII()` is exported as a standalone utility too, useful for last-line-of-defense checks at logging boundaries.

## Install

```bash
npm install @idevconn/bugfender @bugfender/sdk
```

## Quick start

```ts
import {
  initBugfender,
  reportError,
  setBugfenderDeviceKey,
} from "@idevconn/bugfender";

// Once at app start
initBugfender({
  appKey: import.meta.env.VITE_BUGFENDER_APP_KEY,
  version: import.meta.env.VITE_APP_VERSION,
  printToConsole: import.meta.env.DEV,
});

// On auth state change
setBugfenderDeviceKey(user?.id ?? null);

// Anywhere you'd otherwise log a swallowed error
reportError("api", `HTTP ${err.status}`, err);
```

## Tag narrowing

```ts
import { reportError } from "@idevconn/bugfender";

type AppTag =
  "auth" | "payment" | "invoices" | "subscriptions" | "ml" | "ui" | "api";

reportError<AppTag>("payment", "PayPal capture failed", err);
// reportError<AppTag>("typo", "..."); // ← type error
```

## API

| Export                       | Purpose                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| `initBugfender(opts)`        | Initialize the SDK. Returns `false` if `appKey` is empty. Idempotent.                    |
| `isBugfenderEnabled()`       | True after a successful init.                                                            |
| `setBugfenderDeviceKey(id)`  | Attach / clear the current user's `user.id` device key.                                  |
| `containsPII(text)`          | True when `text` matches any active PII pattern.                                         |
| `reportError(tag, text, e?)` | Send an `error` log. Drops the call when uninitialized OR when text contains PII.        |
| `reportWarning(tag, text)`   | Send a `warn` log. Same drop semantics.                                                  |
| `reportIssue(title, body)`   | Send a high-visibility issue. Dropped if either field contains PII.                      |
| `DEFAULT_PII_PATTERNS`       | Read-only — the default regex set. Use to build your own variant of `containsPII`.       |
| `DEFAULT_NOISE_PATTERNS`     | Read-only — browser-cruft patterns folded into `Bugfender.init({ ignoreException })`.    |
| `Bugfender`                  | Re-exported from `@bugfender/sdk` for escape-hatch use cases that bypass the PII filter. |

## License

Apache-2.0
