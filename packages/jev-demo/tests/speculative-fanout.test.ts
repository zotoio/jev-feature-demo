import { describe, expect, it } from "vitest";
import { createTypeSafeClient } from "../lib/client/typesafe-client.js";
import {
  routeSpeculativeFanOut,
  runSpeculativeFanOut,
} from "../demos/speculative-fanout.js";
import { createFixtureFetch, loadFixture, systemOneRoute } from "../testing/fixtures.js";

describe("Speculative fan-out", () => {
  it("asks the full decision tree in one request and branches in code", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([
        systemOneRoute("systemone/speculative-fanout-billing.json"),
      ]),
    });

    const { response, action } = await runSpeculativeFanOut(
      client,
      "URGENT: charged twice — refund one charge today!",
    );

    expect(Object.keys(response.answers)).toHaveLength(5);
    expect(action.handler).toBe("billing");
    expect(action.priority).toBe("high");
    expect(action.notes.some((n: string) => n.includes("refund"))).toBe(true);
    // Bug-specific answers exist but are ignored for billing tickets
    expect(response.answers.bugSeverity.score).toBeLessThan(1);
  });

  it("routes purely from fixture without a network call", () => {
    const fixture = loadFixture<Parameters<typeof routeSpeculativeFanOut>[0]>(
      "systemone/speculative-fanout-billing.json",
    );
    const action = routeSpeculativeFanOut(fixture);
    expect(action.gates.category.proposal.choice).toBe("billing");
  });
});
