import { choice, noul, score } from "@typesafe-ai/sdk";
import type { TypeSafeClient } from "@typesafe-ai/sdk";

/** Multi-question batch — one shared state, one round-trip. */
export function buildBatchQuestions() {
  return {
    category: choice("What category best describes this support ticket?", {
      bug_report: "Software defect or regression",
      billing: "Payment, invoice, or refund issue",
      feature_request: "New capability request",
      other: "Does not fit the categories above",
    }),
    refundRequested: noul("Is the customer asking for money back?", {
      true: "Explicit refund or chargeback language",
      false: "No refund request",
    }),
    frustration: score("How frustrated is the customer?", [
      "Calm",
      "Frustrated",
      "Very angry",
    ]),
  } as const;
}

export async function demoBatchQuestions(client: TypeSafeClient, state: string) {
  return client.systemOne({
    state,
    questions: buildBatchQuestions(),
  });
}
