import { useState } from "react";
import { noul } from "@typesafe-ai/sdk";
import { RawTypeSafeHttpError } from "@zotoio/jev-demo";
import { createUiClient, createUiRawClient, resolveUiAuth } from "../lib/client.js";
import { useSession } from "../session/SessionContext.js";
import { useUiClientOptions } from "../session/useUiClientOptions.js";
import { RawJson } from "./RawJson.js";

type ClientMode = "sdk" | "raw";

export function RawPanel() {
  const session = useSession();
  const [clientMode, setClientMode] = useState<ClientMode>("sdk");
  const [fixtureId, setFixtureId] = useState("noul-simple");
  const clientOptions = useUiClientOptions(fixtureId);
  const [stateText, setStateText] = useState(
    "I was charged twice for my subscription. Please refund one charge today.",
  );
  const [requestPreview, setRequestPreview] = useState<unknown>(null);
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const question = { billing: noul("Is this about billing?") };
  const usesFixtures = resolveUiAuth(clientOptions).mode === "fixture";

  async function handleRun() {
    setLoading(true);
    setError(null);
    setResponse(null);

    const payload = {
      model: session.resolvedModelId,
      state: stateText,
      questions: question,
    };
    setRequestPreview(payload);

    try {
      if (clientMode === "sdk") {
        const client = createUiClient(clientOptions);
        const result = await client.systemOne(payload);
        setResponse(result);
      } else {
        const raw = createUiRawClient(clientOptions);
        const result = await raw.systemOne(payload);
        setResponse(result);
      }
    } catch (err) {
      if (err instanceof RawTypeSafeHttpError) {
        setError(`HTTP ${err.status}: ${err.message}`);
        setResponse({ status: err.status, body: err.body });
      } else {
        setError(err instanceof Error ? err.message : "Request failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleListModels() {
    setLoading(true);
    setError(null);

    const listOptions = { ...clientOptions, fixtureId: "models-list" };

    try {
      if (clientMode === "sdk") {
        const client = createUiClient(listOptions);
        setResponse(await client.models.list());
      } else {
        const raw = createUiRawClient(listOptions);
        setResponse(await raw.listModels());
      }
      setRequestPreview({ method: "GET", path: "/v1/models" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "List models failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <header className="panel-header">
        <h2>Raw / Advanced</h2>
        <p>SDK vs raw HTTP twin parity. Inspect full request and response payloads.</p>
      </header>

      <section className="card">
        <fieldset>
          <legend>Client</legend>
          <label className="radio">
            <input
              type="radio"
              name="client-mode"
              checked={clientMode === "sdk"}
              onChange={() => setClientMode("sdk")}
            />
            Official SDK (TypeSafeClient)
          </label>
          <label className="radio">
            <input
              type="radio"
              name="client-mode"
              checked={clientMode === "raw"}
              onChange={() => setClientMode("raw")}
            />
            Raw HTTP (RawTypeSafeClient)
          </label>
        </fieldset>

        {usesFixtures && (
          <label htmlFor="raw-fixture">
            Fixture
            <select id="raw-fixture" value={fixtureId} onChange={(e) => setFixtureId(e.target.value)}>
              <option value="noul-simple">Noul simple</option>
              <option value="error-401">401 unauthorized</option>
              <option value="error-422">422 validation</option>
              <option value="error-429">429 rate limit</option>
              <option value="models-list">Models list</option>
            </select>
          </label>
        )}

        <label htmlFor="raw-state">
          State
          <textarea
            id="raw-state"
            rows={3}
            value={stateText}
            onChange={(e) => setStateText(e.target.value)}
          />
        </label>

        <div className="row">
          <button type="button" className="primary" onClick={handleRun} disabled={loading}>
            POST /v1/systemone
          </button>
          <button type="button" onClick={handleListModels} disabled={loading}>
            GET /v1/models
          </button>
        </div>
      </section>

      {error && <p className="error" role="alert">{error}</p>}

      {requestPreview != null ? (
        <RawJson title="Request" value={requestPreview} defaultOpen />
      ) : null}
      {response != null ? <RawJson title="Response" value={response} defaultOpen /> : null}
    </div>
  );
}
