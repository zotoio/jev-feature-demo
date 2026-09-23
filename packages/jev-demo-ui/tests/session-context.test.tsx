import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, afterEach, vi } from "vitest";
import type { ReactNode } from "react";
import { SessionProvider, useSession } from "../src/session/SessionContext.js";

const SESSION_STORAGE_KEY = "jev-demo-api-key";

function wrapper({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

describe("SessionProvider", () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("starts in fixture mode with no session key", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no proxy"));

    const { result } = renderHook(() => useSession(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.serverConfigLoaded).toBe(true);
    });

    expect(result.current.sessionKey).toBeNull();
    expect(result.current.authMode).toBe("fixture");
    expect(result.current.devProxyAvailable).toBe(false);
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("does not restore keys from sessionStorage on mount", async () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, "sk-stale-from-storage");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no proxy"));

    const { result } = renderHook(() => useSession(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.serverConfigLoaded).toBe(true);
    });

    expect(result.current.sessionKey).toBeNull();
    expect(result.current.hasSessionOverride).toBe(false);
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBe("sk-stale-from-storage");
  });

  it("enters live mode with direct session key and clears on clearSession", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no proxy"));

    const { result } = renderHook(() => useSession(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.serverConfigLoaded).toBe(true);
    });

    act(() => {
      result.current.setSessionKey("sk-test-session-key");
    });

    expect(result.current.authMode).toBe("live");
    expect(result.current.liveSource).toBe("session");
    expect(result.current.sessionKey).toBe("sk-test-session-key");
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();

    act(() => {
      result.current.clearSession();
    });

    expect(result.current.sessionKey).toBeNull();
    expect(result.current.authMode).toBe("fixture");
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("does not write session keys to sessionStorage", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no proxy"));

    const { result } = renderHook(() => useSession(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.serverConfigLoaded).toBe(true);
    });

    act(() => {
      result.current.setSessionKey("sk-memory-only");
    });

    expect(result.current.sessionKey).toBe("sk-memory-only");
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });
});
