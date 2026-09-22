import { describe, expect, it } from "vitest";
import { createTypeSafeClient } from "../lib/client/typesafe-client.js";
import { demoNoulSimple, demoNoulWithCriteria } from "../demos/primitives.js";
import { noulConfidence } from "../lib/confidence-gates.js";
import { createFixtureFetch, systemOneRoute } from "../testing/fixtures.js";

describe("Noul", () => {
  it("evaluates yes/no without criteria", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([systemOneRoute("systemone/noul-simple.json")]),
    });

    const result = await demoNoulSimple(
      client,
      "I was charged twice. Please refund one charge today.",
    );

    expect(result.response.answers.wantsRefund.noul).toBe(0.99);
    expect(result.confidence).toBeCloseTo(0.99);
    expect(result.decision.proposal.yes).toBe(true);
    expect(result.decision.outcome).toBe("act");
  });

  it("evaluates noul with true/false criteria", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([systemOneRoute("systemone/noul-with-criteria.json")]),
    });

    const result = await demoNoulWithCriteria(client, "URGENT: payouts failing for 3 days!");
    expect(result.response.answers.isUrgent.noul).toBe(0.95);
    expect(noulConfidence(0.95)).toBeCloseTo(0.95);
  });
});
