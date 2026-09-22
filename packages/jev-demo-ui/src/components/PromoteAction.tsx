import { useState } from "react";
import type { GateOutcome } from "@zotoio/jev-demo";
import { gateOutcomeLabel } from "../lib/gate-display.js";

interface PromoteActionProps {
  outcome: GateOutcome;
  actionLabel: string;
  description: string;
}

export function PromoteAction({ outcome, actionLabel, description }: PromoteActionProps) {
  const [promoted, setPromoted] = useState(false);
  const [simulatedAt, setSimulatedAt] = useState<string | null>(null);

  const canPromote = outcome === "act";

  function handlePromote() {
    setPromoted(true);
    setSimulatedAt(new Date().toLocaleTimeString());
  }

  return (
    <section className="card promote-card" aria-label="Promote action">
      <h3>Side-effect boundary</h3>
      <p className="hint">
        Gate outcome: <strong>{gateOutcomeLabel(outcome)}</strong>. Application code must explicitly
        promote before any side effect runs.
      </p>
      <p>{description}</p>
      <button
        type="button"
        className="primary"
        disabled={!canPromote || promoted}
        onClick={handlePromote}
        aria-describedby="promote-help"
      >
        {promoted ? "Action simulated" : `Simulate promote: ${actionLabel}`}
      </button>
      <p id="promote-help" className="hint">
        {canPromote
          ? "Click to simulate what your app would do after promoting this proposal."
          : "Promotion blocked — gate did not return act. Escalate or deny instead."}
      </p>
      {promoted && simulatedAt && (
        <p className="success" role="status">
          Simulated &ldquo;{actionLabel}&rdquo; at {simulatedAt} (no real side effect executed).
        </p>
      )}
    </section>
  );
}
