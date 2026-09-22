import { describe, expect, it } from "vitest";
import {
  decideFromScore,
  mayAct,
  promoteChoiceWithSmoke,
  routeByConfidence,
} from "../lib/confidence-gates.js";
import { formatGateSummary } from "../demos/speculative-fanout.js";

describe("Hard-fail regressions (must stay red if broken)", () => {
  it("never acts above gate threshold", () => {
    expect(routeByConfidence(0.84)).not.toBe("act");
    expect(routeByConfidence(0.84)).toBe("ask_human");
  });

  it("rolls back choice when smoke fails despite act-level confidence", () => {
    const result = promoteChoiceWithSmoke("billing", 0.9, false, "other");
    expect(result.rolledBack).toBe(true);
    expect(result.choice).toBe("other");
    expect(result.decision.outcome).not.toBe("act");
    expect(result.decision.outcome).toBe("ask_human");
  });

  it("routes mid-band score confidence to ask_human, not act", () => {
    const decision = decideFromScore(1.0, 0.72);
    expect(decision.outcome).toBe("ask_human");
    expect(decision.outcome).not.toBe("act");
  });

  it("never blackouts gate decision labels", () => {
    for (const outcome of ["act", "ask_human", "deny", "abstain"] as const) {
      const summary = formatGateSummary(outcome);
      expect(summary.length).toBeGreaterThan(0);
      expect(summary).toMatch(/ACT|ASK_HUMAN|DENY|ABSTAIN/);
    }
  });

  it("side-effect router only acts when gate=act", () => {
    expect(mayAct("act")).toBe(true);
    expect(mayAct("ask_human")).toBe(false);
    expect(mayAct("deny")).toBe(false);
    expect(mayAct("abstain")).toBe(false);
  });
});
