import { describe, expect, it } from "vitest";
import { createTypeSafeClient } from "../../lib/client/typesafe-client.js";
import {
  buildAutoMergeQuestions,
  demoNoulAutoMergeHardFail,
  JEV_SYSTEM_CONTRACT,
  type AutoMergeState,
} from "../../demos/hard-fail/index.js";
import { loadHardFailFixture } from "../../testing/hard-fail-fixtures.js";
import { assertPromptContract } from "../../testing/prompt-contract-asserts.js";
import { createFixtureFetch, hardFailSystemOneRoute } from "../../testing/fixtures.js";

const FIXTURE_PATH = "hard-fail/noul-auto-merge.json";

describe("Noul hard-fail (auto-merge without blast-radius)", () => {
  const fixture = loadHardFailFixture<AutoMergeState>(FIXTURE_PATH);

  it("enforces prompt contract hooks beside the golden", () => {
    assertPromptContract(fixture.promptContract, buildAutoMergeQuestions(), JEV_SYSTEM_CONTRACT);
  });

  it("denies or escalates — never acts — when blast-radius is missing", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([hardFailSystemOneRoute(FIXTURE_PATH)]),
    });

    const result = await demoNoulAutoMergeHardFail(client, fixture.state);

    expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    expect(result.decision.outcome).not.toBe("act");
    expect(["deny", "ask_human"]).toContain(result.decision.outcome);
    expect(result.decision.proposal.missingFacts).toContain("blastRadius");
    expect(result.decision.proposal.missingFacts.length).toBeGreaterThan(0);
  });

  it("fails the hard-fail invariant if a fixture would promote to act", () => {
    const answer = fixture.response.answers.safeToAutoMerge;
    expect(answer.type).toBe("noul");
    if (answer.type !== "noul") return;
    expect(answer.noul).toBeGreaterThanOrEqual(0.85);
  });
});
