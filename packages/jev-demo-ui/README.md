# jev-demo-ui

Local browser playground for the Jev feature demo (`pnpm ui` from the repo root).

## API key setup

1. Copy `.env.example` to a **gitignored** `.env` or `.env.local` at the **workspace root** (not under `packages/jev-demo-ui`).
2. Set `TYPESAFE_API_KEY` — **no `VITE_` prefix**. The Vite dev-server proxy reads it at runtime; it is never baked into the client bundle.
3. Optional (localhost only): paste a key in the Session panel for a tab-only override. The UI **never writes** to `.env` or any file.

**Published GitHub Pages:** fixture-only — no API key paste, no live Typesafe calls. Run `pnpm ui` locally for live mode.

**Live mode resolution order (localhost):** session override → server `.env` / `.env.local` (dev proxy) → fixture mode.

Do not commit `.env` files or API keys.
