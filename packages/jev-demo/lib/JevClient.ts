import type { TypeSafeClient, TypeSafeClientConfig } from "@typesafe-ai/sdk";
import { createDemoClient } from "./client/demo-client.js";
import { RawTypeSafeClient, RawTypeSafeHttpError } from "./client/raw-fetch-client.js";
import {
  createTypeSafeClient,
  evaluateWithSdk,
  type DemoClientConfig,
} from "./client/typesafe-client.js";
import { JEV_LATEST, JEV_PINNED, TYPESAFE_API_BASE } from "./constants.js";

/**
 * Primary facade for the Jev feature demo.
 * Wraps the official @typesafe-ai/sdk client, raw HTTP client, and demo helpers.
 */
export class JevClient {
  readonly sdk: TypeSafeClient;

  constructor(config: DemoClientConfig = {}) {
    this.sdk = createTypeSafeClient(config);
  }

  /** Official SDK TypeSafeClient instance. */
  get client(): TypeSafeClient {
    return this.sdk;
  }

  systemOne(...args: Parameters<TypeSafeClient["systemOne"]>) {
    return this.sdk.systemOne(...args);
  }

  get models() {
    return this.sdk.models;
  }
}

export {
  createDemoClient,
  createTypeSafeClient,
  evaluateWithSdk,
  RawTypeSafeClient,
  RawTypeSafeHttpError,
};
export * from "./confidence-gates.js";
export { JEV_LATEST, JEV_PINNED, TYPESAFE_API_BASE };

export type { DemoClientConfig, TypeSafeClientConfig };
