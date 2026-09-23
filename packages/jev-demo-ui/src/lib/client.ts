import type { TypeSafeClient } from "@typesafe-ai/sdk";
import {
  createFixtureFetch,
  createTypeSafeClient,
  RawTypeSafeClient,
} from "@zotoio/jev-demo";
import { describeAuthSource, resolveAuth, type ResolvedAuth } from "./auth-resolution.js";
import { fixtureToRoutes } from "./fixtures.js";
import { resolveLiveClientConfig } from "./live-client-config.js";

export interface UiClientOptions {
  sessionKey?: string | null;
  fixtureModeForced: boolean;
  useServerEnv: boolean;
  serverKeyConfigured: boolean;
  devProxyAvailable: boolean;
  fixtureId: string;
  defaultModel?: string;
}

export function resolveUiAuth(options: UiClientOptions): ResolvedAuth {
  return resolveAuth({
    sessionKey: options.sessionKey,
    fixtureModeForced: options.fixtureModeForced,
    useServerEnv: options.useServerEnv,
    serverKeyConfigured: options.serverKeyConfigured,
    devProxyAvailable: options.devProxyAvailable,
  });
}

export function createUiClient(options: UiClientOptions): TypeSafeClient {
  const auth = resolveUiAuth(options);

  if (auth.mode === "live") {
    const { apiKey, baseURL } = resolveLiveClientConfig(auth);

    return createTypeSafeClient({
      apiKey,
      baseURL,
      defaultModel: options.defaultModel,
      logLevel: "warn",
      dangerouslyAllowBrowser: true,
    });
  }

  return createTypeSafeClient({
    apiKey: "test-key-for-fixtures",
    defaultModel: options.defaultModel,
    fetch: createFixtureFetch(fixtureToRoutes(options.fixtureId)),
    dangerouslyAllowBrowser: true,
  });
}

export function createUiRawClient(options: UiClientOptions): RawTypeSafeClient {
  const auth = resolveUiAuth(options);

  if (auth.mode === "live") {
    const { apiKey, baseURL } = resolveLiveClientConfig(auth);

    return new RawTypeSafeClient({
      apiKey,
      baseURL,
    });
  }

  const fetchImpl = createFixtureFetch(fixtureToRoutes(options.fixtureId)) as typeof fetch;
  return new RawTypeSafeClient({
    apiKey: "test-key-for-fixtures",
    fetchImpl,
  });
}

export function describeConnection(options: UiClientOptions): string {
  return describeAuthSource(resolveUiAuth(options));
}
