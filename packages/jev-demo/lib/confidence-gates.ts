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

/** Ordered from lowest to highest privilege — used to cap gate outcomes. */
const GATE_OUTCOME_ORDER: GateOutcome[] = ["abstain", "deny", "ask_human", "act"];

/** Cap a gate outcome so it does not exceed `maxAllowed` (e.g. mid-score bands). */
export function capGateOutcome(current: GateOutcome, maxAllowed: GateOutcome): GateOutcome {
  const currentIdx = GATE_OUTCOME_ORDER.indexOf(current);
  const maxIdx = GATE_OUTCOME_ORDER.indexOf(maxAllowed);
  return GATE_OUTCOME_ORDER[Math.min(currentIdx, maxIdx)];
}

/** Score band policy — score value can cap the routed outcome independently of confidence. */
export interface ScoreBandPolicy {
  band: { min: number; max: number };
  maxOutcome: GateOutcome;
}

export interface DecideFromScoreOptions {
  thresholds?: GateThresholds;
  scoreBands?: ScoreBandPolicy[];
}

function resolveScoreOptions(
  thresholdsOrOptions?: GateThresholds | DecideFromScoreOptions,
): DecideFromScoreOptions {
  if (!thresholdsOrOptions) return {};
  if ("scoreBands" in thresholdsOrOptions || !("act" in thresholdsOrOptions)) {
    return thresholdsOrOptions as DecideFromScoreOptions;
  }
  return { thresholds: thresholdsOrOptions };
}

export function decideFromScore(
  score: number,
  confidence: number,
  thresholdsOrOptions?: GateThresholds | DecideFromScoreOptions,
): Decision<{ score: number }> {
  const { thresholds, scoreBands } = resolveScoreOptions(thresholdsOrOptions);
  let outcome = routeByConfidence(confidence, thresholds);
  for (const policy of scoreBands ?? []) {
    if (score >= policy.band.min && score <= policy.band.max) {
      outcome = capGateOutcome(outcome, policy.maxOutcome);
    }
  }
  return {
    proposal: { score },
    confidence,
    outcome,
  };
}

/** Pinned blast-radius band: 0.7–0.9 = touches auth. */
export const BLAST_RADIUS_TOUCHES_AUTH_BAND = { min: 0.7, max: 0.9 };

export const DEFAULT_BLAST_RADIUS_SCORE_BANDS: ScoreBandPolicy[] = [
  {
    band: BLAST_RADIUS_TOUCHES_AUTH_BAND,
    maxOutcome: "ask_human",
  },
];

export interface NoulFactGateContext {
  requiredFacts: string[];
  state: Record<string, unknown>;
}

/**
 * Gate noul proposals when required facts are absent from state.
 * Missing facts never promote to act; abstain is upgraded to ask_human with stated gaps.
 */
export function decideFromNoulWithRequiredFacts(
  noul: number,
  context: NoulFactGateContext,
  thresholds?: GateThresholds,
): Decision<{ noul: number; yes: boolean; missingFacts: string[] }> {
  const base = decideFromNoul(noul, thresholds);
  const missingFacts = context.requiredFacts.filter((key) => {
    const value = context.state[key];
    return value === undefined || value === null || value === "";
  });

  if (missingFacts.length === 0) {
    return {
      ...base,
      proposal: { ...base.proposal, missingFacts: [] },
    };
  }

  let outcome: GateOutcome = base.outcome;
  if (outcome === "act") outcome = "ask_human";
  if (outcome === "abstain") outcome = "ask_human";

  return {
    proposal: { noul, yes: noul >= 0.5, missingFacts },
    confidence: base.confidence,
    outcome,
  };
}

/** Summarize token usage for logging / billing dashboards. */
export function formatUsage(usage: Usage): string {
  return `input=${usage.input_tokens} output=${usage.output_tokens}`;
}

/** Log resolved model from response (alias → versioned ID). */
export function logResolvedModel(result: { model: string }): string {
  return result.model;
}
