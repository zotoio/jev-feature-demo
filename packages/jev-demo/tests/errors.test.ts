import { describe, expect, it } from "vitest";
import {
  AuthenticationError,
  RateLimitError,
  TypeSafeClient,
  TypeSafeError,
  UnprocessableEntityError,
} from "@typesafe-ai/sdk";
import { RawTypeSafeClient, RawTypeSafeHttpError } from "../lib/client/raw-fetch-client.js";
import { createTypeSafeClient } from "../lib/client/typesafe-client.js";
import { MODELS_PATH, SYSTEMONE_PATH } from "../lib/constants.js";
import { createFixtureFetch, loadFixture } from "../testing/fixtures.js";

describe("Error paths", () => {
  it("throws locally when SDK has no API key", () => {
    const prev = process.env.TYPESAFE_API_KEY;
    delete process.env.TYPESAFE_API_KEY;
    expect(() => new TypeSafeClient()).toThrow(TypeSafeError);
    if (prev) process.env.TYPESAFE_API_KEY = prev;
  });

  it("maps 422 validation errors via SDK", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([
        {
          method: "POST",
          path: SYSTEMONE_PATH,
          status: 422,
          body: loadFixture("errors/422-validation.json"),
        },
      ]),
    });

    await expect(
      client.systemOne({ state: "test", questions: { x: { type: "noul" } } }),
    ).rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  it("maps 401 authentication errors via SDK", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([
        {
          method: "POST",
          path: SYSTEMONE_PATH,
          status: 401,
          body: loadFixture("errors/401-unauthorized.json"),
        },
      ]),
    });

    await expect(
      client.systemOne({
        state: "test",
        questions: { x: { type: "noul", instructions: "?" } },
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("maps 429 rate limit via SDK (retry disabled)", async () => {
    const client = createTypeSafeClient({
      retry: { maxRetries: 0 },
      fetch: createFixtureFetch([
        {
          method: "POST",
          path: SYSTEMONE_PATH,
          status: 429,
          body: loadFixture("errors/429-rate-limit.json"),
          headers: { "retry-after": "2" },
        },
      ]),
    });

    await expect(
      client.systemOne({
        state: "test",
        questions: { x: { type: "noul", instructions: "?" } },
      }),
    ).rejects.toBeInstanceOf(RateLimitError);
  });

  it("raw fetch client throws on missing key before network", async () => {
    const prev = process.env.TYPESAFE_API_KEY;
    delete process.env.TYPESAFE_API_KEY;
    const raw = new RawTypeSafeClient();
    await expect(
      raw.systemOne({ state: "x", questions: { q: { type: "noul" } } }),
    ).rejects.toThrow(/No API key/);
    if (prev) process.env.TYPESAFE_API_KEY = prev;
  });

  it("raw fetch client surfaces HTTP errors", async () => {
    const raw = new RawTypeSafeClient({
      apiKey: "sk-test",
      fetchImpl: createFixtureFetch([
        {
          method: "GET",
          path: MODELS_PATH,
          status: 401,
          body: loadFixture("errors/401-unauthorized.json"),
        },
      ]) as typeof fetch,
    });

    await expect(raw.listModels()).rejects.toBeInstanceOf(RawTypeSafeHttpError);
  });
});
