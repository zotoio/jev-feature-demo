import { RawJson } from "./RawJson.js";

interface HardFailExplorerProps {
  panels: {
    proposal: Record<string, unknown>;
    gate: Record<string, unknown>;
    promptContract: Record<string, unknown>;
  };
}

export function HardFailExplorer({ panels }: HardFailExplorerProps) {
  return (
    <section className="explorer-triple" aria-label="Hard-fail explorer panels">
      <div className="explorer-panel">
        <h4>Proposal</h4>
        <p className="hint">Typed answer from fixture — Jev proposes only.</p>
        <RawJson title="Proposal" value={panels.proposal} defaultOpen />
      </div>
      <div className="explorer-panel">
        <h4>Gate</h4>
        <p className="hint">Application-owned outcome — no auto side-effects on act.</p>
        <RawJson title="Gate" value={panels.gate} defaultOpen />
      </div>
      <div className="explorer-panel">
        <h4>Prompt contract</h4>
        <p className="hint">Propose-only hooks beside the golden response.</p>
        <RawJson title="Prompt contract" value={panels.promptContract} defaultOpen />
      </div>
    </section>
  );
}
