import type { EntryType, TypeSafeClient } from "@typesafe-ai/sdk";
import { decideFromChoice, type Decision } from "../../lib/confidence-gates.js";
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
  const choice = answer.choice as DeployStrategy;

  return {
    systemContract: JEV_SYSTEM_CONTRACT,
    lockedOptions: DEPLOY_STRATEGY_OPTIONS,
    response,
    decision: decideFromChoice(choice, answer.confidence),
    smokeFailRequiresRollback: state.smoke === "fail",
  };
}
