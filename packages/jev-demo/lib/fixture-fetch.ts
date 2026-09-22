import type { Fetch } from "@typesafe-ai/sdk";
import { MODELS_PATH, SYSTEMONE_PATH } from "./constants.js";

export interface MockRoute {
  method: "GET" | "POST";
  path: string;
  status?: number;
  body: unknown;
  headers?: Record<string, string>;
}

/** Build a fetch mock that serves fixture JSON for matching routes. Works in Node and browser. */
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

export function systemOneRoute(body: unknown, status = 200): MockRoute {
  return {
    method: "POST",
    path: SYSTEMONE_PATH,
    status,
    body,
  };
}

export function modelsRoute(body: unknown): MockRoute {
  return {
    method: "GET",
    path: MODELS_PATH,
    body,
  };
}
