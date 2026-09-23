import { describe, expect, it } from "vitest";
import { createUiClient, describeConnection, resolveUiAuth } from "../src/lib/client.js";

describe("UI client factory", () => {
  it("defaults to fixture mode when server env is configured but not opted in", () => {
    expect(
      resolveUiAuth({
        sessionKey: null,
        fixtureModeForced: false,
        useServerEnv: false,
        serverKeyConfigured: true,
        fixtureId: "noul-simple",
      }).mode,
    ).toBe("fixture");
  });

  it("uses live mode via server env proxy only when opted in", () => {
    expect(
      describeConnection({
        sessionKey: null,
        fixtureModeForced: false,
        useServerEnv: true,
        serverKeyConfigured: true,
        fixtureId: "noul-simple",
      }),
    ).toContain(".env");
  });

  it("returns fixture responses offline", async () => {
    const client = createUiClient({
      sessionKey: null,
      fixtureModeForced: true,
      useServerEnv: false,
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
