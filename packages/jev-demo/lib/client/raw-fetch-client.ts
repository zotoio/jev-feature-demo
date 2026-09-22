import type { Questions, SystemOneRequestPayload, SystemOneResult } from "@typesafe-ai/sdk";
import { JEV_LATEST, MODELS_PATH, SYSTEMONE_PATH, TYPESAFE_API_BASE } from "../constants.js";

export interface RawFetchConfig {
  apiKey?: string;
  baseURL?: string;
  fetchImpl?: typeof fetch;
}

export interface ModelListWire {
  models: Array<{
    name: string;
    description: string;
    release_date: string;
  }>;
}

function resolveApiKey(config: RawFetchConfig): string {
  const key = config.apiKey ?? process.env.TYPESAFE_API_KEY;
  if (!key?.trim()) {
    throw new Error(
      "No API key provided. Set TYPESAFE_API_KEY or pass apiKey to RawTypeSafeClient.",
    );
  }
  return key.trim();
}

/**
 * Thin teaching client — same endpoints as the SDK, no retries.
 * POST https://api.typesafe.ai/v1/systemone
 * GET  https://api.typesafe.ai/v1/models
 */
export class RawTypeSafeClient {
  readonly baseURL: string;
  readonly fetchImpl: typeof fetch;

  constructor(config: RawFetchConfig = {}) {
    this.baseURL = (config.baseURL ?? process.env.TYPESAFE_BASE_URL ?? TYPESAFE_API_BASE).replace(
      /\/+$/,
      "",
    );
    this.fetchImpl = config.fetchImpl ?? fetch;
    this.#apiKey = config.apiKey;
  }

  readonly #apiKey?: string;

  private headers(apiKey: string): Record<string, string> {
    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  async systemOne<Q extends Questions>(
    payload: Omit<SystemOneRequestPayload, "model"> & { model?: string },
  ): Promise<SystemOneResult<Q>> {
    const apiKey = resolveApiKey({ apiKey: this.#apiKey });
    const body: SystemOneRequestPayload = {
      ...payload,
      model: payload.model ?? JEV_LATEST,
    };

    const response = await this.fetchImpl(`${this.baseURL}${SYSTEMONE_PATH}`, {
      method: "POST",
      headers: this.headers(apiKey),
      body: JSON.stringify(body),
    });

    const text = await response.text();
    const parsed = text ? (JSON.parse(text) as unknown) : undefined;

    if (!response.ok) {
      const message =
        typeof parsed === "object" && parsed && "detail" in parsed
          ? JSON.stringify((parsed as { detail: unknown }).detail)
          : text || response.statusText;
      throw new RawTypeSafeHttpError(response.status, message, parsed);
    }

    return parsed as SystemOneResult<Q>;
  }

  async listModels(): Promise<ModelListWire> {
    const apiKey = resolveApiKey({ apiKey: this.#apiKey });
    const response = await this.fetchImpl(`${this.baseURL}${MODELS_PATH}`, {
      method: "GET",
      headers: this.headers(apiKey),
    });

    const text = await response.text();
    const parsed = text ? (JSON.parse(text) as unknown) : undefined;

    if (!response.ok) {
      throw new RawTypeSafeHttpError(response.status, text || response.statusText, parsed);
    }

    return parsed as ModelListWire;
  }
}

export class RawTypeSafeHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body: unknown,
  ) {
    super(message);
    this.name = "RawTypeSafeHttpError";
  }
}
