import { describe, expect, it } from "vitest";
import { createTypeSafeClient } from "../lib/client/typesafe-client.js";
import { demoChoiceWithOther } from "../demos/choice-demo.js";
import { promoteChoiceWithSmoke } from "../lib/confidence-gates.js";
import { createFixtureFetch, systemOneRoute } from "../testing/fixtures.js";

describe("Choice", () => {
  it("returns choice, probabilities, confidence, and other option", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([systemOneRoute("systemone/choice-with-other.json")]),
    });

    const result = await demoChoiceWithOther(
      client,
      "I was charged twice for my annual plan.",
    );

    expect(result.response.answers.department.choice).toBe("billing");
    expect(result.response.answers.department.confidence).toBe(0.81);
    expect(result.probabilities.other).toBe(0.02);
    expect(result.decision.outcome).toBe("ask_human");
  });

  it("rolls back promoted choice when smoke fails", () => {
    const promotion = promoteChoiceWithSmoke("billing", 0.9, false, "other");
    expect(promotion.rolledBack).toBe(true);
    expect(promotion.choice).toBe("other");
    expect(promotion.decision.outcome).toBe("ask_human");
  });
});
