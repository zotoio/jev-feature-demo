import { describe, expect, it } from "vitest";
import { TYPESAFE_API_BASE } from "../server/constants.js";
import { createUiClient, describeConnection, resolveUiAuth } from "../src/lib/client.js";
import { resolveLiveClientConfig } from "../src/lib/live-client-config.js";

const localDev = {
  devProxyAvailable: true,
};

const staticPublish = {
  devProxyAvailable: false,
};

describe("UI client factory", () => {
  it("defaults to fixture mode when server env is configured but not opted in", () => {
    expect(
      resolveUiAuth({
        sessionKey: null,
        fixtureModeForced: false,
        useServerEnv: false,
        serverKeyConfigured: true,
        fixtureId: "noul-simple",
        ...localDev,
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
        ...localDev,
      }),
    ).toContain(".env");
  });

  it("routes session keys to direct Typesafe API on localhost", () => {
    const auth = resolveUiAuth({
      sessionKey: "sk-local-live",
      fixtureModeForced: false,
      useServerEnv: false,
      serverKeyConfigured: false,
      fixtureId: "noul-simple",
      ...localDev,
    });

    expect(auth.mode).toBe("live");
    expect(auth.source).toBe("session");

    const liveConfig = resolveLiveClientConfig(auth);
    expect(liveConfig.baseURL).toBe(TYPESAFE_API_BASE);
    expect(liveConfig.apiKey).toBe("sk-local-live");
  });

  it("stays in fixture mode on static publish even with a session key", () => {
    expect(
      resolveUiAuth({
        sessionKey: "sk-session",
        fixtureModeForced: false,
        useServerEnv: false,
        serverKeyConfigured: false,
        fixtureId: "noul-simple",
        ...staticPublish,
      }),
    ).toEqual({
      mode: "fixture",
      reason: "no-key",
    });
  });

  it("returns fixture responses offline", async () => {
    const client = createUiClient({
      sessionKey: null,
      fixtureModeForced: true,
      useServerEnv: false,
      serverKeyConfigured: false,
      devProxyAvailable: false,
      fixtureId: "noul-simple",
    });

    const result = await client.systemOne({
      state: "refund please",
      questions: { wantsRefund: { type: "noul", instructions: "?" } },
    });

    expect((result.answers as { wantsRefund: { noul: number } }).wantsRefund.noul).toBe(0.99);
  });
});
