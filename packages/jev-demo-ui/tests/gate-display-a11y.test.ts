import { describe, expect, it } from "vitest";
import { gateOutcomeClass, gateOutcomeLabel } from "../src/lib/gate-display.js";

describe("gate outcome accessibility", () => {
  const outcomes = ["act", "ask_human", "deny", "abstain"] as const;

  it("provides text labels for every gate outcome (not color-only)", () => {
    for (const outcome of outcomes) {
      const label = gateOutcomeLabel(outcome);
      expect(label.length).toBeGreaterThan(3);
      expect(label).toMatch(/[A-Z]/);
      expect(gateOutcomeClass(outcome)).toBe(`gate-${outcome}`);
    }
  });
});
