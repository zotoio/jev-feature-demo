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

### Fixture vs live

- **Fixture mode** (default): works with **zero API key** — serves golden JSON from `packages/jev-demo/fixtures/`. Used by CI and first-run.
- **Live mode**: save an API key in Session, turn off fixture mode — calls `https://api.typesafe.ai` from your browser.

### API key security (localhost only)

- Password-style input; held in **React memory** by default.
- Optional **“keep for this browser tab”** stores in `sessionStorage` only (tab lifetime).
- **Never** `localStorage`, never written to `.env`, never logged, never in URLs.
- **Clear key / lock session** wipes memory and `sessionStorage` immediately.
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

Copy `.env.example` to `.env` for local development if your shell loads it.

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

All paths relative to `packages/jev-demo/`. Fixtures under `fixtures/` match the [HTTP API reference](https://docs.typesafe.ai/api).

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
