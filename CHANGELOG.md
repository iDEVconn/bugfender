# @idevconn/bugfender

## 0.2.0

### Minor Changes

- 4d1af95: Initial release.

  Framework-agnostic Bugfender SDK helpers with built-in PII / noise
  filtering, typed tag narrowing, and no-op safety when the SDK isn't
  initialized. Exports `initBugfender(opts)`, `isBugfenderEnabled`,
  `setBugfenderDeviceKey`, `containsPII`, `reportError<Tag>`,
  `reportWarning<Tag>`, `reportIssue`, plus `DEFAULT_PII_PATTERNS` /
  `DEFAULT_NOISE_PATTERNS` constants for downstream extension. Tightened
  phone-number regex so 12-digit UUID chunks no longer trigger false
  positives — `user.id` stays loggable.
