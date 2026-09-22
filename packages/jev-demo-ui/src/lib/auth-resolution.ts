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
  serverKeyConfigured: boolean;
}

/**
 * Live mode resolution order:
 * 1. Session UI override (this tab only)
 * 2. Server env from .env / .env.local (dev-server proxy)
 * 3. Fixture / demo mode
 */
export function resolveAuth(input: AuthResolutionInput): ResolvedAuth {
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

  if (input.serverKeyConfigured) {
    return { mode: "live", source: "server-env" };
  }

  return { mode: "fixture", reason: "no-key" };
}

export function describeAuthSource(auth: ResolvedAuth): string {
  if (auth.mode === "fixture") {
    return auth.reason === "forced" ? "Fixture mode (forced)" : "Fixture mode";
  }

  return auth.source === "session"
    ? "Live API (session override)"
    : "Live API (.env via dev-server proxy)";
}
