import { gateOutcomeClass, gateOutcomeLabel, type AnswerGateResult } from "../lib/gate-display.js";

interface GateOutcomeCardProps {
  results: AnswerGateResult[];
}

export function GateOutcomeCard({ results }: GateOutcomeCardProps) {
  if (!results.length) return null;

  return (
    <section className="card gate-card" aria-label="Gate outcomes">
      <h3>Gate decisions</h3>
      <p className="hint">Jev proposes — your code promotes. No side effects run automatically.</p>
      <ul className="gate-list">
        {results.map((result) => (
          <li key={result.key} className={`gate-item ${gateOutcomeClass(result.decision.outcome)}`}>
            <div className="gate-item-header">
              <strong>{result.key}</strong>
              <span className="gate-type">{result.type}</span>
            </div>
            <p>{result.summary}</p>
            <p className="gate-outcome-badge" aria-label={`Gate outcome for ${result.key}`}>
              {gateOutcomeLabel(result.decision.outcome)}
            </p>
            <p className="gate-confidence">Confidence: {result.confidence.toFixed(2)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
