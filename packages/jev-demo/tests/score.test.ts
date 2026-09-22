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
});
