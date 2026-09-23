/** Legacy sessionStorage key — kept for tests only; API keys are memory-only. */
export const SESSION_STORAGE_KEY = "jev-demo-api-key";

/** Session key helpers — memory-only; never localStorage or sessionStorage. */

export function hasNonEmptyKey(key: string | null | undefined): boolean {
  return Boolean(key?.trim());
}

/** Redact key for display — never show full secret. */
export function maskApiKey(key: string): string {
  const trimmed = key.trim();
  if (trimmed.length <= 8) return "••••••••";
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}
