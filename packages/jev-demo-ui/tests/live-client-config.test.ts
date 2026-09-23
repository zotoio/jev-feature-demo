import { describe, expect, it } from "vitest";
import { PROXY_BASE_PATH, TYPESAFE_API_BASE } from "../server/constants.js";
import { resolveLiveClientConfig } from "../src/lib/live-client-config.js";

describe("resolveLiveClientConfig", () => {
  it("uses direct Typesafe API base for session keys (static / GitHub Pages path)", () => {
    const config = resolveLiveClientConfig({
      mode: "live",
      source: "session",
      sessionKey: "sk-session-key",
    });

    expect(config.baseURL).toBe(TYPESAFE_API_BASE);
    expect(config.baseURL).not.toBe(PROXY_BASE_PATH);
    expect(config.apiKey).toBe("sk-session-key");
  });

  it("uses dev-server proxy base for server .env opt-in", () => {
    const config = resolveLiveClientConfig({
      mode: "live",
      source: "server-env",
    });

    expect(config.baseURL).toBe(PROXY_BASE_PATH);
    expect(config.apiKey).toBe("server-env-proxy");
  });
});
