import type { EntryType, TypeSafeClient } from "@typesafe-ai/sdk";
import {
  promoteChoiceWithSmoke,
  type ChoicePromotion,
  type Decision,
} from "../../lib/confidence-gates.js";
import {
  buildDeployStrategyQuestions,
  DEPLOY_STRATEGY_OPTIONS,
  JEV_SYSTEM_CONTRACT,
  type DeployStrategy,
} from "./prompt-contracts.js";

export interface DeployState {
  service: string;
  version: string;
  smoke: string;
}

export interface DeployStrategyDemoResult {
  systemContract: string;
  lockedOptions: readonly string[];
  response: Awaited<ReturnType<TypeSafeClient["systemOne"]>>;
  proposedChoice: DeployStrategy;
  promotion: ChoicePromotion<DeployStrategy>;
  decision: Decision<{ choice: DeployStrategy }>;
  smokeFailRequiresRollback: boolean;
}

/** Hard-fail choice: smoke=fail must yield rollback from the locked option set. */
export async function demoChoiceDeployHardFail(
  client: TypeSafeClient,
  state: DeployState,
): Promise<DeployStrategyDemoResult> {
  const response = await client.systemOne({
    state: state as unknown as EntryType,
    questions: buildDeployStrategyQuestions(),
  });

  const answer = response.answers.deployStrategy;
  const proposedChoice = answer.choice as DeployStrategy;
  const smokePass = state.smoke !== "fail";
  const promotion = promoteChoiceWithSmoke(
    proposedChoice,
    answer.confidence,
    smokePass,
    "rollback",
  );

  return {
    systemContract: JEV_SYSTEM_CONTRACT,
    lockedOptions: DEPLOY_STRATEGY_OPTIONS,
    response,
    proposedChoice,
    promotion,
    decision: promotion.decision,
    smokeFailRequiresRollback: state.smoke === "fail",
  };
}
