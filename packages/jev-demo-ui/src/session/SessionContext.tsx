import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { JEV_LATEST, JEV_PINNED } from "@zotoio/jev-demo";
import {
  clearPersistedApiKey,
  hasNonEmptyKey,
  persistApiKey,
  readPersistedApiKey,
} from "./session-storage.js";

export type ModelChoice = "jev-latest" | "jev-pinned";

export interface SessionState {
  apiKey: string | null;
  persistKeyInTab: boolean;
  fixtureMode: boolean;
  model: ModelChoice;
  hasKey: boolean;
  isLive: boolean;
  setApiKey: (key: string) => void;
  setPersistKeyInTab: (persist: boolean) => void;
  setFixtureMode: (enabled: boolean) => void;
  setModel: (model: ModelChoice) => void;
  clearSession: () => void;
  resolvedModelId: string;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(() => readPersistedApiKey());
  const [persistKeyInTab, setPersistKeyInTabState] = useState(() => Boolean(readPersistedApiKey()));
  const [fixtureMode, setFixtureMode] = useState(true);
  const [model, setModel] = useState<ModelChoice>("jev-latest");

  const setApiKey = useCallback(
    (key: string) => {
      const trimmed = key.trim();
      setApiKeyState(trimmed || null);
      if (persistKeyInTab && trimmed) {
        persistApiKey(trimmed);
      } else {
        clearPersistedApiKey();
      }
    },
    [persistKeyInTab],
  );

  const setPersistKeyInTab = useCallback(
    (persist: boolean) => {
      setPersistKeyInTabState(persist);
      if (persist && apiKey) {
        persistApiKey(apiKey);
      } else {
        clearPersistedApiKey();
      }
    },
    [apiKey],
  );

  const clearSession = useCallback(() => {
    setApiKeyState(null);
    clearPersistedApiKey();
  }, []);

  const hasKey = hasNonEmptyKey(apiKey);
  const isLive = hasKey && !fixtureMode;
  const resolvedModelId = model === "jev-latest" ? JEV_LATEST : JEV_PINNED;

  const value = useMemo(
    () => ({
      apiKey,
      persistKeyInTab,
      fixtureMode,
      model,
      hasKey,
      isLive,
      setApiKey,
      setPersistKeyInTab,
      setFixtureMode,
      setModel,
      clearSession,
      resolvedModelId,
    }),
    [
      apiKey,
      persistKeyInTab,
      fixtureMode,
      model,
      hasKey,
      isLive,
      setApiKey,
      setPersistKeyInTab,
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
