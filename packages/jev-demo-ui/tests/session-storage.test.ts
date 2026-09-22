import { afterEach, describe, expect, it } from "vitest";
import {
  clearPersistedApiKey,
  hasNonEmptyKey,
  maskApiKey,
  persistApiKey,
  readPersistedApiKey,
  SESSION_STORAGE_KEY,
} from "../src/session/session-storage.js";

describe("session storage helpers", () => {
  afterEach(() => {
    clearPersistedApiKey();
  });

  it("never uses localStorage for API keys", () => {
    persistApiKey("sk-test-key-12345678");
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBe("sk-test-key-12345678");
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("clears persisted key from sessionStorage", () => {
    persistApiKey("sk-test");
    clearPersistedApiKey();
    expect(readPersistedApiKey()).toBeNull();
  });

  it("masks API keys for display", () => {
    expect(maskApiKey("sk-abcdefghijklmnop")).toMatch(/^sk-a…/);
    expect(maskApiKey("short")).toBe("••••••••");
  });

  it("detects non-empty keys", () => {
    expect(hasNonEmptyKey("  sk-test  ")).toBe(true);
    expect(hasNonEmptyKey("")).toBe(false);
    expect(hasNonEmptyKey(null)).toBe(false);
  });
});
