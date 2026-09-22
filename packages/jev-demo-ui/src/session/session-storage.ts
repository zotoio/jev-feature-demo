/** Session-only API key storage — never localStorage. */
export const SESSION_STORAGE_KEY = "jev-demo-api-key";

export function readPersistedApiKey(): string | null {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function persistApiKey(key: string): void {
  sessionStorage.setItem(SESSION_STORAGE_KEY, key);
}

export function clearPersistedApiKey(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export function hasNonEmptyKey(key: string | null | undefined): boolean {
  return Boolean(key?.trim());
}

/** Redact key for display — never show full secret. */
export function maskApiKey(key: string): string {
  const trimmed = key.trim();
  if (trimmed.length <= 8) return "••••••••";
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}
