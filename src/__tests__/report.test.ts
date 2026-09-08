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

async function loadInitialized() {
  vi.resetModules();
  initMock.mockReset();
  errorMock.mockReset();
  warnMock.mockReset();
  sendIssueMock.mockReset();
  setDeviceKeyMock.mockReset();
  removeDeviceKeyMock.mockReset();
  const mod = await import("../index");
  mod.initBugfender({ appKey: "key-1" });
  return mod;
}

async function loadUninitialized() {
  vi.resetModules();
  initMock.mockReset();
  errorMock.mockReset();
  warnMock.mockReset();
  sendIssueMock.mockReset();
  setDeviceKeyMock.mockReset();
  removeDeviceKeyMock.mockReset();
  return await import("../index");
}

describe("reportError / reportWarning / reportIssue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no-ops when SDK isn't initialized", async () => {
    const mod = await loadUninitialized();
    mod.reportError("auth", "login failed");
    mod.reportWarning("api", "slow request");
    mod.reportIssue("title", "body");
    expect(errorMock).not.toHaveBeenCalled();
    expect(warnMock).not.toHaveBeenCalled();
    expect(sendIssueMock).not.toHaveBeenCalled();
  });

  it("sends tag + text when clean", async () => {
    const mod = await loadInitialized();
    mod.reportError("auth", "login failed");
    expect(errorMock).toHaveBeenCalledWith({
      tag: "auth",
      text: "login failed",
    });
  });

  it("appends Error.message to the text", async () => {
    const mod = await loadInitialized();
    mod.reportError("api", "HTTP 500", new Error("boom"));
    expect(errorMock).toHaveBeenCalledWith({
      tag: "api",
      text: "HTTP 500: boom",
    });
  });

  it("drops the report when the message contains PII (email)", async () => {
    const mod = await loadInitialized();
    mod.reportError("auth", "failed for alice@example.com");
    expect(errorMock).not.toHaveBeenCalled();
  });

  it("drops the warning when text contains a Bearer token", async () => {
    const mod = await loadInitialized();
    mod.reportWarning("api", "got Authorization: Bearer abcdef12345==");
    expect(warnMock).not.toHaveBeenCalled();
  });

  it("drops the issue when EITHER title or body contains PII", async () => {
    const mod = await loadInitialized();
    mod.reportIssue("ok title", "body has alice@example.com");
    expect(sendIssueMock).not.toHaveBeenCalled();
    mod.reportIssue("title +15555550100", "clean body");
    expect(sendIssueMock).not.toHaveBeenCalled();
  });
});

describe("setBugfenderDeviceKey", () => {
  beforeEach(() => vi.clearAllMocks());

  it("no-ops when uninitialized", async () => {
    const mod = await loadUninitialized();
    mod.setBugfenderDeviceKey("user-1");
    expect(setDeviceKeyMock).not.toHaveBeenCalled();
    expect(removeDeviceKeyMock).not.toHaveBeenCalled();
  });

  it("sets user.id when given a userId", async () => {
    const mod = await loadInitialized();
    mod.setBugfenderDeviceKey("user-1");
    expect(setDeviceKeyMock).toHaveBeenCalledWith("user.id", "user-1");
  });

  it("removes user.id when given null", async () => {
    const mod = await loadInitialized();
    mod.setBugfenderDeviceKey(null);
    expect(removeDeviceKeyMock).toHaveBeenCalledWith("user.id");
  });
});
