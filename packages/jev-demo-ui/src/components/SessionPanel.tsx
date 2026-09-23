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
    setKeyInput(session.sessionKey ?? "");
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
      const message = error instanceof Error ? error.message : "Connection check failed";
      const corsHint =
        session.isLive && session.liveSource === "session" && !session.devProxyAvailable
          ? " If this looks like a CORS or network block, the Typesafe API may not allow browser calls from this origin — try local dev with `pnpm ui` instead."
          : "";
      setStatusMessage(`${message}${corsHint}`);
    }
  }

  function handleSaveKey() {
    session.setSessionKey(keyInput);
  }

  const isStaticSite = session.serverConfigLoaded && !session.devProxyAvailable;

  return (
    <div className="panel">
      <header className="panel-header">
        <h2>Session</h2>
        <p>
          <strong>Fixture mode is the default.</strong> Paste your Typesafe API key below to enable
          live mode for this tab only. The key stays in React memory only — cleared on refresh or
          when you clear session; never <code>localStorage</code>, <code>sessionStorage</code>, disk,
          or <code>.env</code>.
        </p>
      </header>

      <section className="card info-card">
        <h3>API key resolution order</h3>
        <ol>
          <li>
            <strong>Fixture / demo mode</strong> (default — offline golden responses)
          </li>
          <li>
            <strong>Session key paste</strong> (this tab — calls{" "}
            <code>https://api.typesafe.ai</code> directly)
          </li>
          {session.devProxyAvailable && (
            <li>
              <strong>Server <code>.env</code></strong> via localhost proxy — only when opted in
              below
              {session.serverConfigLoaded ? (
                session.serverKeyConfigured ? " (configured)" : " (not configured)"
              ) : (
                " (checking…)"
              )}
            </li>
          )}
        </ol>
        {isStaticSite && (
          <p className="hint">
            This is a static GitHub Pages build — there is no dev-server proxy. Paste a session key
            for live mode, or stay in fixture mode.
          </p>
        )}
      </section>

      <section className="card">
        <h3>Session key (optional)</h3>
        <p className="hint">
          Paste a key from the{" "}
          <a href="https://console.typesafe.ai/settings/keys" target="_blank" rel="noreferrer">
            TypeSafe Console
          </a>
          . Stored in React memory only — cleared on refresh or when you click Clear session. Never
          written to browser storage, disk, or <code>.env</code>.
        </p>
        <label htmlFor="api-key">TypeSafe API key</label>
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
            Apply key
          </button>
        </div>

        {session.hasSessionOverride && (
          <p className="hint">
            Active key: {maskApiKey(session.sessionKey!)} — stored in React memory only (lost on
            refresh).
          </p>
        )}

        <div className="row">
          <button type="button" className="danger" onClick={session.clearSession}>
            Clear session
          </button>
        </div>
        <p className="hint">Clear session wipes the pasted key from memory.</p>
      </section>

      <section className="card">
        <h3>Connection</h3>
        {session.devProxyAvailable && (
          <>
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
                No <code>TYPESAFE_API_KEY</code> in server <code>.env</code> — add one locally or
                paste a session key above.
              </p>
            )}
          </>
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

        {isStaticSite && (
          <p className="hint">
            <strong>Browser / CORS note:</strong> Live mode on GitHub Pages calls{" "}
            <code>https://api.typesafe.ai</code> directly from your browser. If Typesafe does not
            allow cross-origin requests from <code>zotoio.github.io</code>, connection tests will
            fail with a network or CORS error — fixture mode still works offline.
          </p>
        )}
      </section>

      <section className="card info-card">
        <h3>Security model</h3>
        <ul>
          <li>Fixture mode is default — no key required to explore the demo.</li>
          <li>
            Session keys live in React memory only — not persisted to browser storage or disk.
          </li>
          <li>
            Never <code>sessionStorage</code>, <code>localStorage</code>, or written to{" "}
            <code>.env</code>; never logged.
          </li>
          <li>No <code>VITE_</code> prefix — keys are never baked into the static build.</li>
          {session.devProxyAvailable && (
            <li>
              Local dev only: copy <code>.env.example</code> to <code>.env</code> with{" "}
              <code>TYPESAFE_API_KEY</code> — read only by the Vite dev-server proxy when opted in.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
