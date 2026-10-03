# Community Evidence Review

Community Evidence Review is an AI-assisted research proof of concept for examining supplied
evidence from one public online community against one research problem.

AI organizes and analyzes the supplied material. It keeps source evidence distinct from limited
observations, AI inferences, and unknowns; the founder or user makes the final judgment. The AI
does not decide whether a community is suitable.

## Evidence model

- **Published Rules:** source material from rules or a community description, designated by the
  founder.
- **Direct Source Evidence:** the original source material supplied by the founder.
- **Limited Observations:** AI-generated descriptions limited to what appears in the submitted
  material; they do not establish prevalence or representativeness.
- **AI Inferences:** AI-generated interpretations of the submitted material, not established
  facts.
- **Unknowns:** what the supplied evidence does not establish.

Findings refer to submitted source items. The review has no score, confidence rating, suitability
verdict, or automated decision.

## How it works

For a review with supplied evidence:

```text
Browser
  → local Next.js server route
  → request validation and evidence orchestration
  → OpenAI Responses API
  → validated structured result
  → browser review
```

The no-source path stops before the provider:

```text
No supplied source evidence
  → Evidence review unavailable
  → no OpenAI request
```

The user supplies the evidence. The app does not search the web or retrieve live community
content. It has no database, authentication, analytics, saved-review history, automatic outreach,
posting, or recommendations. Current app state exists in browser memory and is cleared when that
page is refreshed or closed. After a successful review, **Download results** can create a local
`.txt` snapshot at the user's request. The app does not retain or manage downloaded files.

## Technology

- Next.js
- React
- TypeScript
- Zod
- OpenAI JavaScript/TypeScript SDK
- OpenAI Responses API
- Vitest

## Run locally

Prerequisites: Node.js LTS and npm.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` in `.env.local` for server-side
   analysis. Keep the value private: do not put a real key in `.env.example`, browser code, or Git.
   Never commit `.env.local`.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open <http://localhost:3000>.

The no-source path can be tried without an API request. An analysis request with supplied
evidence sends the research problem, community name, selected source types, excerpts, and optional
source metadata to OpenAI through the server. The API key remains server-side. Founder judgment
is not included in that request. The optional results download is generated client-side.

## Verify

```bash
npm test
npm run typecheck
npm run build
```

## Fictional example and limitations

The built-in balcony-gardening example uses fictional source material and a fictional community.
It does not represent a real community or real participants.

This proof of concept analyzes only the supplied material. Its limited observations do not
measure community-wide prevalence, frequency, or representativeness. Source and output validation
checks structure and references, not whether an interpretation is true. The app does not
automatically decide suitability or what action the founder should take.

## Attribution and license

Community Evidence Review is designed and developed by Lashachi Inc.

OpenAI is the AI/API technology provider. This attribution does not imply that OpenAI designed,
owns, sponsors, or endorses the project.

This project is licensed under the MIT License; see [LICENSE](LICENSE).
