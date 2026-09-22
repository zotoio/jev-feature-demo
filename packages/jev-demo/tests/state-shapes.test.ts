import { describe, expect, it } from "vitest";
import { createTypeSafeClient } from "../lib/client/typesafe-client.js";
import {
  demoStateAsObject,
  demoStateAsString,
  demoStateAsTextArray,
  demoStructuredInstructions,
} from "../demos/state-shapes.js";
import { createFixtureFetch, systemOneRoute } from "../testing/fixtures.js";

describe("State shapes", () => {
  it("accepts string state", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([systemOneRoute("systemone/state-string.json")]),
    });
    const response = await demoStateAsString(client, "Double charge on my invoice.");
    expect(response.answers.billing.noul).toBeGreaterThan(0.5);
  });

  it("accepts JSON object state", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([systemOneRoute("systemone/state-object.json")]),
    });
    const response = await demoStateAsObject(client, {
      subject: "Billing issue",
      body: "Charged twice this month.",
      customerTier: "pro",
    });
    expect(response.answers.billing.type).toBe("noul");
  });

  it("accepts text array state", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([systemOneRoute("systemone/state-array.json")]),
    });
    const response = await demoStateAsTextArray(client, [
      "Customer: My refund is late.",
      "Agent: Escalating to billing.",
    ]);
    expect(response.answers.billing.noul).toBe(0.85);
  });

  it("supports structured instructions with criteria", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([systemOneRoute("systemone/structured-instructions.json")]),
    });
    const response = await demoStructuredInstructions(client);
    expect(response.answers.samePerson.noul).toBe(0.97);
  });
});
