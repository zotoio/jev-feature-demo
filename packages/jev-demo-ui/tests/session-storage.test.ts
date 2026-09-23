import { describe, expect, it } from "vitest";
import { hasNonEmptyKey, maskApiKey } from "../src/session/session-storage.js";

describe("session key helpers", () => {
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
