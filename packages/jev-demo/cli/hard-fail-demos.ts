#!/usr/bin/env node
import { createTypeSafeClient } from "../lib/client/typesafe-client.js";
import {
  demoChoiceDeployHardFail,
  demoNoulAutoMergeHardFail,
  demoScoreBlastRadiusHardFail,
  type AutoMergeState,
  type BlastRadiusState,
  type DeployState,
} from "../demos/hard-fail/index.js";
import { loadHardFailFixture } from "../testing/hard-fail-fixtures.js";
import { createFixtureFetch, hardFailSystemOneRoute } from "../testing/fixtures.js";

const scenario = process.argv[2] ?? "all";

function offlineClient(fixturePath: string) {
  return createTypeSafeClient({
    fetch: createFixtureFetch([hardFailSystemOneRoute(fixturePath)]),
  });
}

async function runNoul() {
  const fixture = loadHardFailFixture<AutoMergeState>("hard-fail/noul-auto-merge.json");
  const client = offlineClient("hard-fail/noul-auto-merge.json");
  const result = await demoNoulAutoMergeHardFail(client, fixture.state);
  console.log("Noul hard-fail — auto-merge without blast-radius");
  console.log(`Contract: ${result.systemContract}`);
  console.log(`Confidence: ${result.confidence.toFixed(2)}`);
  console.log(`Outcome: ${result.decision.outcome}`);
  console.log(`Missing facts: ${result.decision.proposal.missingFacts.join(", ") || "none"}`);
}

async function runChoice() {
  const fixture = loadHardFailFixture<DeployState>("hard-fail/choice-deploy-smoke-fail.json");
  const client = offlineClient("hard-fail/choice-deploy-smoke-fail.json");
  const result = await demoChoiceDeployHardFail(client, fixture.state);
  console.log("Choice hard-fail — deploy strategy with smoke=fail");
  console.log(`Contract: ${result.systemContract}`);
  console.log(`State smoke: ${fixture.state.smoke}`);
  console.log(`Choice: ${result.decision.proposal.choice}`);
  console.log(`Outcome: ${result.decision.outcome}`);
}

async function runScore() {
  const fixture = loadHardFailFixture<BlastRadiusState>("hard-fail/score-blast-radius-auth.json");
  const client = offlineClient("hard-fail/score-blast-radius-auth.json");
  const result = await demoScoreBlastRadiusHardFail(client, fixture.state);
  const blastAnswer = result.response.answers.blastRadius;
  console.log("Score hard-fail — blast-radius touches auth band");
  console.log(`Contract: ${result.systemContract}`);
  console.log(`Score: ${blastAnswer.type === "score" ? blastAnswer.score : "n/a"}`);
  console.log(`Confidence-only would: ${result.confidenceOnlyOutcome}`);
  console.log(`Banded outcome: ${result.decision.outcome}`);
}

const runners: Record<string, () => Promise<void>> = {
  noul: runNoul,
  choice: runChoice,
  score: runScore,
};

if (scenario === "all") {
  await runNoul();
  console.log("");
  await runChoice();
  console.log("");
  await runScore();
} else if (runners[scenario]) {
  await runners[scenario]();
} else {
  console.error(`Unknown scenario "${scenario}". Use: noul | choice | score | all`);
  process.exit(1);
}
