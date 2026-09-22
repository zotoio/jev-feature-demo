import { choice, noul, score } from "@typesafe-ai/sdk";
import type { EntryType, Questions, TypeSafeClient } from "@typesafe-ai/sdk";

export type QuestionType = "noul" | "choice" | "score";
export type StateShape = "string" | "json" | "text-array";

export interface PlaygroundQuestion {
  id: string;
  key: string;
  type: QuestionType;
  prompt: string;
  choiceOptions: Array<{ key: string; label: string }>;
  scoreLevels: string[];
  noulTrueCriteria: string;
  noulFalseCriteria: string;
  useNoulCriteria: boolean;
}

export interface PlaygroundConfig {
  stateShape: StateShape;
  stateText: string;
  stateJson: string;
  stateArray: string;
  questions: PlaygroundQuestion[];
}

export function createEmptyQuestion(): PlaygroundQuestion {
  return {
    id: crypto.randomUUID(),
    key: "question1",
    type: "noul",
    prompt: "Is the customer asking for a refund?",
    choiceOptions: [
      { key: "billing", label: "Billing issue" },
      { key: "technical", label: "Technical issue" },
      { key: "other", label: "Other" },
    ],
    scoreLevels: ["Calm", "Frustrated", "Very angry"],
    noulTrueCriteria: "",
    noulFalseCriteria: "",
    useNoulCriteria: false,
  };
}

export function parseState(config: PlaygroundConfig): unknown {
  switch (config.stateShape) {
    case "string":
      return config.stateText;
    case "json":
      return JSON.parse(config.stateJson) as unknown;
    case "text-array":
      return config.stateArray
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
  }
}

export function buildQuestionsFromConfig(questions: PlaygroundQuestion[]): Questions {
  const built: Record<string, unknown> = {};

  for (const q of questions) {
    const key = q.key.trim();
    if (!key) continue;

    if (q.type === "noul") {
      built[key] = q.useNoulCriteria
        ? noul(q.prompt, {
            true: q.noulTrueCriteria || "Yes",
            false: q.noulFalseCriteria || "No",
          })
        : noul(q.prompt);
      continue;
    }

    if (q.type === "choice") {
      const options = Object.fromEntries(
        q.choiceOptions
          .filter((o) => o.key.trim())
          .map((o) => [o.key.trim(), o.label || o.key.trim()]),
      );
      built[key] = choice(q.prompt, options);
      continue;
    }

    const levels = q.scoreLevels.map((l) => l.trim()).filter(Boolean);
    const scoreLevels = (levels.length >= 2 ? levels : ["Low", "Medium", "High"]) as [
      string,
      string,
      ...string[],
    ];
    built[key] = score(q.prompt, scoreLevels);
  }

  return built as Questions;
}

export async function runPlayground(
  client: TypeSafeClient,
  config: PlaygroundConfig,
  model?: string,
) {
  const state = parseState(config);
  const questions = buildQuestionsFromConfig(config.questions);

  const request = {
    state: state as EntryType,
    questions,
    ...(model ? { model } : {}),
  };

  return client.systemOne(request);
}

export function defaultPlaygroundConfig(): PlaygroundConfig {
  return {
    stateShape: "string",
    stateText: "I was charged twice for my subscription. Please refund one charge today.",
    stateJson: JSON.stringify(
      {
        subject: "Double charge",
        body: "I was charged twice for my subscription. Please refund one charge today.",
        customerTier: "pro",
      },
      null,
      2,
    ),
    stateArray: "Customer: I was charged twice.\nAgent: I can help with billing.",
    questions: [createEmptyQuestion()],
  };
}
