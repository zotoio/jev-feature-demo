import type { TypeSafeClient } from "@typesafe-ai/sdk";
import {
  formatGateSummary,
  runSpeculativeFanOut,
} from "./speculative-fanout.js";
import { formatUsage } from "../lib/confidence-gates.js";
import { createDemoClient } from "../lib/client/demo-client.js";

export interface TriageCliOptions {
  ticket: string;
  client?: TypeSafeClient;
  json?: boolean;
}

export async function triageSupportTicket(options: TriageCliOptions) {
  const client = options.client ?? createDemoClient();
  const { response, action } = await runSpeculativeFanOut(client, options.ticket);

  const result = {
    model: response.model,
    usage: response.usage,
    category: response.answers.category.choice,
    categoryConfidence: response.answers.category.confidence,
    categoryGate: action.gates.category.outcome,
    handler: action.handler,
    priority: action.priority,
    notes: action.notes,
  };

  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const lines = [
    "Support ticket triage (Jev proposes — code decides)",
    "─".repeat(48),
    `Model: ${response.model}`,
    `Usage: ${formatUsage(response.usage)}`,
    `Category: ${result.category} (confidence ${result.categoryConfidence.toFixed(2)})`,
    `Decision: ${formatGateSummary(result.categoryGate)}`,
    `Handler: ${action.handler} | Priority: ${action.priority}`,
    ...action.notes.map((n) => `• ${n}`),
  ];
  return lines.join("\n");
}
