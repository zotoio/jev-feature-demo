import { describe, expect, it } from "vitest";
import { createTypeSafeClient } from "../lib/client/typesafe-client.js";
import { demoBatchQuestions } from "../demos/batch-demo.js";
import { formatUsage } from "../lib/confidence-gates.js";
import { createFixtureFetch, systemOneRoute } from "../testing/fixtures.js";

describe("Usage tokens", () => {
  it("surfaces input_tokens and output_tokens from responses", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([systemOneRoute("systemone/batch.json")]),
    });
    const response = await demoBatchQuestions(client, "Refund request");
    expect(response.usage.input_tokens).toBe(512);
    expect(response.usage.output_tokens).toBe(64);
    expect(formatUsage(response.usage)).toBe("input=512 output=64");
  });
});
