import type { EntryType, TypeSafeClient } from "@typesafe-ai/sdk";
import {
  BLAST_RADIUS_TOUCHES_AUTH_BAND,
  decideFromScore,
  DEFAULT_BLAST_RADIUS_SCORE_BANDS,
  type Decision,
} from "../../lib/confidence-gates.js";
import { buildBlastRadiusQuestions, JEV_SYSTEM_CONTRACT } from "./prompt-contracts.js";

export interface BlastRadiusState {
  change: {
    files: string[];
    summary: string;
  };
}

export interface BlastRadiusDemoResult {
  systemContract: string;
  bandAnchors: { touchesAuth: { min: number; max: number } };
  response: Awaited<ReturnType<TypeSafeClient["systemOne"]>>;
  decision: Decision<{ score: number }>;
  confidenceOnlyOutcome: string;
}

/** Hard-fail score: mid-band blast-radius caps promotion even at high confidence. */
export async function demoScoreBlastRadiusHardFail(
  client: TypeSafeClient,
  state: BlastRadiusState,
): Promise<BlastRadiusDemoResult> {
  const response = await client.systemOne({
    state: state as unknown as EntryType,
    questions: buildBlastRadiusQuestions(),
  });

  const answer = response.answers.blastRadius;
  const confidenceOnly = decideFromScore(answer.score, answer.confidence);
  const decision = decideFromScore(answer.score, answer.confidence, {
    scoreBands: DEFAULT_BLAST_RADIUS_SCORE_BANDS,
  });

  return {
    systemContract: JEV_SYSTEM_CONTRACT,
    bandAnchors: { touchesAuth: BLAST_RADIUS_TOUCHES_AUTH_BAND },
    response,
    decision,
    confidenceOnlyOutcome: confidenceOnly.outcome,
  };
}
