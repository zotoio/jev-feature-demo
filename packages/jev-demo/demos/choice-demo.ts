import { choice } from "@typesafe-ai/sdk";
import type { TypeSafeClient } from "@typesafe-ai/sdk";
import { decideFromChoice } from "../lib/confidence-gates.js";

/** Choice with explicit `other` option when the set may not cover every case. */
export async function demoChoiceWithOther(client: TypeSafeClient, state: string) {
  const response = await client.systemOne({
    state,
    questions: {
      department: choice("Which team should handle this ticket?", {
        billing: "Payments, invoicing, refunds",
        technical: "Bugs, outages, integrations",
        sales: "Pricing, upgrades, new accounts",
        other: "Anything that does not fit the categories above",
      }),
    },
  });

  const answer = response.answers.department;
  return {
    response,
    decision: decideFromChoice(answer.choice, answer.confidence),
    probabilities: answer.probabilities,
  };
}
