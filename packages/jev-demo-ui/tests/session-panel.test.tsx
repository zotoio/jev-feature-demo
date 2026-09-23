import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, afterEach, beforeEach, vi } from "vitest";
import { SessionPanel } from "../src/components/SessionPanel.js";
import { SessionProvider } from "../src/session/SessionContext.js";

function renderSessionPanel() {
  return render(
    <SessionProvider>
      <SessionPanel />
    </SessionProvider>,
  );
}

describe("SessionPanel on static publish", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders no API key field or Apply key button on GitHub Pages", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no proxy"));

    renderSessionPanel();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Published demo/i })).toBeTruthy();
    });

    expect(screen.queryByLabelText(/TypeSafe API key/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /Apply key/i })).toBeNull();
    expect(screen.getByText(/Fixture mode \(published demo\)/i)).toBeTruthy();
  });

  it("shows session key controls only when dev proxy is available", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ serverKeyConfigured: false }),
    } as Response);

    renderSessionPanel();

    await waitFor(() => {
      expect(screen.getByLabelText(/TypeSafe API key/i)).toBeTruthy();
    });

    expect(screen.getByRole("button", { name: /Apply key/i })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: /Published demo/i })).toBeNull();
  });
});
