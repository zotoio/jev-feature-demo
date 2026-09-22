import { describe, expect, it } from "vitest";
import { createTypeSafeClient } from "../../lib/client/typesafe-client.js";
import {
  buildBlastRadiusQuestions,
  demoScoreBlastRadiusHardFail,
  JEV_SYSTEM_CONTRACT,
  type BlastRadiusState,
} from "../../demos/hard-fail/index.js";
import { loadHardFailFixture } from "../../testing/hard-fail-fixtures.js";
import { assertPromptContract } from "../../testing/prompt-contract-asserts.js";
import { createFixtureFetch, hardFailSystemOneRoute } from "../../testing/fixtures.js";
import {
  BLAST_RADIUS_TOUCHES_AUTH_BAND,
  decideFromScore,
  DEFAULT_BLAST_RADIUS_SCORE_BANDS,
} from "../../lib/confidence-gates.js";

const FIXTURE_PATH = "hard-fail/score-blast-radius-auth.json";

describe("Score hard-fail (blast-radius touches auth band)", () => {
  const fixture = loadHardFailFixture<BlastRadiusState>(FIXTURE_PATH);

  it("enforces band anchors in prompt contract beside the golden", () => {
    assertPromptContract(fixture.promptContract, buildBlastRadiusQuestions(), JEV_SYSTEM_CONTRACT);
    expect(fixture.promptContract.bandAnchors?.touchesAuth).toEqual(BLAST_RADIUS_TOUCHES_AUTH_BAND);
  });

  it("keeps score inside the pinned touches-auth band", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([hardFailSystemOneRoute(FIXTURE_PATH)]),
    });

    const result = await demoScoreBlastRadiusHardFail(client, fixture.state);
    const blastAnswer = result.response.answers.blastRadius;
    expect(blastAnswer.type).toBe("score");
    if (blastAnswer.type !== "score") return;

    expect(blastAnswer.score).toBeGreaterThanOrEqual(BLAST_RADIUS_TOUCHES_AUTH_BAND.min);
    expect(blastAnswer.score).toBeLessThanOrEqual(BLAST_RADIUS_TOUCHES_AUTH_BAND.max);
  });

  it("maps mid-band score to ask_human even when confidence alone would act", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([hardFailSystemOneRoute(FIXTURE_PATH)]),
    });

    const result = await demoScoreBlastRadiusHardFail(client, fixture.state);
    const blastAnswer = result.response.answers.blastRadius;
    expect(blastAnswer.type).toBe("score");
    if (blastAnswer.type !== "score") return;
    const { score, confidence } = blastAnswer;

    expect(result.confidenceOnlyOutcome).toBe("act");
    expect(result.decision.outcome).toBe("ask_human");
    expect(result.decision.outcome).not.toBe("act");

    const banded = decideFromScore(score, confidence, {
      scoreBands: DEFAULT_BLAST_RADIUS_SCORE_BANDS,
    });
    expect(banded.outcome).toBe("ask_human");
  });
});
