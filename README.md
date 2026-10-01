# Verda

**AI product studio for commerce teams.** Turn a plain product description into store-ready catalog data and client-ready proposals in seconds.

🔗 **Live:** https://ai-systems-mocha.vercel.app

---

## What it does

Verda is a small suite of AI tools for the repetitive content work behind an online store:

| Tool | What you give it | What you get back |
|---|---|---|
| **Catalog Intelligence** | A product name, description and materials | Primary category, sub-category, 5–10 SEO tags and product attributes |
| **Proposal Builder** | A company, budget and brief | A product mix, line-item budget breakdown and a positioning summary |
| **Impact Snapshot** | An order | A sustainability estimate (plastic saved, carbon avoided) with a shareable narrative |
| **Support Copilot** | A customer message | Detected intent, a drafted reply and refund escalation when needed |

Catalog Intelligence and Proposal Builder are backed by a live LLM returning **schema-validated JSON**. Impact Snapshot and Support Copilot are deterministic demos that show the intended architecture.

---

## Architecture

A **modular clean architecture** with AI logic separated from business logic.

- **`AIService`** (`src/lib/ai-service.ts`) — a model-agnostic wrapper over an OpenAI-compatible Chat Completions API. It enforces structured output with `response_format: json_schema`, hardens the schema for strict mode, and logs every call. If no API key is set it falls back to deterministic mock responses, so the app always runs.
- **Modules** (`src/modules/*`) — each tool is a self-contained module depending only on the generic `AIService` contract.
- **Data store** (`src/lib/db.ts`) — a dependency-free in-memory store with best-effort JSON persistence; runs identically on a laptop or a serverless function.
- **Server** (`src/server.ts`) — an Express app exposing the REST API and the static front-end; exports the app so it also runs as a Vercel serverless function (`api/index.ts`).

The front-end is a single static page (`public/`) with a tabbed workspace and a light/dark theme.

---

## Tech stack

| Layer | Choice |
|---|---|
| Language | TypeScript (ESM, strict) |
| Server | Express 5 |
| AI | OpenAI-compatible Chat Completions, structured JSON output |
| Validation | Zod + JSON-schema strict mode |
| Front-end | Static HTML + Tailwind, no framework |
| Deploy | Vercel (serverless) |

---

## Run locally

```bash
npm install
cp .env.example .env     # add your API key
npm start                # http://localhost:3000
```

`npm run demo` runs the two live modules against sample data in the terminal.

### Environment

```env
GROQ_API_KEY=your_key_here      # OpenAI-compatible key
GROQ_MODEL=openai/gpt-oss-120b  # optional override
```

Without a key the app runs in mock mode so the UI still works end-to-end.

---

## API

| Endpoint | Body | Returns |
|---|---|---|
| `POST /api/generate-tags` | `{ name, description, materials[] }` | `{ primaryCategory, subCategory, seoTags[], sustainabilityFilters[] }` |
| `POST /api/generate-proposal` | `{ companyName, budgetLimit, numberOfProducts, ... }` | `{ productMix[], budgetAllocation, impactPositioningSummary, clientFitExplanation }` |
| `POST /api/generate-impact` | `{ orderId, orderDetails }` | `{ plasticSaved, carbonAvoided, localSourcing, impactStatement }` |
| `POST /api/chat` | `{ message }` | `{ response, reasoning, escalate }` |

---

Built by Satyam Jha.
