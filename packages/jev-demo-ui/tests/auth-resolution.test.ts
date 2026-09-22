import { describe, expect, it } from "vitest";
import { resolveAuth } from "../src/lib/auth-resolution.js";

describe("auth resolution order", () => {
  it("uses session override before server env", () => {
    expect(
      resolveAuth({
        sessionKey: "sk-session",
        fixtureModeForced: false,
        serverKeyConfigured: true,
      }),
    ).toEqual({
      mode: "live",
      source: "session",
      sessionKey: "sk-session",
    });
  });

  it("uses server env when no session override", () => {
    expect(
      resolveAuth({
        sessionKey: null,
        fixtureModeForced: false,
        serverKeyConfigured: true,
      }),
    ).toEqual({
      mode: "live",
      source: "server-env",
    });
  });

  it("falls back to fixture mode when no keys are available", () => {
    expect(
      resolveAuth({
        sessionKey: null,
        fixtureModeForced: false,
        serverKeyConfigured: false,
      }),
    ).toEqual({
      mode: "fixture",
      reason: "no-key",
    });
  });

  it("forces fixture mode even when keys exist", () => {
    expect(
      resolveAuth({
        sessionKey: "sk-session",
        fixtureModeForced: true,
        serverKeyConfigured: true,
      }),
    ).toEqual({
      mode: "fixture",
      reason: "forced",
    });
  });
});
