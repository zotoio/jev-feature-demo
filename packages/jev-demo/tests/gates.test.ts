import { describe, expect, it } from "vitest";
import {
  decideFromChoice,
  decideFromNoul,
  decideFromScore,
  noulConfidence,
  routeByConfidence,
} from "../lib/confidence-gates.js";

describe("Confidence gates (application code)", () => {
  it("derives noul confidence as max(p, 1-p)", () => {
    expect(noulConfidence(0.99)).toBeCloseTo(0.99);
    expect(noulConfidence(0.15)).toBeCloseTo(0.85);
  });

  it("routes act | ask_human | deny | abstain from thresholds", () => {
    expect(routeByConfidence(0.9)).toBe("act");
    expect(routeByConfidence(0.7)).toBe("ask_human");
    expect(routeByConfidence(0.5)).toBe("deny");
    expect(routeByConfidence(0.2)).toBe("abstain");
  });

  it("wraps noul, choice, and score into Decision objects", () => {
    expect(decideFromNoul(0.99).outcome).toBe("act");
    expect(decideFromChoice("billing", 0.81).outcome).toBe("ask_human");
    expect(decideFromScore(1.05, 0.92).outcome).toBe("act");
  });
});
