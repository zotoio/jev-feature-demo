import type { TypeSafeClient } from "@typesafe-ai/sdk";
import {
  createFixtureFetch,
  createTypeSafeClient,
  RawTypeSafeClient,
} from "@zotoio/jev-demo";
import { fixtureToRoutes } from "./fixtures.js";

export interface UiClientOptions {
  apiKey?: string | null;
  fixtureMode: boolean;
  fixtureId: string;
  defaultModel?: string;
}

export function createUiClient(options: UiClientOptions): TypeSafeClient {
  const useLive = !options.fixtureMode && Boolean(options.apiKey?.trim());

  if (useLive) {
    return createTypeSafeClient({
      apiKey: options.apiKey!.trim(),
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
  const useLive = !options.fixtureMode && Boolean(options.apiKey?.trim());

  if (useLive) {
    return new RawTypeSafeClient({
      apiKey: options.apiKey!.trim(),
    });
  }

  const fetchImpl = createFixtureFetch(fixtureToRoutes(options.fixtureId)) as typeof fetch;
  return new RawTypeSafeClient({
    apiKey: "test-key-for-fixtures",
    fetchImpl,
  });
}

export function describeConnection(options: UiClientOptions): "live" | "fixture" {
  return !options.fixtureMode && Boolean(options.apiKey?.trim()) ? "live" : "fixture";
}
