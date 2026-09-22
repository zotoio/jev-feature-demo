# jev-feature-demo

Greenfield demo repository showcasing **every** [Typesafe.ai Jev (System One)](https://docs.typesafe.ai/) API surface that can be exercised from application code.

**GitHub:** https://github.com/zotoio/jev-feature-demo (private)

**Core principle:** Jev proposes typed answers (Noul, Choice, Score). **Your code** owns promote / act / ask_human / deny / abstain — the model never executes side effects.

## Layout (Architect A)

```
packages/jev-demo/
  lib/JevClient.ts      # primary facade (@typesafe-ai/sdk + raw HTTP)
  lib/client/           # SDK wrapper, raw fetch, demo client
  lib/confidence-gates.ts
  cli/                  # support-ticket triage CLI
  demos/                # feature demos
  fixtures/             # golden API responses (offline CI)
  tests/                # Vitest matrix (fixture-first)
  scripts/test-live.ts  # optional live smoke (TYPESAFE_API_KEY)
packages/jev-demo-ui/   # local web playground (thin client over jev-demo lib)
```

## Local UI

A browser playground for every Jev surface — no CLI required for exploration.

```bash
pnpm install
pnpm ui            # http://localhost:5173
```

| Panel | What it covers |
|-------|----------------|
| **Session** | API key entry, model select (`jev-latest` / pinned), connection test, clear session |
| **Playground** | Build Noul / Choice / Score (and batch), edit state shapes, run, gate outcomes |
| **Scenarios** | One-click hard-fail goldens + triage demos from fixtures |
| **Raw / Advanced** | SDK vs raw HTTP twin parity, request/response viewer |

### API key setup (preferred → optional override)

**Preferred for local runs:** copy `.env.example` to `.env` or `.env.local` (both gitignored) and set `TYPESAFE_API_KEY`. The Vite dev server reads it and proxies live calls through `localhost` — the key is **never** baked into the client bundle (no `VITE_` prefix).

**Optional session override:** paste a key in the Session panel for a temporary tab-only override (React memory + optional `sessionStorage`). The UI **never writes** to `.env` or any file. **Clear session override** wipes the tab override only — it does not delete `.env`.

**Live mode resolution order:**

1. Session UI override (this tab)
2. Server `.env` / `.env.local` via dev-server proxy
3. Fixture / demo mode (zero key — CI and first-run)

Toggle **Force fixture mode** in Session to use offline goldens even when a key is available.

### API key security (localhost only)

- `.env` / `.env.local`: read by the **Vite/Node dev server only**; proxied to Typesafe without embedding in static assets.
- Session override: password-style input; memory + optional `sessionStorage` (tab lifetime).
- **Never** `localStorage`, never `VITE_*` env vars, never logged, never in URLs.
- Jev proposes; the UI **never auto-executes side effects** — gate decisions are shown and “Simulate promote” requires an explicit click.

Do not deploy this UI to production with user key entry; it is for local exploration on `localhost` only.

## Requirements

- Node.js 20+
- [pnpm](https://pnpm.io/) (recommended)

## Setup

```bash
pnpm install
pnpm test          # offline — recorded fixtures only
pnpm demo:triage   # CLI scenario (uses fixtures unless key is set)
```

### Optional live smoke

Create an API key in the [TypeSafe Console](https://console.typesafe.ai/settings/keys) (early access may require waitlist approval), then:

```bash
export TYPESAFE_API_KEY="sk-..."
pnpm test:live     # hits https://api.typesafe.ai — skipped if key unset
```

Copy `.env.example` to `.env` or `.env.local` for local development (`pnpm ui` proxy and `pnpm test:live`).

## Pin vs latest

| Model ID | Role |
|----------|------|
| `jev-latest` | Default alias; currently resolves to `jev-1.13.0` per [Models docs](https://docs.typesafe.ai/models) |
| `jev-1.13.0` | Pinned stable release — use when you've tuned confidence thresholds |
| Response `model` field | Always logs the **resolved versioned ID** that answered |

When `jev-latest` moves to a new release, answers can shift without code changes. Pin `jev-1.13.0` in production gates until you've re-calibrated thresholds, then promote on your schedule — **code owns promote**.

## Clients

| Client | Path | Purpose |
|--------|------|---------|
| **JevClient** (facade) | `packages/jev-demo/lib/JevClient.ts` | Primary entry — SDK + exports |
| Official SDK wrapper | `packages/jev-demo/lib/client/typesafe-client.ts` | `@typesafe-ai/sdk` v0.6.0 |
| Raw fetch | `packages/jev-demo/lib/client/raw-fetch-client.ts` | Teaching — `POST /v1/systemone`, `GET /v1/models` |

## Feature matrix

| # | Feature | Demo | Test |
|---|---------|------|------|
| 1 | **Noul** (plain) | `demos/primitives.ts` → `demoNoulSimple` | `tests/noul.test.ts` |
| 2 | **Noul + true/false criteria** | `demos/primitives.ts` → `demoNoulWithCriteria` | `tests/noul.test.ts` |
| 3 | **Choice + `other` option** | `demos/choice-demo.ts` | `tests/choice.test.ts` |
| 4 | **Score** (fractional + legend) | `demos/score-demo.ts` | `tests/score.test.ts` |
| 5 | **State: string** | `demos/state-shapes.ts` → `demoStateAsString` | `tests/state-shapes.test.ts` |
| 6 | **State: JSON object** | `demos/state-shapes.ts` → `demoStateAsObject` | `tests/state-shapes.test.ts` |
| 7 | **State: text array** | `demos/state-shapes.ts` → `demoStateAsTextArray` | `tests/state-shapes.test.ts` |
| 8 | **Structured instructions** | `demos/state-shapes.ts` → `demoStructuredInstructions` | `tests/state-shapes.test.ts` |
| 9 | **Multi-question batch** | `demos/batch-demo.ts` | `tests/batch.test.ts` |
| 10 | **`jev-latest` alias** | `demos/models-demo.ts` → `demoLatestModel` | `tests/models.test.ts` |
| 11 | **Pinned `jev-1.13.0`** | `demos/models-demo.ts` → `demoPinnedModel` | `tests/models.test.ts` |
| 12 | **List models** | `demos/models-demo.ts` → `demoListModels` | `tests/models.test.ts` |
| 13 | **Confidence gates** (act / ask_human / deny / abstain) | `lib/confidence-gates.ts` | `tests/gates.test.ts` |
| 14 | **Usage tokens** | `formatUsage()` in gates | `tests/usage.test.ts` |
| 15 | **Speculative fan-out** | `demos/speculative-fanout.ts` | `tests/speculative-fanout.test.ts` |
| 16 | **Error paths** (401, 422, 429, missing key) | SDK + raw client | `tests/errors.test.ts` |
| 17 | **Raw HTTP client** | `lib/client/raw-fetch-client.ts` | `tests/raw-fetch.test.ts` |
| 18 | **E2E CLI triage** | `cli/support-ticket-triage.ts` | `tests/support-ticket-triage.test.ts` |
| 19 | **Noul hard-fail** (auto-merge, missing blast-radius) | `demos/hard-fail/noul-auto-merge.ts` | `tests/hard-fail/noul-hard-fail.test.ts` |
| 20 | **Choice hard-fail** (smoke=fail → rollback) | `demos/hard-fail/choice-deploy-strategy.ts` | `tests/hard-fail/choice-hard-fail.test.ts` |
| 21 | **Score hard-fail** (blast-radius band caps promote) | `demos/hard-fail/score-blast-radius.ts` | `tests/hard-fail/score-hard-fail.test.ts` |

All paths relative to `packages/jev-demo/`. Fixtures under `fixtures/` match the [HTTP API reference](https://docs.typesafe.ai/api). Hard-fail goldens live under `fixtures/hard-fail/` with prompt-contract metadata.

## End-to-end CLI

Support ticket triage using speculative fan-out + confidence gates:

```bash
pnpm demo:triage "URGENT: charged twice — refund one charge today"
```

Example output:

```
Support ticket triage (Jev proposes — code decides)
────────────────────────────────────────────────
Model: jev-1.13.0
Usage: input=620 output=88
Category: billing (confidence 0.84)
Decision: ASK_HUMAN — escalate for review
Handler: billing | Priority: high
• Flag likely refund request
• Priority response: elevated frustration
```

JSON mode: `JSON=1 pnpm demo:triage "..."`.

## Hard-fail goldens (room scenarios)

Locked scenarios beside triage — assert gates block unsafe promotion:

```bash
pnpm demo:hard-fail          # all three scenarios (fixture-first)
pnpm demo:hard-fail noul     # auto-merge without blast-radius
pnpm demo:hard-fail choice   # smoke=fail → rollback
pnpm demo:hard-fail score    # mid-band blast-radius caps at ask_human
```

## Architecture

```
state + questions  ──►  POST /v1/systemone  ──►  typed answers + confidence
                                                          │
                                                          ▼
                                              application gates (act | ask_human | deny | abstain)
                                                          │
                                                          ▼
                                              side effects (your code only)
```

## Relationship to Botz Intents

This repo is the **Jev substrate** demo: typed decisions from System One, with application-owned routing. It does not wire Botz MCP Trajectory — that is a sibling effort. Aligns with Botz Intents: model proposes, code promotes.

## License

MIT
