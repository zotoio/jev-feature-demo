import { useState } from "react";
import { createUiClient } from "../lib/client.js";
import { evaluateAnswerGates } from "../lib/gate-display.js";
import type { HardFailExplorerPanels } from "../lib/hard-fail-explorers.js";
import { SCENARIOS, scenarioFixturePreview, type ScenarioDefinition } from "../lib/scenarios.js";
import { useUiClientOptions } from "../session/useUiClientOptions.js";
import { GateOutcomeCard } from "./GateOutcomeCard.js";
import { HardFailExplorer } from "./HardFailExplorer.js";
import { PromoteAction } from "./PromoteAction.js";
import { RawJson } from "./RawJson.js";

export function ScenariosPanel() {
  const clientOptions = useUiClientOptions(SCENARIOS[0].fixtureId);
  const [selectedId, setSelectedId] = useState(SCENARIOS[0].id);
  const [output, setOutput] = useState<unknown>(null);
  const [explorerPanels, setExplorerPanels] = useState<HardFailExplorerPanels | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === selectedId) ?? SCENARIOS[0];

  async function runScenario(target: ScenarioDefinition) {
    setLoading(true);
    setError(null);
    setOutput(null);
    setExplorerPanels(null);

    try {
      const client = createUiClient({
        ...clientOptions,
        fixtureId: target.fixtureId,
      });

      const result = await target.run(client);
      if (target.isExplorer) {
        setExplorerPanels(result as HardFailExplorerPanels);
      } else {
        setOutput(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scenario failed");
    } finally {
      setLoading(false);
    }
  }

  const responseAnswers =
    output && typeof output === "object" && "response" in (output as object)
      ? ((output as { response: { answers?: Record<string, unknown> } }).response.answers ?? null)
      : output && typeof output === "object" && "answers" in (output as object)
        ? ((output as { answers: Record<string, unknown> }).answers ?? null)
        : null;

  const gateResults = responseAnswers ? evaluateAnswerGates(responseAnswers) : [];
  const primaryGate = gateResults[0]?.decision.outcome ?? "ask_human";

  return (
    <div className="panel">
      <header className="panel-header">
        <h2>Scenarios</h2>
        <p>
          Hard-fail explorers (proposal | gate | prompt contract) plus one-click goldens and triage
          demos — all fixture-backed by default.
        </p>
      </header>

      <div className="scenario-layout">
        <nav className="scenario-nav" aria-label="Scenarios">
          {SCENARIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === selectedId ? "active" : ""}
              aria-current={item.id === selectedId ? "true" : undefined}
              onClick={() => setSelectedId(item.id)}
            >
              <span className="scenario-label">{item.label}</span>
              <span className="scenario-category">{item.category}</span>
            </button>
          ))}
        </nav>

        <div className="scenario-detail">
          <section className="card">
            <h3>{scenario.label}</h3>
            <p>{scenario.description}</p>

            {scenario.sampleState && (
              <p><strong>Sample state:</strong> {scenario.sampleState}</p>
            )}

            {scenario.promptContract && (
              <p><strong>Prompt contract:</strong> <code>{scenario.promptContract}</code></p>
            )}

            {scenario.hardFailChecks && (
              <div>
                <strong>Hard-fail checks (CI goldens):</strong>
                <ul>
                  {scenario.hardFailChecks.map((check) => (
                    <li key={check}>{check}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              className="primary"
              onClick={() => runScenario(scenario)}
              disabled={loading}
            >
              {loading ? "Running…" : "Run scenario"}
            </button>
          </section>

          <RawJson
            title="Fixture prompt contract (golden response)"
            value={scenarioFixturePreview(scenario.fixtureId)}
          />

          {error && <p className="error" role="alert">{error}</p>}

          {explorerPanels != null ? (
            <HardFailExplorer panels={explorerPanels} />
          ) : null}

          {output != null ? (
            <>
              <RawJson title="Scenario output" value={output} defaultOpen />
              {gateResults.length > 0 && <GateOutcomeCard results={gateResults} />}
              {scenario.category === "triage" && (
                <PromoteAction
                  outcome={primaryGate}
                  actionLabel="route ticket to handler"
                  description="Triage proposes handler and priority — promotion required before CRM updates or refunds."
                />
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
