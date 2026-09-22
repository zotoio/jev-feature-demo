import { describe, expect, it } from "vitest";
import { decideFromChoice, decideFromNoul } from "@zotoio/jev-demo";
import { evaluateAnswerGates, gateOutcomeLabel } from "../src/lib/gate-display.js";

describe("gate wiring", () => {
  it("uses shared confidence-gates package logic for noul answers", () => {
    const results = evaluateAnswerGates({
      wantsRefund: { type: "noul", noul: 0.99 },
    });

    expect(results[0].decision.outcome).toBe(decideFromNoul(0.99).outcome);
    expect(results[0].decision.outcome).toBe("act");
  });

  it("uses shared confidence-gates package logic for choice answers", () => {
    const results = evaluateAnswerGates({
      department: {
        type: "choice",
        choice: "billing",
        confidence: 0.81,
        probabilities: { billing: 0.81 },
      },
    });

    expect(results[0].decision.outcome).toBe(decideFromChoice("billing", 0.81).outcome);
    expect(results[0].decision.outcome).toBe("ask_human");
  });

  it("formats gate outcomes via shared helper", () => {
    expect(gateOutcomeLabel("ask_human")).toContain("ASK_HUMAN");
  });
});
