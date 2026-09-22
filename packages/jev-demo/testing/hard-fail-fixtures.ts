import type { Question, SystemOneResult } from "@typesafe-ai/sdk";
import { loadFixture } from "./fixtures.js";

export interface PromptContract {
  system: string;
  questionKey: string;
  missingFactHook?: string;
  mustNotContain?: string[];
  lockedOptions?: string[];
  mustNotAllowFreeText?: boolean;
  bandAnchors?: Record<string, { min: number; max: number }>;
  midScoreMaxOutcome?: string;
}

export interface HardFailFixture<TState = Record<string, unknown>> {
  scenario: string;
  promptContract: PromptContract;
  state: TState;
  response: SystemOneResult<Record<string, Question>>;
}

export function loadHardFailFixture<TState = Record<string, unknown>>(
  relativePath: string,
): HardFailFixture<TState> {
  return loadFixture<HardFailFixture<TState>>(relativePath);
}
