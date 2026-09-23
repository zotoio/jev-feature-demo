import {
  PROXY_BASE_PATH,
  SERVER_PROXY_SENTINEL,
  TYPESAFE_API_BASE,
} from "../../server/constants.js";
import type { ResolvedAuth } from "./auth-resolution.js";

export interface LiveClientConfig {
  apiKey: string;
  baseURL: string;
}

/**
 * Session keys call Typesafe directly from localhost (live mode is disabled on static publish).
 * Server .env opt-in uses the dev-server proxy on localhost only.
 */
export function resolveLiveClientConfig(auth: ResolvedAuth): LiveClientConfig {
  if (auth.source === "session") {
    return {
      apiKey: auth.sessionKey!,
      baseURL: TYPESAFE_API_BASE,
    };
  }

  return {
    apiKey: SERVER_PROXY_SENTINEL,
    baseURL: PROXY_BASE_PATH,
  };
}
