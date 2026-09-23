import { afterEach, describe, expect, it } from "vitest";
import { SESSION_STORAGE_KEY } from "../src/session/session-storage.js";
import {
  readStoredTheme,
  persistTheme,
  THEME_STORAGE_KEY,
} from "../src/theme/theme-storage.js";

describe("theme storage", () => {
  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
  });

  it("defaults to dark when no preference is stored", () => {
    expect(readStoredTheme()).toBe("dark");
  });

  it("persists light theme preference in localStorage", () => {
    persistTheme("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(readStoredTheme()).toBe("light");
  });

  it("persists dark theme preference in localStorage", () => {
    persistTheme("dark");
    expect(readStoredTheme()).toBe("dark");
  });

  it("treats invalid stored values as dark", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "system");
    expect(readStoredTheme()).toBe("dark");
  });

  it("uses a separate storage key from API session keys", () => {
    persistTheme("light");
    expect(THEME_STORAGE_KEY).not.toBe(SESSION_STORAGE_KEY);
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });
});
