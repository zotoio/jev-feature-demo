import { useSession } from "./SessionContext.js";

export function useUiClientOptions(fixtureId: string) {
  const session = useSession();
  return {
    sessionKey: session.sessionKey,
    fixtureModeForced: session.fixtureModeForced,
    serverKeyConfigured: session.serverKeyConfigured,
    fixtureId,
    defaultModel: session.resolvedModelId,
  };
}
