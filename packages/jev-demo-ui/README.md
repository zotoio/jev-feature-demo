# jev-demo-ui

Local browser playground for the Jev feature demo (`pnpm ui` from the repo root).

## API key setup

1. Copy `.env.example` to a **gitignored** `.env` or `.env.local` at the **workspace root** (not under `packages/jev-demo-ui`).
2. Set `TYPESAFE_API_KEY` — **no `VITE_` prefix**. The Vite dev-server proxy reads it at runtime; it is never baked into the client bundle.
3. Optional: paste a key in the Session panel for a tab-only override. The UI **never writes** to `.env` or any file.

**Live mode resolution order:** session override → server `.env` / `.env.local` (dev proxy) → fixture mode.

Do not commit `.env` files or API keys.
