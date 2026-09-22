import { describe, expect, it } from "vitest";
import { createUiClient, describeConnection } from "../src/lib/client.js";

describe("UI client factory", () => {
  it("uses fixture mode when no API key is present", () => {
    expect(
      describeConnection({
        apiKey: null,
        fixtureMode: false,
        fixtureId: "noul-simple",
      }),
    ).toBe("fixture");
  });

  it("uses live mode only when key is present and fixture mode is off", () => {
    expect(
      describeConnection({
        apiKey: "sk-test",
        fixtureMode: false,
        fixtureId: "noul-simple",
      }),
    ).toBe("live");
  });

  it("returns fixture responses offline", async () => {
    const client = createUiClient({
      apiKey: null,
      fixtureMode: true,
      fixtureId: "noul-simple",
    });

    const result = await client.systemOne({
      state: "refund please",
      questions: { wantsRefund: { type: "noul", instructions: "?" } },
    });

    expect((result.answers as { wantsRefund: { noul: number } }).wantsRefund.noul).toBe(0.99);
  });
});
