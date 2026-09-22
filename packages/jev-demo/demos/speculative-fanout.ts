import { choice, noul, score } from "@typesafe-ai/sdk";
import type { TypeSafeClient, SystemOneResult } from "@typesafe-ai/sdk";
import {
  decideFromChoice,
  decideFromNoul,
  decideFromScore,
  type Decision,
  type GateOutcome,
} from "../lib/confidence-gates.js";

/** Full speculative fan-out question set — one API call, branch in code. */
export function buildSpeculativeQuestions() {
  return {
    category: choice("What category best describes this support ticket?", {
      bug_report: "Software defect",
      billing: "Payment or refund issue",
      feature_request: "New capability",
      other: "Other",
    }),
    bugSeverity: score("If this is a bug, how severe is it?", [
      "Minor cosmetic",
      "Functional impact",
      "Critical outage",
    ]),
    hasReproSteps: noul("If this is a bug, are reproducible steps included?"),
    refundRequested: noul("If this is billing, is a refund requested?"),
    frustration: score("How frustrated is the customer?", ["Calm", "Frustrated", "Very angry"]),
  } as const;
}

export type SpeculativeQuestions = ReturnType<typeof buildSpeculativeQuestions>;
export type SpeculativeResponse = SystemOneResult<SpeculativeQuestions>;

export interface TriageAction {
  handler: "engineering" | "billing" | "product" | "general";
  priority: "normal" | "high";
  notes: string[];
  /** Application gate outcomes — code decides side effects, not Jev. */
  gates: {
    category: Decision<{ choice: string }>;
    frustration?: Decision<{ score: number }>;
  };
}

/**
 * Branch on speculative answers in application code.
 * Irrelevant answers (e.g. bug severity on a billing ticket) are ignored.
 */
export function routeSpeculativeFanOut(response: SpeculativeResponse): TriageAction {
  const { category, bugSeverity, hasReproSteps, refundRequested, frustration } = response.answers;
  const categoryDecision = decideFromChoice(category.choice, category.confidence);
  const notes: string[] = [];
  let handler: TriageAction["handler"] = "general";
  let priority: TriageAction["priority"] = "normal";

  if (category.choice === "bug_report") {
    handler = "engineering";
    const severity = bugSeverity.score;
    const repro = decideFromNoul(hasReproSteps.noul);
    if (severity > 1.5 && repro.proposal.yes && repro.outcome === "act") {
      priority = "high";
      notes.push("Escalate: high severity bug with repro steps");
    } else {
      notes.push("Add to engineering backlog");
    }
  } else if (category.choice === "billing") {
    handler = "billing";
    const refund = decideFromNoul(refundRequested.noul);
    if (refund.proposal.yes && refund.outcome !== "abstain") {
      notes.push("Flag likely refund request");
    }
  } else if (category.choice === "feature_request") {
    handler = "product";
    notes.push("Log feature request");
  } else {
    notes.push("Route to general queue — category is other");
  }

  const frustrationDecision = decideFromScore(frustration.score, frustration.confidence);
  if (frustration.score > 1.5) {
    priority = "high";
    notes.push("Priority response: elevated frustration");
  }

  return {
    handler,
    priority,
    notes,
    gates: {
      category: categoryDecision,
      frustration: frustrationDecision,
    },
  };
}

export async function runSpeculativeFanOut(
  client: TypeSafeClient,
  state: string,
): Promise<{ response: SpeculativeResponse; action: TriageAction }> {
  const response = await client.systemOne({
    state,
    questions: buildSpeculativeQuestions(),
  });
  return { response, action: routeSpeculativeFanOut(response) };
}

export function formatGateSummary(outcome: GateOutcome): string {
  const labels: Record<GateOutcome, string> = {
    act: "ACT — safe to automate",
    ask_human: "ASK_HUMAN — escalate for review",
    deny: "DENY — do not proceed automatically",
    abstain: "ABSTAIN — insufficient confidence",
  };
  return labels[outcome];
}
