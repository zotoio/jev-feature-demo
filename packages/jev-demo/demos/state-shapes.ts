import { noul } from "@typesafe-ai/sdk";
import type { TypeSafeClient } from "@typesafe-ai/sdk";

/** Demonstrate all three documented state shapes against the same question. */
export async function demoStateAsString(client: TypeSafeClient, text: string) {
  return client.systemOne({
    state: text,
    questions: { billing: noul("Is this about billing?") },
  });
}

export async function demoStateAsObject(
  client: TypeSafeClient,
  ticket: { subject: string; body: string; customerTier: string },
) {
  return client.systemOne({
    state: ticket,
    questions: { billing: noul("Is this about billing?") },
  });
}

export async function demoStateAsTextArray(client: TypeSafeClient, messages: string[]) {
  return client.systemOne({
    state: messages,
    questions: { billing: noul("Is this about billing?") },
  });
}

export async function demoStructuredInstructions(client: TypeSafeClient) {
  return client.systemOne({
    state: {
      resume: "Jane Doe, 8 years at Acme Corp, based in Seattle.",
      duplicateHint: { name: "Jane Doe", employer: "Acme Corp", city: "Seattle" },
    },
    questions: {
      samePerson: noul(
        {
          question: "Is the resume for the same person as `duplicateHint`?",
          duplicateHint: {
            name: "Jane Doe",
            employer: "Acme Corp",
            city: "Seattle",
          },
        },
        {
          true: "Same individual",
          false: "Different people",
        },
      ),
    },
  });
}
