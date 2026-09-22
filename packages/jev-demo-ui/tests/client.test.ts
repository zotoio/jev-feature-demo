import { describe, expect, it } from "vitest";
import { createUiClient, describeConnection, resolveUiAuth } from "../src/lib/client.js";

describe("UI client factory", () => {
  it("falls back to fixture mode when no keys are available", () => {
    expect(
      resolveUiAuth({
        sessionKey: null,
        fixtureModeForced: false,
        serverKeyConfigured: false,
        fixtureId: "noul-simple",
      }).mode,
    ).toBe("fixture");
  });

  it("uses live mode via server env proxy when configured", () => {
    expect(
      describeConnection({
        sessionKey: null,
        fixtureModeForced: false,
        serverKeyConfigured: true,
        fixtureId: "noul-simple",
      }),
    ).toContain(".env");
  });

  it("returns fixture responses offline", async () => {
    const client = createUiClient({
      sessionKey: null,
      fixtureModeForced: true,
      serverKeyConfigured: false,
      fixtureId: "noul-simple",
    });

    const result = await client.systemOne({
      state: "refund please",
      questions: { wantsRefund: { type: "noul", instructions: "?" } },
    });

    expect((result.answers as { wantsRefund: { noul: number } }).wantsRefund.noul).toBe(0.99);
  });
});
