import type { Fetch, TypeSafeClientConfig } from "@typesafe-ai/sdk";
import speculativeFanoutFixture from "../../fixtures/systemone/speculative-fanout-billing.json";
import { createFixtureFetch, systemOneRoute } from "../fixture-fetch.js";
import { createTypeSafeClient } from "./typesafe-client.js";

/** Client for demos: live when TYPESAFE_API_KEY is set, fixture-backed otherwise. */
export function createDemoClient(config: TypeSafeClientConfig = {}) {
  const hasLiveKey = Boolean(
    (config.apiKey ?? process.env.TYPESAFE_API_KEY)?.trim(),
  );

  if (hasLiveKey) {
    return createTypeSafeClient({ ...config, logLevel: config.logLevel ?? "warn" });
  }

  const fetchImpl: Fetch = createFixtureFetch([
    systemOneRoute(speculativeFanoutFixture),
  ]);

  return createTypeSafeClient({ ...config, fetch: config.fetch ?? fetchImpl });
}
