import { describe, expect, it } from "vitest";
import { createUiClient } from "../src/lib/client.js";
import { HARD_FAIL_EXPLORERS } from "../src/lib/hard-fail-explorers.js";

describe("hard-fail explorers", () => {
  const clientOptions = {
    sessionKey: null,
    fixtureModeForced: false,
    devProxyAvailable: false,
    useServerEnv: false,
    serverKeyConfigured: true,
  };

  it("defines three fixture-backed explorers", () => {
    expect(HARD_FAIL_EXPLORERS).toHaveLength(3);
    expect(HARD_FAIL_EXPLORERS.map((item) => item.id)).toEqual([
      "explorer-noul-blast-radius",
      "explorer-choice-smoke-fail",
      "explorer-score-auth-band",
    ]);
  });

  it("noul explorer blocks act when blastRadius is missing", async () => {
    const explorer = HARD_FAIL_EXPLORERS[0];
    const client = createUiClient({ ...clientOptions, fixtureId: explorer.fixtureId });
    const panels = await explorer.run(client);

    expect(panels.proposal.missingFacts).toContain("blastRadius");
    expect(panels.gate.outcome).not.toBe("act");
    expect(panels.promptContract.proposeOnly).toBe(true);
    expect(panels.promptContract.missingFactHook).toBe("blast-radius");
  });

  it("choice explorer rolls back to rollback on smoke fail", async () => {
    const explorer = HARD_FAIL_EXPLORERS[1];
    const client = createUiClient({ ...clientOptions, fixtureId: explorer.fixtureId });
    const panels = await explorer.run(client);

    expect(panels.proposal.proposedChoice).toBe("full");
    expect(panels.gate.promotedChoice).toBe("rollback");
    expect(panels.gate.rolledBack).toBe(true);
    expect(panels.promptContract.lockedOptions).toEqual(["canary", "full", "rollback"]);
  });

  it("score explorer caps banded outcome at ask_human", async () => {
    const explorer = HARD_FAIL_EXPLORERS[2];
    const client = createUiClient({ ...clientOptions, fixtureId: explorer.fixtureId });
    const panels = await explorer.run(client);

    expect(panels.gate.confidenceOnlyOutcome).toBe("act");
    expect(panels.gate.outcome).toBe("ask_human");
    expect(panels.promptContract.bandAnchors).toEqual({
      touchesAuth: { min: 0.7, max: 0.9 },
    });
  });
});
