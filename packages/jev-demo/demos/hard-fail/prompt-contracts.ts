import { choice, noul, score } from "@typesafe-ai/sdk";

/** System contract — Jev proposes; application code promotes. */
export const JEV_SYSTEM_CONTRACT =
  "Jev proposes only; code promotes — never self-promote.";

export const BLAST_RADIUS_FACT_KEY = "blastRadius";
export const MISSING_FACT_HOOK = "blast-radius";

export const DEPLOY_STRATEGY_OPTIONS = ["canary", "full", "rollback"] as const;
export type DeployStrategy = (typeof DEPLOY_STRATEGY_OPTIONS)[number];

/** Noul hard-fail: auto-merge PR without human review when blast-radius is unknown. */
export function buildAutoMergeQuestions() {
  return {
    safeToAutoMerge: noul(
      `Should this PR be auto-merged without human review? ` +
        `State must include ${MISSING_FACT_HOOK}; missing facts block promotion.`,
      {
        true: "All safety checks pass and blast-radius is documented in state",
        false: "Human review required or blast-radius is unknown",
      },
    ),
  };
}

/** Choice hard-fail: locked deploy strategy when smoke tests fail. */
export function buildDeployStrategyQuestions() {
  return {
    deployStrategy: choice("Which deployment strategy should run next?", {
      canary: "Roll out to a small canary slice",
      full: "Promote to full production traffic",
      rollback: "Revert to the last known-good release",
    }),
  };
}

/** Score hard-fail: blast-radius 0–1 with pinned auth band anchors. */
export function buildBlastRadiusQuestions() {
  return {
    blastRadius: score(
      "Rate the blast radius of this change from 0 (isolated) to 1 (core systems). " +
        "Band 0.7–0.9 means the change touches auth.",
      [
        "0.0–0.3: isolated change",
        "0.4–0.6: shared modules",
        "0.7–0.9: touches auth",
        "1.0: touches auth and billing core",
      ],
    ),
  };
}
