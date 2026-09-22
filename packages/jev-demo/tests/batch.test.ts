import { describe, expect, it } from "vitest";
import { createTypeSafeClient } from "../lib/client/typesafe-client.js";
import { demoBatchQuestions } from "../demos/batch-demo.js";
import { createFixtureFetch, systemOneRoute } from "../testing/fixtures.js";

describe("Batch questions", () => {
  it("returns all answers in one round-trip", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([systemOneRoute("systemone/batch.json")]),
    });

    const response = await demoBatchQuestions(
      client,
      "Please refund the duplicate charge on my account.",
    );

    expect(response.answers.category.type).toBe("choice");
    expect(response.answers.refundRequested.type).toBe("noul");
    expect(response.answers.frustration.type).toBe("score");
    expect(Object.keys(response.answers)).toHaveLength(3);
  });
});
