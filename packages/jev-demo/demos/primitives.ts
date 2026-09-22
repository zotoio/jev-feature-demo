import { choice, noul, score } from "@typesafe-ai/sdk";
import type { TypeSafeClient } from "@typesafe-ai/sdk";
import { decideFromNoul, noulConfidence } from "../lib/confidence-gates.js";

/** Noul without criteria — plain yes/no probability. */
export async function demoNoulSimple(client: TypeSafeClient, state: string) {
  const response = await client.systemOne({
    state,
    questions: {
      wantsRefund: noul("Is the customer asking for a refund?"),
    },
  });

  const answer = response.answers.wantsRefund;
  return {
    response,
    confidence: noulConfidence(answer.noul),
    decision: decideFromNoul(answer.noul),
  };
}

/** Noul with true/false criteria rubric. */
export async function demoNoulWithCriteria(client: TypeSafeClient, state: string) {
  const response = await client.systemOne({
    state,
    questions: {
      isUrgent: noul("Does this message convey urgency?", {
        true: "Explicitly time-sensitive language or deadlines",
        false: "No urgency expressed",
      }),
    },
  });

  const answer = response.answers.isUrgent;
  return {
    response,
    confidence: noulConfidence(answer.noul),
    decision: decideFromNoul(answer.noul),
  };
}

export { noul, choice, score };
