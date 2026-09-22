import { describe, expect, it } from "vitest";
import { SERVER_PROXY_SENTINEL } from "../server/constants.js";

describe("typesafe proxy constants", () => {
  it("uses a non-VITE sentinel for server-injected auth", () => {
    expect(SERVER_PROXY_SENTINEL).not.toMatch(/^VITE_/);
    expect(SERVER_PROXY_SENTINEL).toBe("server-env-proxy");
  });
});
