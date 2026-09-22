import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TYPESAFE_API_BASE } from "../lib/constants.js";
import {
  createFixtureFetch,
  modelsRoute as modelsRouteWithBody,
  systemOneRoute as systemOneRouteWithBody,
  type MockRoute,
} from "../lib/fixture-fetch.js";

const fixturesRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "fixtures");

export function loadFixture<T = unknown>(relativePath: string): T {
  const fullPath = join(fixturesRoot, relativePath);
  return JSON.parse(readFileSync(fullPath, "utf8")) as T;
}

export { createFixtureFetch, type MockRoute };

export function systemOneRoute(fixturePath: string, status = 200): MockRoute {
  return systemOneRouteWithBody(loadFixture(fixturePath), status);
}

export function modelsRoute(fixturePath = "models/list.json"): MockRoute {
  return modelsRouteWithBody(loadFixture(fixturePath));
}

export const FIXTURE_BASE_URL = TYPESAFE_API_BASE;
