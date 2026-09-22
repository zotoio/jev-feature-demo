#!/usr/bin/env node
/**
 * Live smoke tests — require TYPESAFE_API_KEY.
 * Run: pnpm test:live
 */
const apiKey = process.env.TYPESAFE_API_KEY?.trim();
if (!apiKey) {
  console.error("Skipping live tests: TYPESAFE_API_KEY is not set.");
  process.exit(0);
}

import { noul } from "@typesafe-ai/sdk";
import { createTypeSafeClient } from "../lib/client/typesafe-client.js";
import { JEV_LATEST, JEV_PINNED } from "../lib/constants.js";
import { triageSupportTicket } from "../demos/support-ticket-triage.js";

const client = createTypeSafeClient({ apiKey, logLevel: "warn" });

console.log("Live: list models…");
const models = await client.models.list();
console.log(`  ${models.map((m) => m.name).join(", ")}`);

console.log("Live: jev-latest probe…");
const latest = await client.systemOne({
  model: JEV_LATEST,
  state: "Is this a billing question about a duplicate charge?",
  questions: { billing: noul("Is this about billing?") },
});
console.log(`  resolved model: ${latest.model}`);
console.log(`  usage: ${latest.usage.input_tokens} in / ${latest.usage.output_tokens} out`);

console.log("Live: pinned model probe…");
const pinned = await client.systemOne({
  model: JEV_PINNED,
  state: "Is this a billing question about a duplicate charge?",
  questions: { billing: noul("Is this about billing?") },
});
console.log(`  model field: ${pinned.model}`);

console.log("Live: support ticket triage…");
const triage = await triageSupportTicket({
  ticket: "I was charged twice. Please refund one charge.",
  client,
});
console.log(triage);
console.log("\nLive smoke passed.");
