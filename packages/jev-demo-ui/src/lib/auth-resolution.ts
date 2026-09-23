import { hasNonEmptyKey } from "../session/session-storage.js";

export type LiveAuthSource = "session" | "server-env";
export type ResolvedMode = "live" | "fixture";

export interface ResolvedAuth {
  mode: ResolvedMode;
  source?: LiveAuthSource;
  sessionKey?: string;
  reason?: "forced" | "no-key";
}

export interface AuthResolutionInput {
  sessionKey?: string | null;
  fixtureModeForced: boolean;
  /** Explicit opt-in to use server .env via dev-server proxy (default off). */
  useServerEnv: boolean;
  serverKeyConfigured: boolean;
  /** False on static GitHub Pages — no Vite dev-server proxy; live mode is disabled. */
  devProxyAvailable: boolean;
}

/**
 * Live mode resolution order:
 * 1. Force fixture (explicit toggle — ignores all keys)
 * 2. Session UI override (this tab only)
 * 3. Server env from .env / .env.local — only when useServerEnv is opted in
 * 4. Fixture / demo mode (default)
 */
export function resolveAuth(input: AuthResolutionInput): ResolvedAuth {
  if (input.fixtureModeForced) {
    return { mode: "fixture", reason: "forced" };
  }

  if (!input.devProxyAvailable) {
    return { mode: "fixture", reason: "no-key" };
  }

  if (hasNonEmptyKey(input.sessionKey)) {
    return {
      mode: "live",
      source: "session",
      sessionKey: input.sessionKey!.trim(),
    };
  }

  if (input.useServerEnv && input.serverKeyConfigured) {
    return { mode: "live", source: "server-env" };
  }

  return { mode: "fixture", reason: "no-key" };
}

export function describeAuthSource(auth: ResolvedAuth): string {
  if (auth.mode === "fixture") {
    return auth.reason === "forced" ? "Fixture mode (forced)" : "Fixture mode (default)";
  }

  return auth.source === "session"
    ? "Live API (session override)"
    : "Live API (.env via dev-server proxy — opted in)";
}
