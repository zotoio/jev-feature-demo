import type { Usage } from "@typesafe-ai/sdk";

/** Application-owned routing outcome — Jev never executes side effects. */
export type GateOutcome = "act" | "ask_human" | "deny" | "abstain";

export interface GateThresholds {
  /** Minimum confidence to act automatically. */
  act: number;
  /** Minimum confidence to escalate to a human (below act). */
  askHuman: number;
  /** Minimum confidence before hard deny (below askHuman). */
  deny: number;
}

export const DEFAULT_THRESHOLDS: GateThresholds = {
  act: 0.85,
  askHuman: 0.6,
  deny: 0.4,
};

/**
 * Derive noul confidence from probability: max(p, 1-p).
 * See BRIEF / TypeSafe confidence docs for gating on yes/no questions.
 */
export function noulConfidence(noul: number): number {
  return Math.max(noul, 1 - noul);
}

/** Route on a scalar confidence (Choice/Score confidence or derived noul confidence). */
export function routeByConfidence(
  confidence: number,
  thresholds: GateThresholds = DEFAULT_THRESHOLDS,
): GateOutcome {
  if (confidence >= thresholds.act) return "act";
  if (confidence >= thresholds.askHuman) return "ask_human";
  if (confidence >= thresholds.deny) return "deny";
  return "abstain";
}

export interface Decision<TProposal = unknown> {
  proposal: TProposal;
  confidence: number;
  outcome: GateOutcome;
}

export function decideFromNoul(
  noul: number,
  thresholds?: GateThresholds,
): Decision<{ noul: number; yes: boolean }> {
  const confidence = noulConfidence(noul);
  return {
    proposal: { noul, yes: noul >= 0.5 },
    confidence,
    outcome: routeByConfidence(confidence, thresholds),
  };
}

export function decideFromChoice<T extends string>(
  choice: T,
  confidence: number,
  thresholds?: GateThresholds,
): Decision<{ choice: T }> {
  return {
    proposal: { choice },
    confidence,
    outcome: routeByConfidence(confidence, thresholds),
  };
}

export function decideFromScore(
  score: number,
  confidence: number,
  thresholds?: GateThresholds,
): Decision<{ score: number }> {
  return {
    proposal: { score },
    confidence,
    outcome: routeByConfidence(confidence, thresholds),
  };
}

export interface ChoicePromotion<T extends string> {
  choice: T;
  decision: Decision<{ choice: T }>;
  /** True when code promoted the proposed choice (gate=act and smoke passed). */
  promoted: boolean;
  /** True when smoke failed and the proposed act-level choice was rolled back. */
  rolledBack: boolean;
}

/**
 * CLI-owned promote: commit a Choice only when gate=act and smoke passes.
 * On smoke failure, roll back to fallback and force ask_human (never act above gate).
 */
export function promoteChoiceWithSmoke<T extends string>(
  proposed: T,
  confidence: number,
  smokePass: boolean,
  fallback: T,
  thresholds?: GateThresholds,
): ChoicePromotion<T> {
  const decision = decideFromChoice(proposed, confidence, thresholds);
  if (decision.outcome === "act" && !smokePass) {
    return {
      choice: fallback,
      decision: {
        proposal: { choice: fallback },
        confidence,
        outcome: "ask_human",
      },
      promoted: false,
      rolledBack: true,
    };
  }
  return {
    choice: proposed,
    decision,
    promoted: decision.outcome === "act",
    rolledBack: false,
  };
}

/** Side-effect router guard — only execute automated actions when gate=act. */
export function mayAct(outcome: GateOutcome): boolean {
  return outcome === "act";
}

/** Summarize token usage for logging / billing dashboards. */
export function formatUsage(usage: Usage): string {
  return `input=${usage.input_tokens} output=${usage.output_tokens}`;
}

/** Log resolved model from response (alias → versioned ID). */
export function logResolvedModel(result: { model: string }): string {
  return result.model;
}
