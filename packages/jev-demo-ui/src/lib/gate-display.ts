import {
  decideFromChoice,
  decideFromNoul,
  decideFromScore,
  formatUsage,
  noulConfidence,
  type Decision,
  type GateOutcome,
} from "@zotoio/jev-demo";
import { formatGateSummary } from "../../../jev-demo/demos/speculative-fanout.js";

export { formatGateSummary, formatUsage };

export interface AnswerGateResult {
  key: string;
  type: "noul" | "choice" | "score";
  summary: string;
  confidence: number;
  decision: Decision;
  details: Record<string, unknown>;
}

export function gateOutcomeLabel(outcome: GateOutcome): string {
  return formatGateSummary(outcome);
}

export function gateOutcomeClass(outcome: GateOutcome): string {
  return `gate-${outcome}`;
}

export function evaluateAnswerGates(
  answers: Record<string, unknown>,
): AnswerGateResult[] {
  return Object.entries(answers).map(([key, value]) => {
    const answer = value as Record<string, unknown>;

    if (answer.type === "noul" || typeof answer.noul === "number") {
      const noul = answer.noul as number;
      const decision = decideFromNoul(noul);
      return {
        key,
        type: "noul",
        summary: `p(yes)=${noul.toFixed(2)} → ${decision.proposal.yes ? "yes" : "no"}`,
        confidence: noulConfidence(noul),
        decision,
        details: { noul, yes: decision.proposal.yes },
      };
    }

    if (answer.type === "choice" || typeof answer.choice === "string") {
      const choice = answer.choice as string;
      const confidence = answer.confidence as number;
      const decision = decideFromChoice(choice, confidence);
      return {
        key,
        type: "choice",
        summary: `${choice} (${confidence.toFixed(2)})`,
        confidence,
        decision,
        details: {
          choice,
          confidence,
          probabilities: answer.probabilities,
        },
      };
    }

    const score = answer.score as number;
    const confidence = answer.confidence as number;
    const decision = decideFromScore(score, confidence);
    return {
      key,
      type: "score",
      summary: `score=${score.toFixed(2)} (${confidence.toFixed(2)})`,
      confidence,
      decision,
      details: {
        score,
        confidence,
        legend: answer.legend,
        probabilities: answer.probabilities,
      },
    };
  });
}
