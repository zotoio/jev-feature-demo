import type { IncomingMessage, ServerResponse } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { PROXY_CONFIG_PATH, SERVER_PROXY_SENTINEL } from "../server/constants.js";
import { handleTypesafeProxy } from "../server/typesafe-proxy.js";

function mockResponse() {
  let statusCode = 0;
  let body = "";

  const res = {
    statusCode: 0,
    setHeader() {},
    end(data: string) {
      body = data;
    },
  } as ServerResponse;

  Object.defineProperty(res, "statusCode", {
    get: () => statusCode,
    set: (value: number) => {
      statusCode = value;
    },
  });

  return {
    res,
    read() {
      return { statusCode, body: JSON.parse(body) as { serverKeyConfigured: boolean } };
    },
  };
}

describe("typesafe proxy constants", () => {
  it("uses a non-VITE sentinel for server-injected auth", () => {
    expect(SERVER_PROXY_SENTINEL).not.toMatch(/^VITE_/);
    expect(SERVER_PROXY_SENTINEL).toBe("server-env-proxy");
  });
});

describe("handleTypesafeProxy config", () => {
  const previousKey = process.env.TYPESAFE_API_KEY;

  afterEach(() => {
    if (previousKey === undefined) {
      delete process.env.TYPESAFE_API_KEY;
    } else {
      process.env.TYPESAFE_API_KEY = previousKey;
    }
  });

  it("reports serverKeyConfigured from runtime process.env (not Vite define)", async () => {
    process.env.TYPESAFE_API_KEY = "sk-test-proxy-key";

    const { res, read } = mockResponse();
    const handled = await handleTypesafeProxy(
      { url: PROXY_CONFIG_PATH, method: "GET", headers: {} } as IncomingMessage,
      res,
    );

    expect(handled).toBe(true);
    expect(read()).toEqual({ statusCode: 200, body: { serverKeyConfigured: true } });
  });

  it("reports serverKeyConfigured false when TYPESAFE_API_KEY is unset", async () => {
    delete process.env.TYPESAFE_API_KEY;

    const { res, read } = mockResponse();
    await handleTypesafeProxy(
      { url: PROXY_CONFIG_PATH, method: "GET", headers: {} } as IncomingMessage,
      res,
    );

    expect(read()).toEqual({ statusCode: 200, body: { serverKeyConfigured: false } });
  });
});
