import type { TypeSafeClient } from "@typesafe-ai/sdk";
import {
  demoChoiceDeployHardFail,
  demoNoulAutoMergeHardFail,
  demoScoreBlastRadiusHardFail,
  type AutoMergeState,
  type BlastRadiusState,
  type DeployState,
} from "../../../jev-demo/demos/hard-fail/index.js";
import { getHardFailFixture, type HardFailPromptContract } from "./hard-fail-fixtures.js";

export interface HardFailExplorerPanels {
  proposal: Record<string, unknown>;
  gate: Record<string, unknown>;
  promptContract: Record<string, unknown>;
}

export interface HardFailExplorerDefinition {
  id: string;
  label: string;
  description: string;
  fixtureId: string;
  category: "explorer";
  hardFailChecks: string[];
  run: (client: TypeSafeClient) => Promise<HardFailExplorerPanels>;
}

function formatPromptContractPanel(contract: HardFailPromptContract, systemContract: string) {
  return {
    system: systemContract,
    questionKey: contract.questionKey,
    proposeOnly: true,
    ...(contract.missingFactHook ? { missingFactHook: contract.missingFactHook } : {}),
    ...(contract.lockedOptions ? { lockedOptions: contract.lockedOptions } : {}),
    ...(contract.bandAnchors ? { bandAnchors: contract.bandAnchors } : {}),
    ...(contract.midScoreMaxOutcome ? { midScoreMaxOutcome: contract.midScoreMaxOutcome } : {}),
    ...(contract.mustNotContain ? { mustNotContain: contract.mustNotContain } : {}),
  };
}

export const HARD_FAIL_EXPLORERS: HardFailExplorerDefinition[] = [
  {
    id: "explorer-noul-blast-radius",
    label: "Explorer: Noul missing blastRadius",
    description:
      "Proposal shows missing fact; lib/ gate outcome ≠ act; contract shows propose-only + blast-radius hook.",
    fixtureId: "hard-fail-noul",
    category: "explorer",
    hardFailChecks: [
      "missingFacts includes blastRadius",
      "gate outcome ≠ act",
      "prompt contract: propose-only + missingFactHook",
    ],
    run: async (client) => {
      const fixture = getHardFailFixture("hard-fail-noul");
      const result = await demoNoulAutoMergeHardFail(client, fixture.state as AutoMergeState);

      return {
        proposal: {
          safeToAutoMerge: result.response.answers.safeToAutoMerge,
          yes: result.decision.proposal.yes,
          missingFacts: result.decision.proposal.missingFacts,
        },
        gate: {
          outcome: result.decision.outcome,
          confidence: result.confidence,
          proposal: result.decision.proposal,
        },
        promptContract: formatPromptContractPanel(fixture.promptContract, result.systemContract),
      };
    },
  },
  {
    id: "explorer-choice-smoke-fail",
    label: "Explorer: Choice smoke=fail → rollback",
    description:
      "Gate/promote path yields rollback; contract shows locked {canary, full, rollback}.",
    fixtureId: "hard-fail-choice",
    category: "explorer",
    hardFailChecks: [
      "proposed choice = full",
      "promoted choice = rollback after smoke fail",
      "locked options {canary, full, rollback}",
    ],
    run: async (client) => {
      const fixture = getHardFailFixture("hard-fail-choice");
      const result = await demoChoiceDeployHardFail(client, fixture.state as DeployState);

      return {
        proposal: {
          deployStrategy: result.response.answers.deployStrategy,
          proposedChoice: result.proposedChoice,
        },
        gate: {
          outcome: result.decision.outcome,
          confidence: result.decision.confidence,
          promotedChoice: result.promotion.choice,
          rolledBack: result.promotion.rolledBack,
          promoted: result.promotion.promoted,
          proposal: result.decision.proposal,
        },
        promptContract: formatPromptContractPanel(fixture.promptContract, result.systemContract),
      };
    },
  },
  {
    id: "explorer-score-auth-band",
    label: "Explorer: Score auth band → ask_human",
    description:
      "Confidence-only would act, but banded gate = ask_human; contract shows band anchors.",
    fixtureId: "hard-fail-score",
    category: "explorer",
    hardFailChecks: [
      "confidence-only outcome = act",
      "banded outcome = ask_human",
      "band anchors 0.7–0.9 touches auth",
    ],
    run: async (client) => {
      const fixture = getHardFailFixture("hard-fail-score");
      const result = await demoScoreBlastRadiusHardFail(client, fixture.state as BlastRadiusState);

      return {
        proposal: {
          blastRadius: result.response.answers.blastRadius,
        },
        gate: {
          confidenceOnlyOutcome: result.confidenceOnlyOutcome,
          outcome: result.decision.outcome,
          confidence: result.decision.confidence,
          proposal: result.decision.proposal,
          bandAnchors: result.bandAnchors,
        },
        promptContract: formatPromptContractPanel(fixture.promptContract, result.systemContract),
      };
    },
  },
];

export function getHardFailExplorer(id: string): HardFailExplorerDefinition {
  const explorer = HARD_FAIL_EXPLORERS.find((item) => item.id === id);
  if (!explorer) throw new Error(`Unknown hard-fail explorer: ${id}`);
  return explorer;
}
