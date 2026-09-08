import { Bugfender } from "@bugfender/sdk";
import { DEFAULT_NOISE_PATTERNS, DEFAULT_PII_PATTERNS } from "./patterns";
import { containsPII } from "./pii";
import { setInitialized, setPiiPatterns, state } from "./state";

export interface InitOptions {
  /** Bugfender app key from the dashboard. Required. */
  appKey: string;
  /** App version label attached to every log. */
  version?: string;
  /**
   * Extra noise patterns appended to the defaults — matches drop the
   * exception entirely instead of being logged.
   */
  extraNoisePatterns?: RegExp[];
  /**
   * Extra PII patterns appended to the defaults — matches cause the
   * report to be silently dropped (so secrets never reach the SDK).
   */
  extraPiiPatterns?: RegExp[];
  /** Mirror logs to the browser console. Useful in dev. */
  printToConsole?: boolean;
  /**
   * Toggle Bugfender's automatic UI event capture. Off by default —
   * UI events tend to leak PII via input values / button labels.
   */
  logUIEvents?: boolean;
  /**
   * Toggle Bugfender's automatic navigation / fetch event capture. Off
   * by default for the same reason.
   */
  logBrowserEvents?: boolean;
}

/**
 * Initialize the Bugfender SDK. Safe to call multiple times — only the
 * first call wins. Returns `true` if init succeeded, `false` if `appKey`
 * was missing (lets the rest of the app boot without Bugfender).
 */
export function initBugfender(opts: InitOptions): boolean {
  if (state.initialized) return true;
  if (!opts.appKey) return false;

  const piiPatterns = [
    ...DEFAULT_PII_PATTERNS,
    ...(opts.extraPiiPatterns ?? []),
  ];
  const noisePatterns = [
    ...DEFAULT_NOISE_PATTERNS,
    ...(opts.extraNoisePatterns ?? []),
  ];
  setPiiPatterns(piiPatterns);

  Bugfender.init({
    appKey: opts.appKey,
    version: opts.version,
    overrideConsoleMethods: false,
    registerErrorHandler: true,
    printToConsole: opts.printToConsole ?? false,
    logUIEvents: opts.logUIEvents ?? false,
    logBrowserEvents: opts.logBrowserEvents ?? false,
    ignoreException: {
      patterns: noisePatterns,
      filter: (info) => containsPII(info.message) || containsPII(info.stack),
    },
  });

  setInitialized(true);
  return true;
}
