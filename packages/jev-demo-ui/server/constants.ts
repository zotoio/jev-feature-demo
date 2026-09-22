/** Local dev proxy path — never embed TYPESAFE_API_KEY in the client bundle. */
export const PROXY_BASE_PATH = "/api/typesafe";
export const PROXY_CONFIG_PATH = "/api/config";

/** SDK placeholder when the dev-server proxy injects TYPESAFE_API_KEY from .env */
export const SERVER_PROXY_SENTINEL = "server-env-proxy";

export const TYPESAFE_API_BASE = "https://api.typesafe.ai";
