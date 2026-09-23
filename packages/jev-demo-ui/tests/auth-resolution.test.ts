import { describe, expect, it } from "vitest";
import { resolveAuth } from "../src/lib/auth-resolution.js";

describe("auth resolution order", () => {
  it("defaults to fixture mode even when server env is configured", () => {
    expect(
      resolveAuth({
        sessionKey: null,
        fixtureModeForced: false,
        useServerEnv: false,
        serverKeyConfigured: true,
      }),
    ).toEqual({
      mode: "fixture",
      reason: "no-key",
    });
  });

  it("uses session override before server env opt-in", () => {
    expect(
      resolveAuth({
        sessionKey: "sk-session",
        fixtureModeForced: false,
        useServerEnv: true,
        serverKeyConfigured: true,
      }),
    ).toEqual({
      mode: "live",
      source: "session",
      sessionKey: "sk-session",
    });
  });

  it("uses server env only when explicitly opted in", () => {
    expect(
      resolveAuth({
        sessionKey: null,
        fixtureModeForced: false,
        useServerEnv: true,
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
        useServerEnv: false,
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
        useServerEnv: true,
        serverKeyConfigured: true,
      }),
    ).toEqual({
      mode: "fixture",
      reason: "forced",
    });
  });
});
