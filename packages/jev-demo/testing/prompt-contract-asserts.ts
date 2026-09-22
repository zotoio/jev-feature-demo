import { expect } from "vitest";
import type { PromptContract } from "./hard-fail-fixtures.js";

function collectQuestionText(question: unknown): string {
  if (typeof question === "string") return question;
  if (question && typeof question === "object") {
    const record = question as Record<string, unknown>;
    const parts = Object.values(record)
      .filter((value) => typeof value === "string")
      .map((value) => value as string);
    return parts.join(" ");
  }
  return "";
}

/** Assert prompt surfaces include required contract hooks from the fixture. */
export function assertPromptContract(
  contract: PromptContract,
  questions: Record<string, unknown>,
  systemContract: string,
): void {
  expect(systemContract).toBe(contract.system);

  const question = questions[contract.questionKey];
  expect(question).toBeDefined();

  const promptText = collectQuestionText(question);

  if (contract.missingFactHook) {
    expect(promptText.toLowerCase()).toContain(contract.missingFactHook.toLowerCase());
  }

  for (const forbidden of contract.mustNotContain ?? []) {
    expect(promptText.toLowerCase()).not.toContain(forbidden.toLowerCase());
  }

  if (contract.lockedOptions) {
    const criteria = (question as { criteria?: Record<string, string> }).criteria;
    expect(criteria).toBeDefined();
    expect(Object.keys(criteria!)).toEqual(contract.lockedOptions);
    expect(criteria).not.toHaveProperty("other");
  }

  if (contract.bandAnchors?.touchesAuth) {
    expect(promptText).toMatch(/0\.7.*0\.9|touches auth/i);
  }
}
