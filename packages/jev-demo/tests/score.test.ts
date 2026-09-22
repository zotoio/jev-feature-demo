import { describe, expect, it } from "vitest";
import { createTypeSafeClient } from "../lib/client/typesafe-client.js";
import { demoScoreFrustration } from "../demos/score-demo.js";
import { createFixtureFetch, systemOneRoute } from "../testing/fixtures.js";

describe("Score", () => {
  it("returns fractional score, legend, probabilities, and confidence", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([systemOneRoute("systemone/score-frustration.json")]),
    });

    const result = await demoScoreFrustration(
      client,
      "This is unacceptable. Fix it now or I am canceling.",
    );

    expect(result.response.answers.frustration.score).toBe(1.05);
    expect(result.response.answers.frustration.legend["1"]).toBe(
      "Frustrated but cooperative",
    );
    expect(result.decision.outcome).toBe("act");
  });

  it("routes mid-band score confidence to ask_human, not act", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([systemOneRoute("systemone/score-mid-confidence.json")]),
    });

    const result = await demoScoreFrustration(client, "Somewhat frustrated message");
    expect(result.response.answers.frustration.confidence).toBe(0.72);
    expect(result.decision.outcome).toBe("ask_human");
    expect(result.decision.outcome).not.toBe("act");
  });
});
