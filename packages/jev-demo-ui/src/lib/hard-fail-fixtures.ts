import type { MockRoute } from "@zotoio/jev-demo";
import { MODELS_PATH, SYSTEMONE_PATH } from "@zotoio/jev-demo";

import choiceDeploySmokeFail from "../../../jev-demo/fixtures/hard-fail/choice-deploy-smoke-fail.json";
import noulAutoMerge from "../../../jev-demo/fixtures/hard-fail/noul-auto-merge.json";
import scoreBlastRadiusAuth from "../../../jev-demo/fixtures/hard-fail/score-blast-radius-auth.json";
import modelsList from "../../../jev-demo/fixtures/models/list.json";

export interface HardFailPromptContract {
  system: string;
  questionKey: string;
  missingFactHook?: string;
  mustNotContain?: string[];
  lockedOptions?: string[];
  mustNotAllowFreeText?: boolean;
  bandAnchors?: Record<string, { min: number; max: number }>;
  midScoreMaxOutcome?: string;
}

export interface HardFailFixtureDefinition {
  id: string;
  label: string;
  description: string;
  scenario: string;
  promptContract: HardFailPromptContract;
  state: Record<string, unknown>;
  response: unknown;
}

export const HARD_FAIL_FIXTURES: HardFailFixtureDefinition[] = [
  {
    id: "hard-fail-noul",
    label: "Explorer: Noul missing blastRadius",
    description:
      "High-confidence auto-merge proposal blocked when blast-radius fact is absent from state.",
    scenario: noulAutoMerge.scenario,
    promptContract: noulAutoMerge.promptContract,
    state: noulAutoMerge.state,
    response: noulAutoMerge.response,
  },
  {
    id: "hard-fail-choice",
    label: "Explorer: Choice smoke=fail → rollback",
    description:
      "Model proposes full deploy; smoke=fail forces rollback via promoteChoiceWithSmoke.",
    scenario: choiceDeploySmokeFail.scenario,
    promptContract: choiceDeploySmokeFail.promptContract,
    state: choiceDeploySmokeFail.state,
    response: choiceDeploySmokeFail.response,
  },
  {
    id: "hard-fail-score",
    label: "Explorer: Score auth band → ask_human",
    description:
      "Confidence alone would act, but the 0.7–0.9 touches-auth band caps at ask_human.",
    scenario: scoreBlastRadiusAuth.scenario,
    promptContract: scoreBlastRadiusAuth.promptContract,
    state: scoreBlastRadiusAuth.state,
    response: scoreBlastRadiusAuth.response,
  },
];

export function getHardFailFixture(id: string): HardFailFixtureDefinition {
  const fixture = HARD_FAIL_FIXTURES.find((item) => item.id === id);
  if (!fixture) throw new Error(`Unknown hard-fail fixture: ${id}`);
  return fixture;
}

export function hardFailFixtureToRoutes(fixtureId: string): MockRoute[] {
  const fixture = getHardFailFixture(fixtureId);
  return [
    {
      method: "POST",
      path: SYSTEMONE_PATH,
      body: fixture.response,
    },
    {
      method: "GET",
      path: MODELS_PATH,
      body: modelsList,
    },
  ];
}
