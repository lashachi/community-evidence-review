---
doc: spec
status: approved
---

# Community Evidence Review — Technical Spec

## How This Works, In Plain Language

The app is one local Next.js application. The browser holds the current problem, community, source items, analysis, and founder's judgment in memory. Refreshing or closing the page clears them; the application does not save or manage reviews. After a successful review, the founder may explicitly download a plain-text snapshot to their own device. The application does not retain or reopen that file.

The browser sends one review at a time to a server route in the same app. That route checks every field and limit, then calls one small OpenAI-only module. The module sends the supplied material to GPT-5.6 Luna and asks for a tightly structured response. OpenAI's key stays on the server. The model receives no search or retrieval tools.

The server checks the response shape and that every cited source ID was submitted. “Published Rule” is a source-card label determined only by founder-selected metadata; the model schema has no Published Rule classification for the AI to assign. These checks verify format and references, not whether the model's interpretation is substantively correct. The browser displays the founder's original excerpts from its own memory, unchanged, beside the model's separate analysis. The demo fixture uses this same path and is labeled fictional.

We chose one framework and one request path to keep the local setup understandable. There is no database, account system, review history, live retrieval, deployment setup, or second model.

## The Core Journey Through the System

1. The browser opens the research-brief start view (`prd.md > Screens and Layout`). The founder enters a problem, a community name, and up to eight separate source items. Each item has a required source type and excerpt, plus optional reference and publication date (`prd.md > Establish the research`).
2. The interface counts each excerpt. More than 3,000 characters blocks submission without altering the text. Missing problem, community, source type, or excerpt produces inline feedback. The founder can load the complete fictional fixture instead.
3. If the founder proceeds with no source items, the browser shows “Evidence review unavailable” without an AI request or judgment controls (`prd.md > Handle unavailable evidence`).
4. Otherwise, the browser sends the problem, community name, and items to `POST /api/analyze`. The Next.js route validates the request, including the eight-item, per-excerpt, source-type, and source-ID constraints.
5. The analysis service makes exactly one Responses API request per attempt, with GPT-5.6 Luna, low reasoning effort, strict JSON Schema output, no tools, and response storage disabled. The API key is read only on the server.
6. The server validates the returned schema and source IDs against submitted items. Source types are validated on input and control source-card labels; the model cannot assign Published Rule. Invalid or incomplete output is rejected. It does not retry automatically; the founder must choose “Try again” for another request.
7. The browser renders original excerpts and founder-selected metadata from its unchanged memory, with model findings visually distinct and linked to their source items. It does not imply that schema or provenance validation proves a finding true (`prd.md > Examine an evidence review`).
8. After a normal review, the founder may select one of the three judgments in browser memory, replace it with another choice, or clear it by selecting the active choice again. Nothing is sent to the model or saved; a review may have no founder judgment. Download results records “No founder judgment selected.” when no choice is active. The experience then stops (`prd.md > Record the founder's judgment`).

## Stack

- **Node.js LTS, npm, TypeScript, Next.js App Router, and React.** The learner selected Next.js for one local app and one development command. TypeScript adds compile-time checks; it does not replace runtime validation. Use supported stable versions available during Build and verify Node compatibility then. [Next.js](https://nextjs.org/docs), [App Router](https://nextjs.org/docs/app), [Node.js](https://nodejs.org/en/about/previous-releases).
- **Zod** is proposed for shared runtime validation of browser requests, server responses, and structured analysis. This adds one direct dependency but avoids hand-written validation in multiple places. [Zod](https://zod.dev/).
- **OpenAI JavaScript SDK** is proposed for the server-only Responses API call and Structured Outputs. Configure `maxRetries: 0`; the founder's explicit “Try again” action is the only retry. [OpenAI Node SDK](https://github.com/openai/openai-node), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).
- **Vitest** is proposed as one development dependency for deterministic request/response validation tests. Model-quality checks use the fictional fixture and an explicit API call during Build, not a mocked result. [Vitest](https://vitest.dev/guide/).
- Use Next.js-provided React packages and plain CSS; do not add a UI kit, icon package, database, ORM, or state-persistence package. Exact package versions will be checked and explained before installation during Build.

## Where It Runs and How Someone Tries It

Run locally on Node.js LTS with `npm run dev`, then open `http://localhost:3000`. The app is designed for a single local user; deployment is not part of this spec. The hackathon submission still requires a short demo video and a public GitHub repository; deployment is optional and will be considered later.

The analysis path requires an OpenAI API key in a local `.env.local` file as `OPENAI_API_KEY`. The existing `.gitignore` ignores `.env` and `.env.*` while allowing a secret-free `.env.example`. Never use a `NEXT_PUBLIC_` prefix, expose the key to client components, log it, or commit it. Do not create an account, key, or API call until the appropriate Build step; explain expected usage cost before asking the learner to enable billing or use a key. Current estimate: about $0.006 per review at 10,000 input and 3,000 output tokens, using current GPT-5.6 Luna standard rates; actual usage varies. [OpenAI model/pricing](https://developers.openai.com/api/docs/models/gpt-5.6-luna), [Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables).

The source-input notice must say excerpts are sent to OpenAI for analysis and instruct the founder to use public, non-sensitive material only. Do not submit confidential company information, private community content, credentials, or personal/sensitive information. `store: false` prevents Responses API application-state storage, but OpenAI's standard API abuse-monitoring logs may retain content for up to 30 days. The app itself must not intentionally persist or log review content. [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data).

This workspace is not currently a Git repository. Do not initialize one as part of this spec; repository setup belongs to the later build/ship workflow.

## Look and Feel

Build a calm, credible research brief: restrained neutral surfaces, subtle borders, strong type hierarchy, and generous whitespace. Keep original excerpts primary and visibly distinct from secondary AI analysis. Use consistent labels for Published Rule, Direct Source Evidence, Limited Observation, AI Inference, and Unknown; use neutral distinctions for supports, weakens, complicates, and context. Avoid chatbot visuals, scores, traffic lights, gradients, gamification, and excessive motion. Clearly label all fixture data fictional/demo. No fixed palette or brand was chosen. See `prd.md > Look and Feel`.

## Components

### Review Workspace

Client-side component for the opening view, problem/community fields, source-item editor, character counts, source type selector, inline validation, privacy notice, “Try the example,” loading/error states, evidence review, “Your judgment,” and “Download results.” It keeps the full review and judgment only in memory and preserves original excerpts. “Try again” makes a new explicit request. “Download results” is an explicit client-side plain-text snapshot of the current completed review; the application does not retain or reopen the downloaded file. Implements `prd.md > Establish the research`, `Screens and Layout`, `Record the founder's judgment`, and `States and Boundaries`.

### Fictional Demo Fixture

Static, clearly labeled fictional data with a fictional problem, one fictionalized public community, and separate source items of both allowed source types. Include source content that can demonstrate supporting, weakening, complicating, and contextual material, a rule item, limited observations, inference, and unknowns. Load it through the same analysis path as founder-supplied items; do not present a prewritten analysis as live AI output. Exact example content is selected during Build. Implements `prd.md > Establish the research` and `States and Boundaries`.

### Analysis API Route

`POST /api/analyze` in the Next.js server runtime. Validate input before calling the provider, return a distinct unavailable result without a model call if there are no source items, and never persist or log excerpts. Return only validated analysis plus a status; original source items remain in browser memory. Implements `prd.md > Examine an evidence review` and `Handle unavailable evidence`.

### Review Contracts and Validation

Shared Zod schemas define source items, requests, and analysis results. Enforce at most eight items, at most 3,000 characters per excerpt, required excerpt and founder-selected source type, unique submitted IDs, and only the two allowed source-type values: `published_rules_or_community_description` and `discussion_or_other_source_material`. Keep reference and date as separate optional strings, record them without fetching or verifying. Validate every returned claim's source IDs against the submitted set; reject unknown IDs. The analysis schema does not allow a model-generated Published Rule category; the UI may use that source-card label only for items founder-designated “Published rules / community description.” Do not rewrite, trim, truncate, or summarize source excerpts. Implements `prd.md > Establish the research` and `Examine an evidence review`.

### OpenAI Analysis Module

Small server-only module containing all OpenAI SDK usage, model configuration, prompt, JSON Schema, request options, and provider error handling. Use model ID `gpt-5.6-luna`, reasoning effort `low`, `store: false`, a concise output budget (initial cap: 3,000 output tokens), strict Structured Outputs, and `maxRetries: 0`. Send the problem, community name, each source ID, founder-selected type, unchanged excerpt, and optional metadata in one request. Do not define or provide tools, browsing, search, URL context/fetching, file search, or any other retrieval. The schema allows only limited-observation and AI-inference claims plus unknowns; it has no Published Rule category, score, confidence, recommendation, judgment, or replacement source-text field. Implements `prd.md > Examine an evidence review` and `Handle unavailable evidence`.

## Data Model

Review data lives in browser memory for the active page only and is cleared on refresh, close, or app restart. There is no `localStorage`, `sessionStorage`, IndexedDB, cookie, application-managed filesystem storage, database, saved-review history, reopen/import functionality, or autosave. After a successful review, a user may explicitly download a plain-text snapshot generated in the browser; the application does not retain or manage a copy. The server handles an analysis request transiently and does not intentionally save it.

```text
ReviewState
  problem: string
  communityName: string
  sourceItems: SourceItem[]       // 0–8; 0 leads to unavailable state
  analysis: AnalysisResult | null
  judgment: Judgment | null       // UI-only, never sent to model

SourceItem
  id: string                     // stable within this review
  sourceType: one of the two exact founder-selected values
  excerpt: string                 // unchanged; 1–3,000 characters
  reference: string | null       // optional, recorded only
  publicationDate: string | null // optional, supplied and unverified

AnalysisResult
  claims: AnalysisClaim[]         // may omit irrelevant source items
  unknowns: Unknown[]

AnalysisClaim
  kind: limited_observation | ai_inference
  relationship: supports | weakens | complicates | context
  summary: string
  explanation: string
  sourceItemIds: string[]         // non-empty; must all be submitted IDs

Unknown
  summary: string                 // no citation required

Judgment
  Investigate further | Not enough evidence yet | Set aside
```

The five evidence distinctions have separate sources in the system:

- **Published Rule** is an original source card whose founder-selected type is “Published rules / community description.” The model cannot assign or authenticate this classification.
- **Direct Source Evidence** is the founder-supplied original source card itself, displayed unchanged with its supplied metadata. It is not a model-generated `AnalysisClaim` kind.
- **Limited Observation** is a model-generated structured `AnalysisClaim` tied to submitted source IDs.
- **AI Inference** is a model-generated structured `AnalysisClaim` tied to submitted source IDs.
- **Unknown** is a model-generated structured `Unknown.summary` describing something the supplied evidence does not establish. It has no required citation fields.

Founder-selected source type is displayed as unverified metadata. Discussion/other items remain direct source evidence and cannot be promoted to Published Rule. The model may leave an item uncited; the app does not force a claim for every item.

## File Structure

```text
project/
├── app/
│   ├── api/analyze/route.ts          # Server validation and analysis endpoint
│   ├── globals.css                   # Calm evidence-brief styling
│   ├── layout.tsx                    # App shell and metadata
│   └── page.tsx                      # Entry point
├── components/
│   └── review-workspace.tsx          # Client UI and memory-only journey
├── lib/
│   ├── contracts.ts                  # Zod request/source/response schemas
│   ├── demo-fixture.ts               # Fictional inputs only
│   ├── evidence-analysis.ts          # Server orchestration and ID/type checks
│   └── openai-analysis.ts            # OpenAI-only SDK boundary
├── tests/
│   └── contracts.test.ts             # Input, output, limits, provenance tests
├── devpost/                          # Approved scope, PRD, and spec
├── .env.example                      # Secret-free variable-name example
├── .gitignore                        # Existing secret ignores retained
├── package.json                      # Scripts and dependencies
├── package-lock.json                 # Reproducible npm dependency tree
├── tsconfig.json                     # TypeScript configuration
└── vitest.config.ts                  # Focused contract-test setup
```

Generated `.next/`, `node_modules/`, and build output are not enumerated. The actual Next.js scaffold may add standard configuration files; review them during Build without adding unrelated infrastructure.

## External Services and Dependencies

### OpenAI Responses API

- **Endpoint:** `POST https://api.openai.com/v1/responses` through the server-only OpenAI SDK.
- **Request:** model `gpt-5.6-luna`; `reasoning.effort: "low"`; `store: false`; `max_output_tokens: 3000`; one system instruction and one user payload containing the problem, community name, and up to eight separate `{id, sourceType, excerpt, reference, publicationDate}` items; strict JSON Schema via `text.format`. Do not supply a `tools` field.
- **Response used:** only structured `claims` and `unknowns`. Each claim has `kind`, neutral evidence `relationship`, concise `summary`, short `explanation`, and submitted `sourceItemIds`. Each unknown has only a `summary`, with no citation field required. The model returns no source excerpts, Published Rule category, score, overall fit, confidence, founder judgment, or recommendation.
- **Validation:** parse against the strict runtime schema and validate claim IDs against this request. Request source types control source-card labels; the UI must never display a discussion/other item as Published Rule. Refusals, incomplete output, schema errors, or unknown IDs produce no review; show a safe failure state and an explicit “Try again” action. Validation does not certify semantic correctness.
- **Tools and retrieval:** none. The model can analyze only submitted material for community-specific claims; unsupported points remain unknown.
- **Privacy/cost:** public, non-sensitive material only; clear disclosure that text goes to OpenAI. `store: false` does not disable standard abuse-monitoring logs. Current token rates and the estimate above are subject to change. No OpenAI account, key, package, or API call is created during specification.

Documentation: [Responses API](https://developers.openai.com/api/docs/guides/text), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna), [API data controls](https://developers.openai.com/api/docs/guides/your-data), [pricing](https://developers.openai.com/api/docs/pricing).

### Local Packages

Next.js/React/TypeScript provide the browser UI and same-origin server route; Zod provides runtime validation; the OpenAI SDK provides the API client; Vitest covers deterministic validation tests. Verify current stable package versions, SDK Structured Outputs support, and model compatibility early in Build. Explain the purpose and installation impact before installing. No other external service or deployment platform is selected.

## Important Failure Modes

- **Missing problem/community, empty excerpt, invalid source type, more than eight items, or excerpt over 3,000 characters** → keep the founder on the form, preserve entered text, show specific inline feedback, and do not call the model. Character counters use the same counting rule in browser and server. Never silently truncate.
- **No source items** → show “Evidence review unavailable,” identify the problem and community, explain that nothing can be established, and show no judgment choices. Do not call the model or search elsewhere.
- **Provider/network failure, refusal, incomplete response, invalid schema, or unknown source ID** → do not display partial findings. Preserve the form in memory, show a plain failure message, and wait for an explicit “Try again.” SDK retries are disabled. Separately, the UI derives Published Rule labels only from validated founder-selected source types, never from model output.
- **Valid but substantively wrong analysis** → schema/ID checks cannot catch this. Compare actual model results to the fixture quality checklist during Build; if GPT-5.6 Luna fails a specific substantive check, stop and discuss the observed failure before changing one factor. No automatic prompt/schema/model/reasoning changes or fallback.

## What Was Simplified and Why

- Founder-supplied pasted excerpts instead of live community retrieval: preserves inspectable provenance without API access, scraping, changing content, or platform-rule complexity.
- One structured request for the complete review instead of per-item calls: reduces latency, cost, and integration complexity while preserving cross-item comparison.
- One local Next.js process, one analysis endpoint, and one provider module instead of separate services: keeps setup and the client/server boundary understandable.
- In-memory review state instead of accounts, storage, or history: meets the approved session-only journey and avoids retaining source material.
- A maximum of eight items and 3,000 characters per excerpt: bounds the POC request, not sampling sufficiency or representativeness.
- One model configuration with explicit user retry instead of automatic retries or multi-model routing: keeps cost predictable and makes each analysis attempt observable.

## Decisions and Open Issues

- **Learner choices:** local browser app; Next.js integrated app; founder-supplied separate pasted excerpts and a fictional fixture; at most eight items; 3,000 characters per excerpt; required founder-selected source type with exactly two values; one OpenAI request per attempt; GPT-5.6 Luna (`gpt-5.6-luna`) at low reasoning effort; memory-only data; user-controlled retry; no deployment, database, accounts, history, or live retrieval.
- **Evidence contract:** source text and optional reference/date remain unchanged and unverified; only submitted IDs can support analysis claims; only founder-designated published-rules/description items can appear as Published Rule; no forced coverage; no score, confidence, verdict, or recommendation; no unsupported community-wide generalization. Schema and provenance validation are not substantive correctness checks.
- **Security/privacy:** the OpenAI key is server-only in ignored `.env.local`; no review text in client bundles, logs, or persistence; UI warns that excerpts are sent to OpenAI and must be public/non-sensitive; standard provider abuse monitoring may retain content under current API policy.
- **Reasoning/model quality:** low effort is a testable starting configuration, not a permanent quality assumption. Build must test the fictional fixture for all five evidence distinctions, source fidelity, mixed evidence, bounded observations, correct source IDs, and unknowns. If a substantive check fails, record the specific failure, then discuss a single change at a time. No silent model or setting change.
- **Build verification:** the architecture is decided: `OPENAI_API_KEY` is available only to server-side code. During Build, verify it is referenced only by server-side code, absent from client components and browser-visible/generated client assets, and that invalid requests are rejected server-side. This is a verification requirement, not an unresolved architecture decision.
- **Items deferred to Build:** exact fictional problem/community/source text; current stable package versions; install commands and dependencies (explain before installation); OpenAI account/key setup and any usage cost (explain before asking); test actual response behavior against the quality checklist. These do not block this spec. Deployment remains undecided and out of scope.

No other consequential product or architecture decision remains unresolved for this proof of concept.