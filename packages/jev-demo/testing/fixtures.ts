import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Fetch } from "@typesafe-ai/sdk";
import { MODELS_PATH, SYSTEMONE_PATH, TYPESAFE_API_BASE } from "../lib/constants.js";

const fixturesRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "fixtures");

export function loadFixture<T = unknown>(relativePath: string): T {
  const fullPath = join(fixturesRoot, relativePath);
  return JSON.parse(readFileSync(fullPath, "utf8")) as T;
}

export interface MockRoute {
  method: "GET" | "POST";
  path: string;
  status?: number;
  body: unknown;
  headers?: Record<string, string>;
}

/** Build a fetch mock that serves fixture JSON for matching routes. */
export function createFixtureFetch(routes: MockRoute[]): Fetch {
  return async (input, init) => {
    const url = input;
    const method = (init?.method ?? "GET").toUpperCase() as "GET" | "POST";
    const pathname = new URL(url).pathname;

    const match = routes.find((r) => r.method === method && r.path === pathname);
    if (!match) {
      return new Response(JSON.stringify({ detail: `No fixture for ${method} ${pathname}` }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(match.body), {
      status: match.status ?? 200,
      headers: {
        "Content-Type": "application/json",
        "x-typesafe-request-id": "fixture-req-id",
        ...match.headers,
      },
    });
  };
}

export function systemOneRoute(fixturePath: string, status = 200): MockRoute {
  return {
    method: "POST",
    path: SYSTEMONE_PATH,
    status,
    body: loadFixture(fixturePath),
  };
}

/** Serve the nested `response` from a hard-fail composite fixture. */
export function hardFailSystemOneRoute(fixturePath: string, status = 200): MockRoute {
  const composite = loadFixture<{ response: unknown }>(fixturePath);
  return {
    method: "POST",
    path: SYSTEMONE_PATH,
    status,
    body: composite.response,
  };
}

export function modelsRoute(fixturePath = "models/list.json"): MockRoute {
  return {
    method: "GET",
    path: MODELS_PATH,
    body: loadFixture(fixturePath),
  };
}

export const FIXTURE_BASE_URL = TYPESAFE_API_BASE;
