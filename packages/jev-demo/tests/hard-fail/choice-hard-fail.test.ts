import { describe, expect, it } from "vitest";
import { createTypeSafeClient } from "../../lib/client/typesafe-client.js";
import {
  buildDeployStrategyQuestions,
  demoChoiceDeployHardFail,
  JEV_SYSTEM_CONTRACT,
  type DeployState,
} from "../../demos/hard-fail/index.js";
import { loadHardFailFixture } from "../../testing/hard-fail-fixtures.js";
import { assertPromptContract } from "../../testing/prompt-contract-asserts.js";
import { createFixtureFetch, hardFailSystemOneRoute } from "../../testing/fixtures.js";

const FIXTURE_PATH = "hard-fail/choice-deploy-smoke-fail.json";

describe("Choice hard-fail (deploy strategy with smoke=fail)", () => {
  const fixture = loadHardFailFixture<DeployState>(FIXTURE_PATH);

  it("enforces locked options and prompt contract beside the golden", () => {
    assertPromptContract(fixture.promptContract, buildDeployStrategyQuestions(), JEV_SYSTEM_CONTRACT);
  });

  it("rolls back to rollback via promote when smoke=fail", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([hardFailSystemOneRoute(FIXTURE_PATH)]),
    });

    expect(fixture.state.smoke).toBe("fail");

    const result = await demoChoiceDeployHardFail(client, fixture.state);

    expect(result.smokeFailRequiresRollback).toBe(true);
    expect(result.proposedChoice).toBe("full");
    expect(result.promotion.rolledBack).toBe(true);
    expect(result.promotion.choice).toBe("rollback");
    expect(result.decision.proposal.choice).toBe("rollback");
    expect(result.decision.outcome).not.toBe("act");
    expect(result.lockedOptions).toEqual(["canary", "full", "rollback"]);
    const deployAnswer = result.response.answers.deployStrategy;
    expect(deployAnswer.type).toBe("choice");
    if (deployAnswer.type === "choice") {
      expect(Object.keys(deployAnswer.probabilities)).toEqual(result.lockedOptions);
      expect(deployAnswer.probabilities).not.toHaveProperty("other");
    }
  });
});
