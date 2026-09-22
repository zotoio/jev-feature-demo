/** Read process.env safely in Node and browser (Vite) bundles. */
export function readEnv(name: string): string | undefined {
  try {
    if (typeof process !== "undefined" && process.env && typeof process.env[name] === "string") {
      const value = process.env[name];
      return value === "" ? undefined : value;
    }
  } catch {
    // browsers without a process polyfill throw ReferenceError on bare `process`
  }
  return undefined;
}
