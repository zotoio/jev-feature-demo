import { describe, expect, it } from "vitest";
import { JevClient } from "../lib/JevClient.js";
import { createFixtureFetch, systemOneRoute } from "../testing/fixtures.js";

describe("JevClient facade", () => {
  it("exposes one SDK client with injectable fixture transport", async () => {
    const jev = new JevClient({
      fetch: createFixtureFetch([systemOneRoute("systemone/noul-simple.json")]),
    });

    const response = await jev.systemOne({
      state: "Refund please",
      questions: { wantsRefund: { type: "noul", instructions: "Refund?" } },
    });

    expect(response.answers.wantsRefund.type).toBe("noul");
    if (response.answers.wantsRefund.type === "noul") {
      expect(response.answers.wantsRefund.noul).toBe(0.99);
    }
    expect(jev.client).toBe(jev.sdk);
  });
});
