import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { JEV_LATEST, JEV_PINNED } from "@zotoio/jev-demo";
import { PROXY_CONFIG_PATH } from "../../server/constants.js";
import { resolveAuth, type LiveAuthSource, type ResolvedMode } from "../lib/auth-resolution.js";
import { hasNonEmptyKey } from "./session-storage.js";

export type ModelChoice = "jev-latest" | "jev-pinned";

export interface SessionState {
  sessionKey: string | null;
  fixtureModeForced: boolean;
  useServerEnv: boolean;
  serverKeyConfigured: boolean;
  serverConfigLoaded: boolean;
  /** True when the Vite dev-server proxy is reachable (localhost / preview). */
  devProxyAvailable: boolean;
  model: ModelChoice;
  hasSessionOverride: boolean;
  authMode: ResolvedMode;
  liveSource?: LiveAuthSource;
  isLive: boolean;
  setSessionKey: (key: string) => void;
  setFixtureModeForced: (enabled: boolean) => void;
  setUseServerEnv: (enabled: boolean) => void;
  setModel: (model: ModelChoice) => void;
  clearSession: () => void;
  resolvedModelId: string;
}

const SessionContext = createContext<SessionState | null>(null);

interface ServerConfig {
  serverKeyConfigured: boolean;
  devProxyAvailable: boolean;
}

async function fetchServerConfig(): Promise<ServerConfig> {
  try {
    const response = await fetch(PROXY_CONFIG_PATH);
    if (!response.ok) {
      return { serverKeyConfigured: false, devProxyAvailable: false };
    }
    const data = (await response.json()) as { serverKeyConfigured?: boolean };
    return {
      serverKeyConfigured: Boolean(data.serverKeyConfigured),
      devProxyAvailable: true,
    };
  } catch {
    return { serverKeyConfigured: false, devProxyAvailable: false };
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionKey, setSessionKeyState] = useState<string | null>(null);
  const [fixtureModeForced, setFixtureModeForced] = useState(false);
  const [useServerEnv, setUseServerEnv] = useState(false);
  const [serverKeyConfigured, setServerKeyConfigured] = useState(false);
  const [serverConfigLoaded, setServerConfigLoaded] = useState(false);
  const [devProxyAvailable, setDevProxyAvailable] = useState(false);
  const [model, setModel] = useState<ModelChoice>("jev-latest");

  useEffect(() => {
    void fetchServerConfig().then((config) => {
      setServerKeyConfigured(config.serverKeyConfigured);
      setDevProxyAvailable(config.devProxyAvailable);
      setServerConfigLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!devProxyAvailable && useServerEnv) {
      setUseServerEnv(false);
    }
  }, [devProxyAvailable, useServerEnv]);

  const setSessionKey = useCallback((key: string) => {
    const trimmed = key.trim();
    setSessionKeyState(trimmed || null);
  }, []);

  const clearSession = useCallback(() => {
    setSessionKeyState(null);
  }, []);

  const hasSessionOverride = hasNonEmptyKey(sessionKey);
  const auth = resolveAuth({
    sessionKey,
    fixtureModeForced,
    useServerEnv,
    serverKeyConfigured,
  });
  const resolvedModelId = model === "jev-latest" ? JEV_LATEST : JEV_PINNED;

  const value = useMemo(
    () => ({
      sessionKey,
      fixtureModeForced,
      useServerEnv,
      serverKeyConfigured,
      serverConfigLoaded,
      devProxyAvailable,
      model,
      hasSessionOverride,
      authMode: auth.mode,
      liveSource: auth.source,
      isLive: auth.mode === "live",
      setSessionKey,
      setFixtureModeForced,
      setUseServerEnv,
      setModel,
      clearSession,
      resolvedModelId,
    }),
    [
      sessionKey,
      fixtureModeForced,
      useServerEnv,
      serverKeyConfigured,
      serverConfigLoaded,
      devProxyAvailable,
      model,
      hasSessionOverride,
      auth.mode,
      auth.source,
      setSessionKey,
      clearSession,
      resolvedModelId,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
