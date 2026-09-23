import { hasNonEmptyKey } from "../session/session-storage.js";

export type LiveAuthSource = "session" | "server-env";
export type ResolvedMode = "live" | "fixture";

export interface ResolvedAuth {
  mode: ResolvedMode;
  source?: LiveAuthSource;
  sessionKey?: string;
  reason?: "forced" | "no-key" | "static-publish";
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
 * 1. Static publish (GitHub Pages — fixture only, no live path)
 * 2. Force fixture (explicit toggle — ignores all keys)
 * 3. Session UI override (this tab only)
 * 4. Server env from .env / .env.local — only when useServerEnv is opted in
 * 5. Fixture / demo mode (default)
 */
export function resolveAuth(input: AuthResolutionInput): ResolvedAuth {
  if (!input.devProxyAvailable) {
    return { mode: "fixture", reason: "static-publish" };
  }

  if (input.fixtureModeForced) {
    return { mode: "fixture", reason: "forced" };
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
    if (auth.reason === "static-publish") return "Fixture mode (published demo)";
    return auth.reason === "forced" ? "Fixture mode (forced)" : "Fixture mode (default)";
  }

  return auth.source === "session"
    ? "Live API (session override)"
    : "Live API (.env via dev-server proxy — opted in)";
}
