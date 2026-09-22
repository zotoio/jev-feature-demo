import type { TypeSafeClient } from "@typesafe-ai/sdk";
import { noul } from "@typesafe-ai/sdk";
import { JEV_LATEST, JEV_PINNED } from "../lib/constants.js";

const probeQuestion = {
  billing: noul("Is this about billing?"),
} as const;

/** Call with jev-latest alias; response.model reports resolved version (e.g. jev-1.13.0). */
export async function demoLatestModel(client: TypeSafeClient, state: string) {
  return client.systemOne({
    model: JEV_LATEST,
    state,
    questions: probeQuestion,
  });
}

/** Call with pinned jev-1.13.0 for reproducible thresholds. */
export async function demoPinnedModel(client: TypeSafeClient, state: string) {
  return client.systemOne({
    model: JEV_PINNED,
    state,
    questions: probeQuestion,
  });
}

export async function demoListModels(client: TypeSafeClient) {
  return client.models.list();
}
