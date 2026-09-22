import {
  TypeSafeClient,
  type Fetch,
  type SystemOneRequest,
  type SystemOneResult,
  type TypeSafeClientConfig,
} from "@typesafe-ai/sdk";
import { JEV_LATEST, TYPESAFE_API_BASE } from "../constants.js";

export type DemoClientConfig = TypeSafeClientConfig;

/** Create the official SDK client; inject `fetch` for fixture-based tests. */
export function createTypeSafeClient(config: DemoClientConfig = {}): TypeSafeClient {
  return new TypeSafeClient({
    ...config,
    apiKey: config.apiKey ?? process.env.TYPESAFE_API_KEY ?? "test-key-for-fixtures",
    baseURL: config.baseURL ?? process.env.TYPESAFE_BASE_URL ?? TYPESAFE_API_BASE,
    defaultModel: config.defaultModel ?? JEV_LATEST,
    logLevel: config.logLevel ?? "off",
    retry: config.retry ?? { maxRetries: 0 },
  });
}

export async function evaluateWithSdk<const Q extends SystemOneRequest["questions"]>(
  client: TypeSafeClient,
  request: SystemOneRequest<Q>,
): Promise<SystemOneResult<Q>> {
  return client.systemOne(request);
}

export { TypeSafeClient, type Fetch, type SystemOneRequest, type SystemOneResult };
