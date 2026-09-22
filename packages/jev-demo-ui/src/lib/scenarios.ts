import type { TypeSafeClient } from "@typesafe-ai/sdk";
import { formatUsage } from "@zotoio/jev-demo";
import { demoBatchQuestions } from "../../../jev-demo/demos/batch-demo.js";
import { demoChoiceWithOther } from "../../../jev-demo/demos/choice-demo.js";
import { demoLatestModel, demoListModels, demoPinnedModel } from "../../../jev-demo/demos/models-demo.js";
import { demoNoulSimple, demoNoulWithCriteria } from "../../../jev-demo/demos/primitives.js";
import { demoScoreFrustration } from "../../../jev-demo/demos/score-demo.js";
import {
  formatGateSummary,
  routeSpeculativeFanOut,
  runSpeculativeFanOut,
} from "../../../jev-demo/demos/speculative-fanout.js";
import {
  demoStateAsObject,
  demoStateAsString,
  demoStateAsTextArray,
  demoStructuredInstructions,
} from "../../../jev-demo/demos/state-shapes.js";
import { triageSupportTicket } from "../../../jev-demo/demos/support-ticket-triage.js";
import { getFixture } from "./fixtures.js";

export interface ScenarioDefinition {
  id: string;
  label: string;
  description: string;
  fixtureId: string;
  category: "golden" | "triage" | "error";
  sampleState?: string;
  promptContract?: string;
  hardFailChecks?: string[];
  run: (client: TypeSafeClient) => Promise<unknown>;
}

const billingTicket =
  "URGENT: charged twice for my subscription — refund one charge today";

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: "golden-noul",
    label: "Golden: Noul refund",
    description: "Hard-fail golden — wantsRefund.noul === 0.99",
    fixtureId: "noul-simple",
    category: "golden",
    sampleState: billingTicket,
    hardFailChecks: ["wantsRefund.noul = 0.99", "gate outcome = act"],
    promptContract: 'noul("Is the customer asking for a refund?")',
    run: (client) => demoNoulSimple(client, billingTicket),
  },
  {
    id: "golden-noul-criteria",
    label: "Golden: Noul + criteria",
    description: "Urgency rubric with true/false criteria",
    fixtureId: "noul-with-criteria",
    category: "golden",
    sampleState: "URGENT: need this fixed before the board meeting tomorrow",
    hardFailChecks: ["isUrgent decision derived from noul confidence"],
    promptContract: 'noul("Does this message convey urgency?", { true, false })',
    run: (client) => demoNoulWithCriteria(client, "URGENT: need this fixed before the board meeting tomorrow"),
  },
  {
    id: "golden-choice",
    label: "Golden: Choice + other",
    description: "department confidence 0.81 → ask_human",
    fixtureId: "choice-with-other",
    category: "golden",
    sampleState: billingTicket,
    hardFailChecks: ["department.confidence = 0.81", "gate outcome = ask_human"],
    promptContract: 'choice("Which team should handle this ticket?", { billing, technical, sales, other })',
    run: (client) => demoChoiceWithOther(client, billingTicket),
  },
  {
    id: "golden-score",
    label: "Golden: Score frustration",
    description: "frustration.score = 1.05, confidence 0.92 → act",
    fixtureId: "score-frustration",
    category: "golden",
    sampleState: billingTicket,
    hardFailChecks: ["frustration.score = 1.05", "gate outcome = act"],
    promptContract: 'score("How frustrated is the customer?", [levels...])',
    run: (client) => demoScoreFrustration(client, billingTicket),
  },
  {
    id: "golden-batch",
    label: "Golden: Batch questions",
    description: "Category + refund + frustration in one round-trip",
    fixtureId: "batch",
    category: "golden",
    sampleState: billingTicket,
    hardFailChecks: ["usage input=512 output=64"],
    promptContract: "buildBatchQuestions() — 3 questions, 1 API call",
    run: (client) => demoBatchQuestions(client, billingTicket),
  },
  {
    id: "golden-state-shapes",
    label: "Golden: State shapes",
    description: "String, object, and text-array state demos",
    fixtureId: "state-string",
    category: "golden",
    sampleState: billingTicket,
    promptContract: "Same noul question against string | object | text[]",
    run: async (client) => ({
      string: await demoStateAsString(client, billingTicket),
      object: await demoStateAsObject(client, {
        subject: "Double charge",
        body: billingTicket,
        customerTier: "pro",
      }),
      array: await demoStateAsTextArray(client, ["Customer: charged twice", "Agent: checking billing"]),
      structured: await demoStructuredInstructions(client),
    }),
  },
  {
    id: "golden-models",
    label: "Golden: Model pin vs latest",
    description: "jev-latest alias vs pinned jev-1.13.0",
    fixtureId: "model-latest",
    category: "golden",
    sampleState: billingTicket,
    hardFailChecks: ["response.model resolves to jev-1.13.0"],
    promptContract: "model: JEV_LATEST | JEV_PINNED + models.list()",
    run: async (client) => ({
      latest: await demoLatestModel(client, billingTicket),
      pinned: await demoPinnedModel(client, billingTicket),
      models: await demoListModels(client),
    }),
  },
  {
    id: "triage-fanout",
    label: "Triage: Speculative fan-out",
    description: "Hard-fail billing golden — handler=billing, priority=high",
    fixtureId: "speculative-fanout",
    category: "triage",
    sampleState: billingTicket,
    hardFailChecks: [
      "category = billing (0.84) → ask_human",
      "handler = billing",
      "priority = high",
      "usage input=620 output=88",
    ],
    promptContract: "buildSpeculativeQuestions() → routeSpeculativeFanOut()",
    run: async (client) => {
      const { response, action } = await runSpeculativeFanOut(client, billingTicket);
      return {
        model: response.model,
        usage: formatUsage(response.usage),
        category: response.answers.category.choice,
        categoryConfidence: response.answers.category.confidence,
        categoryGate: formatGateSummary(action.gates.category.outcome),
        handler: action.handler,
        priority: action.priority,
        notes: action.notes,
        gates: action.gates,
        routed: routeSpeculativeFanOut(response),
      };
    },
  },
  {
    id: "triage-cli",
    label: "Triage: CLI parity",
    description: "Same output shape as pnpm demo:triage",
    fixtureId: "speculative-fanout",
    category: "triage",
    sampleState: billingTicket,
    promptContract: "triageSupportTicket({ ticket })",
    run: async (client) => triageSupportTicket({ ticket: billingTicket, client }),
  },
];

export function getScenario(id: string): ScenarioDefinition {
  const scenario = SCENARIOS.find((s) => s.id === id);
  if (!scenario) throw new Error(`Unknown scenario: ${id}`);
  return scenario;
}

export function scenarioFixturePreview(fixtureId: string): unknown {
  return getFixture(fixtureId).body;
}
