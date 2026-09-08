import { describe, expect, it } from "vitest";
import { containsPII } from "../pii";

describe("containsPII (default patterns)", () => {
  it("returns false for nullish / empty input", () => {
    expect(containsPII(undefined)).toBe(false);
    expect(containsPII(null)).toBe(false);
    expect(containsPII("")).toBe(false);
  });

  it("flags email addresses", () => {
    expect(containsPII("contact alice@example.com for help")).toBe(true);
    expect(containsPII("bob+filter@sub.example.co.uk")).toBe(true);
  });

  it("flags JWT-shaped tokens", () => {
    const jwt = "eyJabc.eyJpYXQ.signaturepart";
    expect(containsPII(`token=${jwt}`)).toBe(true);
  });

  it("flags Bearer headers", () => {
    expect(containsPII("Authorization: Bearer abcdef12345==")).toBe(true);
  });

  it("flags long hex blobs (API keys / encryption keys)", () => {
    expect(containsPII("key=" + "a".repeat(40))).toBe(true);
  });

  it("flags phone numbers (10+ digits)", () => {
    expect(containsPII("call +15555550100")).toBe(true);
    expect(containsPII("phone 4155550100")).toBe(true);
  });

  it("does NOT flag UUIDs (intentional — user.id stays loggable)", () => {
    expect(containsPII("user.id=550e8400-e29b-41d4-a716-446655440000")).toBe(
      false,
    );
  });

  it("does NOT flag short hex strings", () => {
    expect(containsPII("commit deadbeef")).toBe(false);
  });
});
