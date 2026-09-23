import { useEffect, useState } from "react";
import { JEV_LATEST, JEV_PINNED } from "@zotoio/jev-demo";
import { createUiClient, describeConnection } from "../lib/client.js";
import { maskApiKey } from "../session/session-storage.js";
import { useSession } from "../session/SessionContext.js";
import { useUiClientOptions } from "../session/useUiClientOptions.js";

export function SessionPanel() {
  const session = useSession();
  const clientOptions = useUiClientOptions("models-list");
  const [keyInput, setKeyInput] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "checking" | "ok" | "error">(
    "idle",
  );
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (session.sessionKey) setKeyInput(session.sessionKey);
  }, [session.sessionKey]);

  async function checkConnection() {
    setConnectionStatus("checking");
    setStatusMessage("");

    try {
      const client = createUiClient(clientOptions);
      const models = await client.models.list();
      const mode = describeConnection(clientOptions);

      setConnectionStatus("ok");
      setStatusMessage(
        session.isLive
          ? `${mode} — ${models.models.length} models available`
          : `Fixture mode — ${models.models.length} models from golden fixture`,
      );
    } catch (error) {
      setConnectionStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Connection check failed");
    }
  }

  function handleSaveKey() {
    session.setSessionKey(keyInput);
  }

  return (
    <div className="panel">
      <header className="panel-header">
        <h2>Session</h2>
        <p>
          Fixture mode is the default. Live API calls require a session key paste or an explicit
          opt-in to use the dev-server <code>.env</code> proxy.
        </p>
      </header>

      <section className="card info-card">
        <h3>API key resolution order</h3>
        <ol>
          <li>
            <strong>Fixture / demo mode</strong> (default — offline golden responses)
          </li>
          <li>
            <strong>Session override</strong> (optional paste below — this tab only)
          </li>
          <li>
            <strong>Server <code>.env</code></strong> via localhost proxy — only when opted in below
            {session.serverConfigLoaded ? (
              session.serverKeyConfigured ? " (configured)" : " (not configured)"
            ) : (
              " (checking…)"
            )}
          </li>
        </ol>
      </section>

      <section className="card">
        <h3>Session override (optional)</h3>
        <p className="hint">
          Temporary key for this browser tab. Never written to <code>.env</code> or any file.
        </p>
        <label htmlFor="api-key">TypeSafe API key override</label>
        <div className="row">
          <input
            id="api-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="sk-… (optional — enables live mode for this tab)"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
          <button type="button" className="primary" onClick={handleSaveKey}>
            Save override
          </button>
        </div>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={session.persistKeyInTab}
            onChange={(e) => session.setPersistKeyInTab(e.target.checked)}
          />
          Keep override for this browser tab (sessionStorage only — cleared when tab closes)
        </label>

        {session.hasSessionOverride && (
          <p className="hint">
            Active override: {maskApiKey(session.sessionKey!)} — stored in memory
            {session.persistKeyInTab ? " + sessionStorage" : " only"}.
          </p>
        )}

        <div className="row">
          <button type="button" className="danger" onClick={session.clearSession}>
            Clear session override
          </button>
        </div>
        <p className="hint">
          Clear session wipes the tab override only. It does not change your gitignored{" "}
          <code>.env</code>.
        </p>
      </section>

      <section className="card">
        <h3>Connection</h3>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={session.useServerEnv}
            onChange={(e) => session.setUseServerEnv(e.target.checked)}
            disabled={!session.serverKeyConfigured}
          />
          Use server <code>.env</code> via dev-server proxy (opt-in — default off)
        </label>
        {!session.serverKeyConfigured && session.serverConfigLoaded && (
          <p className="hint">
            No <code>TYPESAFE_API_KEY</code> in server <code>.env</code> — add one locally or paste a
            session override above.
          </p>
        )}

        <label className="checkbox">
          <input
            type="checkbox"
            checked={session.fixtureModeForced}
            onChange={(e) => session.setFixtureModeForced(e.target.checked)}
          />
          Force fixture mode (offline golden responses — ignores all keys)
        </label>

        <p className="status-line">
          Mode: <strong>{describeConnection(clientOptions)}</strong>
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
          <li>
            Fixture mode is default — presence of server <code>.env</code> does not auto-enable live
            mode. Opt in via the checkbox above or paste a session key.
          </li>
          <li>
            Optional local dev: copy <code>.env.example</code> to <code>.env</code> with{" "}
            <code>TYPESAFE_API_KEY</code> — read only by the Vite dev server proxy when opted in.
          </li>
          <li>No <code>VITE_</code> prefix — the key is never baked into the client bundle.</li>
          <li>Session override: React memory + optional sessionStorage (tab lifetime only).</li>
          <li>Never <code>localStorage</code>, never written to <code>.env</code>, never logged.</li>
          <li>This UI is for localhost exploration — do not deploy with user key entry.</li>
        </ul>
      </section>
    </div>
  );
}
