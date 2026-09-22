import type { Fetch, TypeSafeClientConfig } from "@typesafe-ai/sdk";
import { createFixtureFetch, systemOneRoute } from "../../testing/fixtures.js";
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
    systemOneRoute("systemone/speculative-fanout-billing.json"),
  ]);

  return createTypeSafeClient({ ...config, fetch: config.fetch ?? fetchImpl });
}
