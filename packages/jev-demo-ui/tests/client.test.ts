import { describe, expect, it } from "vitest";
import { TYPESAFE_API_BASE } from "../server/constants.js";
import { createUiClient, describeConnection, resolveUiAuth } from "../src/lib/client.js";
import { resolveLiveClientConfig } from "../src/lib/live-client-config.js";

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

  it("routes session keys to direct Typesafe API in prod/static builds", () => {
    const auth = resolveUiAuth({
      sessionKey: "sk-pages-live",
      fixtureModeForced: false,
      useServerEnv: false,
      serverKeyConfigured: false,
      fixtureId: "noul-simple",
    });

    expect(auth.mode).toBe("live");
    expect(auth.source).toBe("session");

    const liveConfig = resolveLiveClientConfig(auth);
    expect(liveConfig.baseURL).toBe(TYPESAFE_API_BASE);
    expect(liveConfig.apiKey).toBe("sk-pages-live");
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
