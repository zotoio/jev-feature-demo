import { useState } from "react";
import { createUiClient } from "../lib/client.js";
import { evaluateAnswerGates } from "../lib/gate-display.js";
import {
  createEmptyQuestion,
  defaultPlaygroundConfig,
  runPlayground,
  type PlaygroundConfig,
  type PlaygroundQuestion,
} from "../lib/playground.js";
import { useSession } from "../session/SessionContext.js";
import { GateOutcomeCard } from "./GateOutcomeCard.js";
import { PromoteAction } from "./PromoteAction.js";
import { ResultSummary } from "./ResultSummary.js";
import { RawJson } from "./RawJson.js";

export function PlaygroundPanel() {
  const session = useSession();
  const [config, setConfig] = useState<PlaygroundConfig>(defaultPlaygroundConfig);
  const [fixtureId, setFixtureId] = useState("noul-simple");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateQuestion(id: string, patch: Partial<PlaygroundQuestion>) {
    setConfig((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    }));
  }

  function addQuestion() {
    const next = createEmptyQuestion();
    next.key = `question${config.questions.length + 1}`;
    setConfig((prev) => ({ ...prev, questions: [...prev.questions, next] }));
  }

  function removeQuestion(id: string) {
    setConfig((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  }

  async function handleRun() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const client = createUiClient({
        apiKey: session.apiKey,
        fixtureMode: session.fixtureMode,
        fixtureId,
        defaultModel: session.resolvedModelId,
      });

      const response = await runPlayground(client, config, session.resolvedModelId);
      setResult(response as Record<string, unknown>);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const gateResults = result?.answers
    ? evaluateAnswerGates(result.answers as Record<string, unknown>)
    : [];
  const primaryGate = gateResults[0]?.decision.outcome ?? "abstain";

  return (
    <div className="panel">
      <header className="panel-header">
        <h2>Playground</h2>
        <p>Build Noul / Choice / Score questions, edit state, run System One, inspect gates.</p>
      </header>

      <section className="card">
        <h3>State</h3>
        <label htmlFor="state-shape">State shape</label>
        <select
          id="state-shape"
          value={config.stateShape}
          onChange={(e) =>
            setConfig((prev) => ({
              ...prev,
              stateShape: e.target.value as PlaygroundConfig["stateShape"],
            }))
          }
        >
          <option value="string">String</option>
          <option value="json">JSON object</option>
          <option value="text-array">Text array (one line per message)</option>
        </select>

        {config.stateShape === "string" && (
          <label htmlFor="state-text">
            State text
            <textarea
              id="state-text"
              rows={4}
              value={config.stateText}
              onChange={(e) => setConfig((prev) => ({ ...prev, stateText: e.target.value }))}
            />
          </label>
        )}

        {config.stateShape === "json" && (
          <label htmlFor="state-json">
            State JSON
            <textarea
              id="state-json"
              rows={8}
              value={config.stateJson}
              onChange={(e) => setConfig((prev) => ({ ...prev, stateJson: e.target.value }))}
            />
          </label>
        )}

        {config.stateShape === "text-array" && (
          <label htmlFor="state-array">
            Messages (one per line)
            <textarea
              id="state-array"
              rows={4}
              value={config.stateArray}
              onChange={(e) => setConfig((prev) => ({ ...prev, stateArray: e.target.value }))}
            />
          </label>
        )}
      </section>

      <section className="card">
        <div className="section-header">
          <h3>Questions</h3>
          <button type="button" onClick={addQuestion}>Add question</button>
        </div>

        {config.questions.map((question, index) => (
          <fieldset key={question.id} className="question-fieldset">
            <legend>Question {index + 1}</legend>
            <div className="grid-2">
              <label>
                Key
                <input
                  value={question.key}
                  onChange={(e) => updateQuestion(question.id, { key: e.target.value })}
                />
              </label>
              <label>
                Type
                <select
                  value={question.type}
                  onChange={(e) =>
                    updateQuestion(question.id, {
                      type: e.target.value as PlaygroundQuestion["type"],
                    })
                  }
                >
                  <option value="noul">Noul</option>
                  <option value="choice">Choice</option>
                  <option value="score">Score</option>
                </select>
              </label>
            </div>

            <label>
              Prompt
              <input
                value={question.prompt}
                onChange={(e) => updateQuestion(question.id, { prompt: e.target.value })}
              />
            </label>

            {question.type === "noul" && (
              <>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={question.useNoulCriteria}
                    onChange={(e) =>
                      updateQuestion(question.id, { useNoulCriteria: e.target.checked })
                    }
                  />
                  Use true/false criteria rubric
                </label>
                {question.useNoulCriteria && (
                  <div className="grid-2">
                    <label>
                      True criteria
                      <input
                        value={question.noulTrueCriteria}
                        onChange={(e) =>
                          updateQuestion(question.id, { noulTrueCriteria: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      False criteria
                      <input
                        value={question.noulFalseCriteria}
                        onChange={(e) =>
                          updateQuestion(question.id, { noulFalseCriteria: e.target.value })
                        }
                      />
                    </label>
                  </div>
                )}
              </>
            )}

            {question.type === "choice" && (
              <div className="choice-options">
                <p>Options</p>
                {question.choiceOptions.map((opt, optIndex) => (
                  <div key={optIndex} className="grid-2">
                    <input
                      placeholder="key"
                      value={opt.key}
                      onChange={(e) => {
                        const next = [...question.choiceOptions];
                        next[optIndex] = { ...opt, key: e.target.value };
                        updateQuestion(question.id, { choiceOptions: next });
                      }}
                    />
                    <input
                      placeholder="label"
                      value={opt.label}
                      onChange={(e) => {
                        const next = [...question.choiceOptions];
                        next[optIndex] = { ...opt, label: e.target.value };
                        updateQuestion(question.id, { choiceOptions: next });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {question.type === "score" && (
              <label>
                Score levels (comma-separated)
                <input
                  value={question.scoreLevels.join(", ")}
                  onChange={(e) =>
                    updateQuestion(question.id, {
                      scoreLevels: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                />
              </label>
            )}

            {config.questions.length > 1 && (
              <button type="button" className="danger" onClick={() => removeQuestion(question.id)}>
                Remove
              </button>
            )}
          </fieldset>
        ))}
      </section>

      {session.fixtureMode && (
        <section className="card">
          <label htmlFor="playground-fixture">Fixture response (offline)</label>
          <select
            id="playground-fixture"
            value={fixtureId}
            onChange={(e) => setFixtureId(e.target.value)}
          >
            <option value="noul-simple">Noul simple</option>
            <option value="choice-with-other">Choice with other</option>
            <option value="score-frustration">Score frustration</option>
            <option value="batch">Batch</option>
            <option value="speculative-fanout">Speculative fan-out</option>
          </select>
        </section>
      )}

      <div className="row">
        <button type="button" className="primary" onClick={handleRun} disabled={loading}>
          {loading ? "Running…" : "Run System One"}
        </button>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      {result && (
        <>
          <ResultSummary result={result} />
          <GateOutcomeCard results={gateResults} />
          <PromoteAction
            outcome={primaryGate}
            actionLabel="execute proposed handler"
            description="In a real app, only promote when gate returns act. This demo never auto-executes refunds, routing, or notifications."
          />
          <RawJson title="Request payload preview" value={{ state: config.stateShape, questions: config.questions.map((q) => ({ key: q.key, type: q.type })) }} />
        </>
      )}
    </div>
  );
}
