import { describe, expect, it } from "vitest";
import { createTypeSafeClient } from "../lib/client/typesafe-client.js";
import { triageSupportTicket } from "../demos/support-ticket-triage.js";
import { createFixtureFetch, systemOneRoute } from "../testing/fixtures.js";

describe("Support ticket triage CLI", () => {
  it("prints Decision outcome from confidence gates", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([
        systemOneRoute("systemone/speculative-fanout-billing.json"),
      ]),
    });

    const output = await triageSupportTicket({
      ticket: "Double charge — refund please",
      client,
    });

    expect(output).toContain("Decision:");
    expect(output).toContain("billing");
    expect(output).toMatch(/ACT|ASK_HUMAN|DENY|ABSTAIN/);
    expect(output).toContain("input=620");
  });

  it("supports JSON output mode", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([
        systemOneRoute("systemone/speculative-fanout-billing.json"),
      ]),
    });

    const json = await triageSupportTicket({
      ticket: "Refund",
      client,
      json: true,
    });

    const parsed = JSON.parse(json);
    expect(parsed.categoryGate).toBeDefined();
    expect(parsed.handler).toBe("billing");
  });
});
