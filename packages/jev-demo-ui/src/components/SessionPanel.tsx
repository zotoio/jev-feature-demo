import { useEffect, useState } from "react";
import { JEV_LATEST, JEV_PINNED } from "@zotoio/jev-demo";
import { createUiClient, describeConnection } from "../lib/client.js";
import { maskApiKey } from "../session/session-storage.js";
import { useSession } from "../session/SessionContext.js";

export function SessionPanel() {
  const session = useSession();
  const [keyInput, setKeyInput] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "checking" | "ok" | "error">(
    "idle",
  );
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (session.apiKey) setKeyInput(session.apiKey);
  }, [session.apiKey]);

  async function checkConnection() {
    setConnectionStatus("checking");
    setStatusMessage("");

    try {
      const client = createUiClient({
        apiKey: session.apiKey,
        fixtureMode: session.fixtureMode,
        fixtureId: "models-list",
        defaultModel: session.resolvedModelId,
      });

      const models = await client.models.list();
      const mode = describeConnection({
        apiKey: session.apiKey,
        fixtureMode: session.fixtureMode,
        fixtureId: "models-list",
      });

      setConnectionStatus("ok");
      setStatusMessage(
        mode === "live"
          ? `Live — ${models.models.length} models available`
          : `Fixture mode — ${models.models.length} models from golden fixture`,
      );
    } catch (error) {
      setConnectionStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Connection check failed");
    }
  }

  function handleSaveKey() {
    session.setApiKey(keyInput);
  }

  return (
    <div className="panel">
      <header className="panel-header">
        <h2>Session</h2>
        <p>API keys stay on your machine (localhost only). Never committed or logged.</p>
      </header>

      <section className="card">
        <h3>API key</h3>
        <label htmlFor="api-key">TypeSafe API key</label>
        <div className="row">
          <input
            id="api-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="sk-… (optional — fixture mode works without a key)"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
          <button type="button" className="primary" onClick={handleSaveKey}>
            Save key
          </button>
        </div>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={session.persistKeyInTab}
            onChange={(e) => session.setPersistKeyInTab(e.target.checked)}
          />
          Keep for this browser tab (sessionStorage only — cleared when tab closes)
        </label>

        {session.hasKey && (
          <p className="hint">
            Active key: {maskApiKey(session.apiKey!)} — stored in memory
            {session.persistKeyInTab ? " + sessionStorage" : " only"}.
          </p>
        )}

        <div className="row">
          <button type="button" className="danger" onClick={session.clearSession}>
            Clear key / lock session
          </button>
        </div>
      </section>

      <section className="card">
        <h3>Connection</h3>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={session.fixtureMode}
            onChange={(e) => session.setFixtureMode(e.target.checked)}
          />
          Fixture mode (offline golden responses — works with zero API key)
        </label>

        <p className="status-line">
          Mode:{" "}
          <strong>{session.isLive ? "Live API" : "Fixture / demo"}</strong>
          {session.fixtureMode && " — toggle off + save key for live calls"}
        </p>

        <fieldset>
          <legend>Model</legend>
          <label className="radio">
            <input
              type="radio"
              name="model"
              checked={session.model === "jev-latest"}
              onChange={() => session.setModel("jev-latest")}
            />
            {JEV_LATEST} (alias — resolves to current stable)
          </label>
          <label className="radio">
            <input
              type="radio"
              name="model"
              checked={session.model === "jev-pinned"}
              onChange={() => session.setModel("jev-pinned")}
            />
            {JEV_PINNED} (pinned for reproducible thresholds)
          </label>
        </fieldset>

        <div className="row">
          <button type="button" onClick={checkConnection} disabled={connectionStatus === "checking"}>
            {connectionStatus === "checking" ? "Checking…" : "Test connection"}
          </button>
        </div>

        {connectionStatus !== "idle" && (
          <p className={connectionStatus === "error" ? "error" : "success"} role="status">
            {statusMessage}
          </p>
        )}
      </section>

      <section className="card info-card">
        <h3>Security model</h3>
        <ul>
          <li>Keys are held in React memory; optional sessionStorage for tab lifetime only.</li>
          <li>Never localStorage, never written to .env, never in URLs or logs.</li>
          <li>Use Clear key to wipe memory and sessionStorage immediately.</li>
          <li>This UI is for localhost exploration — do not deploy with user key entry.</li>
        </ul>
      </section>
    </div>
  );
}
