import { describe, expect, it } from "vitest";
import { RawTypeSafeClient } from "../lib/client/raw-fetch-client.js";
import { MODELS_PATH, SYSTEMONE_PATH } from "../lib/constants.js";
import { createFixtureFetch, loadFixture } from "../testing/fixtures.js";

describe("Raw fetch client", () => {
  it("POST /v1/systemone returns typed answers", async () => {
    const raw = new RawTypeSafeClient({
      apiKey: "sk-test",
      fetchImpl: createFixtureFetch([
        {
          method: "POST",
          path: SYSTEMONE_PATH,
          body: loadFixture("systemone/noul-simple.json"),
        },
      ]) as typeof fetch,
    });

    const response = await raw.systemOne({
      state: "Refund please",
      questions: { wantsRefund: { type: "noul", instructions: "Refund?" } },
    });

    expect(response.answers.wantsRefund.type).toBe("noul");
    if (response.answers.wantsRefund.type === "noul") {
      expect(response.answers.wantsRefund.noul).toBe(0.99);
    }
    expect(response.usage.input_tokens).toBe(296);
  });

  it("GET /v1/models returns model cards", async () => {
    const raw = new RawTypeSafeClient({
      apiKey: "sk-test",
      fetchImpl: createFixtureFetch([
        {
          method: "GET",
          path: MODELS_PATH,
          body: loadFixture("models/list.json"),
        },
      ]) as typeof fetch,
    });

    const { models } = await raw.listModels();
    expect(models[0]?.name).toBe("jev-latest");
  });
});
