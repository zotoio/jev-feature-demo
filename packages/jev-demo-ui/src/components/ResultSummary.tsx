import { formatUsage } from "../lib/gate-display.js";
import { RawJson } from "./RawJson.js";

interface ResultSummaryProps {
  result: Record<string, unknown>;
  title?: string;
}

export function ResultSummary({ result, title = "Response summary" }: ResultSummaryProps) {
  const model = (result as { model?: string }).model;
  const usage = (result as { usage?: { input_tokens: number; output_tokens: number } }).usage;
  const answers = (result as { answers?: Record<string, unknown> }).answers;

  return (
    <section className="card result-summary" aria-label={title}>
      <h3>{title}</h3>
      {model && <p><strong>Model:</strong> {model}</p>}
      {usage && <p><strong>Usage:</strong> {formatUsage(usage)}</p>}
      {answers && (
        <div className="answer-grid">
          {Object.entries(answers).map(([key, value]) => (
            <article key={key} className="answer-card">
              <h4>{key}</h4>
              <dl>
                {Object.entries(value as Record<string, unknown>).map(([field, fieldValue]) => (
                  <div key={field} className="answer-field">
                    <dt>{field}</dt>
                    <dd>
                      {typeof fieldValue === "object" && fieldValue !== null
                        ? JSON.stringify(fieldValue)
                        : String(fieldValue)}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      )}
      <RawJson title="Raw response JSON" value={result} />
    </section>
  );
}
