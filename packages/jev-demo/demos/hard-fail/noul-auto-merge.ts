import type { EntryType, TypeSafeClient } from "@typesafe-ai/sdk";
import {
  decideFromNoulWithRequiredFacts,
  noulConfidence,
  type Decision,
} from "../../lib/confidence-gates.js";
import {
  BLAST_RADIUS_FACT_KEY,
  buildAutoMergeQuestions,
  JEV_SYSTEM_CONTRACT,
} from "./prompt-contracts.js";

export interface AutoMergeState {
  pr: { number: number; title: string; autoMergeRequested?: boolean };
  humanReview: boolean;
  blastRadius: string | null;
}

export interface AutoMergeDemoResult {
  systemContract: string;
  response: Awaited<ReturnType<TypeSafeClient["systemOne"]>>;
  confidence: number;
  decision: Decision<{ noul: number; yes: boolean; missingFacts: string[] }>;
}

/** Hard-fail noul: high-confidence yes must not promote when blast-radius is missing. */
export async function demoNoulAutoMergeHardFail(
  client: TypeSafeClient,
  state: AutoMergeState,
): Promise<AutoMergeDemoResult> {
  const response = await client.systemOne({
    state: state as unknown as EntryType,
    questions: buildAutoMergeQuestions(),
  });

  const answer = response.answers.safeToAutoMerge;
  const confidence = noulConfidence(answer.noul);
  const decision = decideFromNoulWithRequiredFacts(answer.noul, {
    requiredFacts: [BLAST_RADIUS_FACT_KEY],
    state: state as unknown as Record<string, unknown>,
  });

  return {
    systemContract: JEV_SYSTEM_CONTRACT,
    response,
    confidence,
    decision,
  };
}
