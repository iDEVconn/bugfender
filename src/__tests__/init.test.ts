import { beforeEach, describe, expect, it, vi } from "vitest";

const initMock = vi.fn();
const errorMock = vi.fn();
const warnMock = vi.fn();
const sendIssueMock = vi.fn();
const setDeviceKeyMock = vi.fn();
const removeDeviceKeyMock = vi.fn();

vi.mock("@bugfender/sdk", () => ({
  Bugfender: {
    init: initMock,
    error: errorMock,
    warn: warnMock,
    sendIssue: sendIssueMock,
    setDeviceKey: setDeviceKeyMock,
    removeDeviceKey: removeDeviceKeyMock,
  },
}));

async function loadFreshModule() {
  vi.resetModules();
  initMock.mockReset();
  errorMock.mockReset();
  warnMock.mockReset();
  sendIssueMock.mockReset();
  setDeviceKeyMock.mockReset();
  removeDeviceKeyMock.mockReset();
  return await import("../index");
}

describe("initBugfender", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false and skips SDK init when appKey is empty", async () => {
    const mod = await loadFreshModule();
    expect(mod.initBugfender({ appKey: "" })).toBe(false);
    expect(initMock).not.toHaveBeenCalled();
    expect(mod.isBugfenderEnabled()).toBe(false);
  });

  it("calls Bugfender.init with sensible PII-safe defaults", async () => {
    const mod = await loadFreshModule();
    expect(mod.initBugfender({ appKey: "key-1", version: "1.2.3" })).toBe(true);
    expect(initMock).toHaveBeenCalledOnce();
    const opts = initMock.mock.calls[0]![0];
    expect(opts.appKey).toBe("key-1");
    expect(opts.version).toBe("1.2.3");
    expect(opts.overrideConsoleMethods).toBe(false);
    expect(opts.registerErrorHandler).toBe(true);
    expect(opts.logUIEvents).toBe(false);
    expect(opts.logBrowserEvents).toBe(false);
    expect(typeof opts.ignoreException.filter).toBe("function");
    expect(mod.isBugfenderEnabled()).toBe(true);
  });

  it("is idempotent — second call is a no-op", async () => {
    const mod = await loadFreshModule();
    mod.initBugfender({ appKey: "key-1" });
    mod.initBugfender({ appKey: "key-2" });
    expect(initMock).toHaveBeenCalledOnce();
  });

  it("appends extraPiiPatterns so containsPII catches them after init", async () => {
    const mod = await loadFreshModule();
    expect(mod.containsPII("CUSTOM-SECRET")).toBe(false);
    mod.initBugfender({
      appKey: "key-1",
      extraPiiPatterns: [/CUSTOM-[A-Z]+/],
    });
    expect(mod.containsPII("token: CUSTOM-SECRET")).toBe(true);
  });
});
