import type { MockRoute } from "@zotoio/jev-demo";
import { MODELS_PATH, SYSTEMONE_PATH } from "@zotoio/jev-demo";

import batch from "../../../jev-demo/fixtures/systemone/batch.json";
import choiceWithOther from "../../../jev-demo/fixtures/systemone/choice-with-other.json";
import modelLatest from "../../../jev-demo/fixtures/systemone/model-latest.json";
import modelPinned from "../../../jev-demo/fixtures/systemone/model-pinned.json";
import noulSimple from "../../../jev-demo/fixtures/systemone/noul-simple.json";
import noulWithCriteria from "../../../jev-demo/fixtures/systemone/noul-with-criteria.json";
import scoreFrustration from "../../../jev-demo/fixtures/systemone/score-frustration.json";
import speculativeFanout from "../../../jev-demo/fixtures/systemone/speculative-fanout-billing.json";
import stateArray from "../../../jev-demo/fixtures/systemone/state-array.json";
import stateObject from "../../../jev-demo/fixtures/systemone/state-object.json";
import stateString from "../../../jev-demo/fixtures/systemone/state-string.json";
import structuredInstructions from "../../../jev-demo/fixtures/systemone/structured-instructions.json";
import error401 from "../../../jev-demo/fixtures/errors/401-unauthorized.json";
import error422 from "../../../jev-demo/fixtures/errors/422-validation.json";
import error429 from "../../../jev-demo/fixtures/errors/429-rate-limit.json";
import choiceDeploySmokeFail from "../../../jev-demo/fixtures/hard-fail/choice-deploy-smoke-fail.json";
import noulAutoMerge from "../../../jev-demo/fixtures/hard-fail/noul-auto-merge.json";
import scoreBlastRadiusAuth from "../../../jev-demo/fixtures/hard-fail/score-blast-radius-auth.json";
import modelsList from "../../../jev-demo/fixtures/models/list.json";

export interface FixtureDefinition {
  id: string;
  label: string;
  description: string;
  category: "primitive" | "state" | "model" | "batch" | "fanout" | "error" | "hard-fail";
  body: unknown;
  status?: number;
  headers?: Record<string, string>;
  endpoint?: "systemone" | "models";
}

export const FIXTURES: FixtureDefinition[] = [
  {
    id: "noul-simple",
    label: "Noul (plain)",
    description: "Simple yes/no refund question",
    category: "primitive",
    body: noulSimple,
  },
  {
    id: "noul-with-criteria",
    label: "Noul + criteria",
    description: "Urgency rubric with true/false criteria",
    category: "primitive",
    body: noulWithCriteria,
  },
  {
    id: "choice-with-other",
    label: "Choice + other",
    description: "Department routing with other bucket",
    category: "primitive",
    body: choiceWithOther,
  },
  {
    id: "score-frustration",
    label: "Score frustration",
    description: "Fractional score with legend",
    category: "primitive",
    body: scoreFrustration,
  },
  {
    id: "state-string",
    label: "State: string",
    description: "Plain text ticket state",
    category: "state",
    body: stateString,
  },
  {
    id: "state-object",
    label: "State: JSON object",
    description: "Structured ticket object",
    category: "state",
    body: stateObject,
  },
  {
    id: "state-array",
    label: "State: text array",
    description: "Conversation messages array",
    category: "state",
    body: stateArray,
  },
  {
    id: "structured-instructions",
    label: "Structured instructions",
    description: "Resume duplicate detection",
    category: "state",
    body: structuredInstructions,
  },
  {
    id: "batch",
    label: "Batch questions",
    description: "Category + refund + frustration in one call",
    category: "batch",
    body: batch,
  },
  {
    id: "model-latest",
    label: "Model: jev-latest",
    description: "Alias resolves to versioned model",
    category: "model",
    body: modelLatest,
  },
  {
    id: "model-pinned",
    label: "Model: jev-1.13.0",
    description: "Pinned reproducible model",
    category: "model",
    body: modelPinned,
  },
  {
    id: "speculative-fanout",
    label: "Speculative fan-out (billing)",
    description: "Hard-fail golden triage scenario",
    category: "fanout",
    body: speculativeFanout,
  },
  {
    id: "models-list",
    label: "List models",
    description: "GET /v1/models response",
    category: "model",
    body: modelsList,
    endpoint: "models",
  },
  {
    id: "error-401",
    label: "Error: 401 unauthorized",
    description: "Authentication failure",
    category: "error",
    body: error401,
    status: 401,
  },
  {
    id: "error-422",
    label: "Error: 422 validation",
    description: "Invalid request payload",
    category: "error",
    body: error422,
    status: 422,
  },
  {
    id: "error-429",
    label: "Error: 429 rate limit",
    description: "Rate limited with retry-after",
    category: "error",
    body: error429,
    status: 429,
    headers: { "retry-after": "2" },
  },
  {
    id: "hard-fail-noul",
    label: "Hard-fail: Noul auto-merge",
    description: "Missing blast-radius blocks promotion",
    category: "hard-fail",
    body: noulAutoMerge.response,
  },
  {
    id: "hard-fail-choice",
    label: "Hard-fail: Choice deploy",
    description: "Smoke=fail rolls back to rollback",
    category: "hard-fail",
    body: choiceDeploySmokeFail.response,
  },
  {
    id: "hard-fail-score",
    label: "Hard-fail: Score blast-radius",
    description: "Auth band caps at ask_human",
    category: "hard-fail",
    body: scoreBlastRadiusAuth.response,
  },
];

export function getFixture(id: string): FixtureDefinition {
  const fixture = FIXTURES.find((f) => f.id === id);
  if (!fixture) throw new Error(`Unknown fixture: ${id}`);
  return fixture;
}

export function fixtureToRoutes(fixtureId: string): MockRoute[] {
  const fixture = getFixture(fixtureId);
  if (fixture.endpoint === "models") {
    return [
      {
        method: "GET",
        path: MODELS_PATH,
        body: fixture.body,
        status: fixture.status,
        headers: fixture.headers,
      },
    ];
  }

  return [
    {
      method: "POST",
      path: SYSTEMONE_PATH,
      body: fixture.body,
      status: fixture.status,
      headers: fixture.headers,
    },
    {
      method: "GET",
      path: MODELS_PATH,
      body: modelsList,
    },
  ];
}
