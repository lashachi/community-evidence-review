---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. Run the source-entry workspace and fictional fixture**
  Becomes usable: A local browser app opens with the purpose statement, research-problem and community fields, editable separate source items, the two founder-selected source types, per-item character counts and inline limits, privacy notice, and “Try the example” loading the labeled fictional scenario. No model call is made yet.
  Why now: Bootstrapping is part of the first runnable behavior, not a separate infrastructure phase. This gives the learner a real place to inspect the source-item data and lets us verify input boundaries before sending anything to the provider. The evidence-analysis kernel follows immediately in Slice 2.
  PRD ref: `prd.md > The Core Journey`, `Screens and Layout`, `Features and Behavior > Establish the research`
  Spec ref: `spec.md > Stack`, `Where It Runs and How Someone Tries It`, `Look and Feel`, `Components > Review Workspace`, `Components > Fictional Demo Fixture`, `Data Model`, `File Structure`
  Build: Git has been initialized locally with explicit approval. Manually bootstrap the approved root file structure without overwriting existing curriculum files; write the local app shell, memory-only input workspace, source-item validation/counters, and the fictional fixture. Preserve and extend `.gitignore` for Next.js output while retaining existing secret/profile rules. Do not add an OpenAI key or call the API in this slice. Do not stage or commit this slice yet, per learner instruction.
  Verify (mechanical): Run `npm run typecheck` and `npm test`; start with `npm run dev` and confirm `http://localhost:3000` loads. Verify the fixture loads; required fields and two source types work; both allowed source-type values pass; an excerpt at 3,000 characters passes and one over the limit is blocked without alteration; six-field submissions cannot add a ninth item.
  Learner check: Open the local app, load the fictional example, inspect its separate source cards and visible type labels, then edit an excerpt and observe its character count and validation.
  Commit: `Add local evidence input workspace`

- [x] **2. Produce an evidence-grounded review from supplied items**
  Becomes usable: The founder can submit either the fictional fixture or their own valid source items and see a concise structured review. Original excerpts and metadata remain unchanged and distinct from analysis; each claim links to valid submitted source IDs; all five evidence distinctions appear in their specified forms.
  Why now: This is the unique kernel. It follows the immediately usable form so the actual model behavior is tested early, before adding more polish or secondary paths.
  PRD ref: `prd.md > Features and Behavior > Examine an evidence review`
  Spec ref: `spec.md > Components > Analysis API Route`, `Components > Review Contracts and Validation`, `Components > OpenAI Analysis Module`, `Data Model`, `External Services and Dependencies > OpenAI Responses API`
  Build: Add `POST /api/analyze`, server-side request checks, the small OpenAI-only module, GPT-5.6 Luna at low reasoning effort, one strict Structured Outputs request with no tools and no automatic retries, and backend schema/source-ID validation. Add the request notice and safe error state. Only after explaining provider data flow and current token cost, ask the learner to set up their own local API account/key; never ask them to send a key in chat. Do not create the account/key for them or enable billing.
  Verify (mechanical): `npm test` passed with 22/22 tests, `npm run typecheck` passed, and `npm run build` passed. The fictional fixture produced a schema-valid live review; its cited source IDs matched supplied items. Automated tests reject unknown IDs, invalid source types, malformed output, and a model-assigned Published Rule category. No further live API request is required before the Slice 2 commit.
  Learner check: Using only the fictional fixture (no real community data), inspect the original Direct Source Evidence alongside the Limited Observations, AI Inferences, and Unknowns; cited IDs corresponded to supplied sources. The initial live review exposed ambiguity in Supports / Weakens / Complicates / Context. The instructions and UI were clarified so these labels refer to the submitted research problem / proposed audience-problem fit, not merely whether a source substantiates an AI-written claim. In the corrected fictional live retest, supporting evidence remained supporting, the timer evidence weakened the problem fit, conditional travel/hot-weather evidence complicated it, and relevant nonresponsive background was context. The result made no unsupported community-wide prevalence claims, included useful Unknowns, and produced no numerical score, confidence rating, traffic-light rating, recommendation, post/don't-post decision, or overall AI verdict. Edit Inputs retained the fictional inputs for editing; browser refresh cleared in-page inputs as intended. The memory-only notice now says nothing is saved and advises copying or capturing information before refreshing or closing if it should be kept.
  Commit: `Add structured evidence analysis`

- [ ] **3. Complete unavailable, retry, judgment, and session behaviors**
  Becomes usable: The full PRD journey handles empty evidence, provider/validation failures with explicit retry, and the founder's replaceable “Your judgment” selection; no review data persists after refresh or close.
  Why now: These states depend on the end-to-end analysis path from Slice 2 and complete the agreed user journey without adding history, recovery storage, or recommendations.
  PRD ref: `prd.md > Features and Behavior > Handle unavailable evidence`, `Features and Behavior > Record the founder's judgment`, `States and Boundaries`
  Spec ref: `spec.md > Components > Review Workspace`, `Components > Analysis API Route`, `Components > Review Contracts and Validation`, `Important Failure Modes`, `Data Model`
  Build: Implemented the no-source unavailable explanation, memory-only validated submission snapshot, explicit “Try again” for analysis/API failure, separate “Edit inputs” action, and synchronous in-flight request guard. Successful normal reviews provide exactly “Investigate further,” “Not enough evidence yet,” and “Set aside” as replaceable founder judgments, held only in React state and outside analysis requests. Judgment clears when editing or beginning a new submission and is absent from the unavailable state. Updated only the successful-review memory-only warning to tell users to copy or capture the review before editing inputs, refreshing, closing, or leaving. No persistence, authentication, database, analytics, web search, scraping, live community retrieval, export, or additional AI provider was added.
  Verify (mechanical): TypeScript typecheck passed after the Slice 3 component implementation. Existing focused evidence-analysis tests passed (12/12): they confirm no-source analysis does not invoke the provider and provider failure does not automatically retry. There is no automated component test for “Try again” or founder judgment; no UI testing tooling was added. Static/code review confirmed retry uses the preserved submission snapshot, invokes the submission function once per accepted click, and has a synchronous in-flight guard. The failure screen/retry interaction was not runtime-tested; no failure was manufactured because there is no safe built-in failure simulation. No Git remote has been configured and nothing has been pushed.
  Learner check: **Manual zero-API checks completed:** the no-source unavailable state showed the submitted fictional problem and community with the unavailable explanation and no judgment controls; “Edit inputs” returned to the populated form. Refresh cleared manually entered problem/community with no source items. “Try the example” populated the fictional fixture with 5/8 source items without submitting analysis; refresh then cleared the problem, community, and all source items. **Manual controlled live check completed using only the built-in fictional balcony-gardening fixture:** one successful analysis displayed “Your judgment” with exactly the three approved choices and none preselected. “Investigate further” was displayed as the founder’s judgment, then replaced by “Set aside,” then by “Not enough evidence yet.” This demonstrated that the latter is a human judgment after a successful review, distinct from “Evidence review unavailable.” “Edit inputs” returned to the populated fictional problem/community/source form. The successful-review warning now advises copying/capturing before editing inputs, refreshing, closing, or leaving. No real community data, confidential information, customer information, or private Lashachi research information was used. **Not runtime-tested:** analysis-failure screen and visible “Try again” interaction. These are statically/code-reviewed only; no claim is made that the button was manually tested. Browser refresh and the listed editing/example journeys were manually checked; review-state clearing on refresh remains part of the approved manual verification.
  Commit: `Complete evidence review states and judgment`

## Hands-on Checkpoints

- [x] Early usable behavior explored — learner tried the fixture and source-item editing, verified required type selection and character limits, and approved Slice 1.
- [ ] Final kick-the-tires exploration and feedback completed — after Slice 3.

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions
- Slice 1 was approved after the learner's hands-on review and is committed locally as `0fc955c73d2e17e8015e8d4e1f3a2ce3c42a9739` (`Add local evidence input workspace`).
- The first fictional live review revealed that relationship labels could be read as describing whether a source supported an AI-written claim. Updated the analysis instructions, regression tests, and UI clarification so Supports / Weakens / Complicates / Context are explicitly relative to the submitted research problem / proposed audience-problem fit. The corrected fictional live retest demonstrated the intended classifications; no real community data was tested.
- Clarified the memory-only notice before analysis and on completed reviews after hands-on refresh testing confirmed that inputs and review clear when the page is refreshed. Slice 2 verification and learner checks are complete; `npm test` passed (22/22), typecheck passed, and production build passed. No additional live OpenAI request is required before the Slice 2 commit. Nothing has been staged or committed for Slice 2.