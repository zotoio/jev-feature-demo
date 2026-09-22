import { score } from "@typesafe-ai/sdk";
import type { TypeSafeClient } from "@typesafe-ai/sdk";
import { decideFromScore } from "../lib/confidence-gates.js";

/** Score with ordered levels — returns fractional score + legend + distribution. */
export async function demoScoreFrustration(client: TypeSafeClient, state: string) {
  const response = await client.systemOne({
    state,
    questions: {
      frustration: score("How frustrated is the customer?", [
        "Calm and neutral",
        "Frustrated but cooperative",
        "Very angry or threatening",
      ]),
    },
  });

  const answer = response.answers.frustration;
  return {
    response,
    decision: decideFromScore(answer.score, answer.confidence),
    legend: answer.legend,
    probabilities: answer.probabilities,
  };
}
