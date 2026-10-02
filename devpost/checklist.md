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

- [ ] **2. Produce an evidence-grounded review from supplied items**
  Becomes usable: The founder can submit either the fictional fixture or their own valid source items and see a concise structured review. Original excerpts and metadata remain unchanged and distinct from analysis; each claim links to valid submitted source IDs; all five evidence distinctions appear in their specified forms.
  Why now: This is the unique kernel. It follows the immediately usable form so the actual model behavior is tested early, before adding more polish or secondary paths.
  PRD ref: `prd.md > Features and Behavior > Examine an evidence review`
  Spec ref: `spec.md > Components > Analysis API Route`, `Components > Review Contracts and Validation`, `Components > OpenAI Analysis Module`, `Data Model`, `External Services and Dependencies > OpenAI Responses API`
  Build: Add `POST /api/analyze`, server-side request checks, the small OpenAI-only module, GPT-5.6 Luna at low reasoning effort, one strict Structured Outputs request with no tools and no automatic retries, and backend schema/source-ID validation. Add the request notice and safe error state. Only after explaining provider data flow and current token cost, ask the learner to set up their own local API account/key; never ask them to send a key in chat. Do not create the account/key for them or enable billing.
  Verify (mechanical): Run `npm run typecheck`, `npm test`, and `npm run build`. With user-authorized local credentials, submit the fictional fixture and verify the route returns schema-valid output; automated contract tests reject unknown IDs, invalid source types, malformed output, and a Published Rule label from a discussion/other item. Separately compare the actual model result to the fixture quality checklist: source fidelity, five distinctions, mixed evidence, bounded observations, no score/recommendation, and unknowns. If a substantive check fails, stop and report the exact failure before changing one factor.
  Learner check: Run the local app, try the fictional scenario, inspect the original source next to the analysis, and trace each claim's source links. Notice that valid structure/reference checks do not prove the interpretation is correct.
  Commit: `Add structured evidence analysis`

- [ ] **3. Complete unavailable, retry, judgment, and session behaviors**
  Becomes usable: The full PRD journey handles empty evidence, provider/validation failures with explicit retry, and the founder's replaceable “Your judgment” selection; no review data persists after refresh or close.
  Why now: These states depend on the end-to-end analysis path from Slice 2 and complete the agreed user journey without adding history, recovery storage, or recommendations.
  PRD ref: `prd.md > Features and Behavior > Handle unavailable evidence`, `Features and Behavior > Record the founder's judgment`, `States and Boundaries`
  Spec ref: `spec.md > Components > Review Workspace`, `Components > Analysis API Route`, `Components > Review Contracts and Validation`, `Important Failure Modes`, `Data Model`
  Build: Add the no-source state that makes no API call and offers no judgment choices; distinguish missing evidence from evidence against a claim. Add a user-controlled “Try again” button that sends a new attempt, with SDK retries disabled. Add three neutral founder judgment choices only after a normal review, show the selection under “Your judgment,” allow replacement in current memory, and stop without saving or suggesting a next action. Refine the interface to the approved research-brief look and add no new infrastructure.
  Verify (mechanical): Run `npm run typecheck`, `npm test`, and `npm run build`. Tests confirm no-source and invalid input do not call the provider, explicit retry triggers exactly one new request, no automatic retry occurs, no judgment controls appear in unavailable state, judgment is excluded from requests, and refresh clears review state. Manually try the complete demo and founder-supplied journeys.
  Learner check: Refresh during an unsaved review and confirm it clears; reload “Try the example”; complete a normal review, change the founder judgment, and confirm nothing implies an AI recommendation or saved review.
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
- Slice 1 was approved after the learner's hands-on review. Its local Git checkpoint is deferred by explicit learner instruction; before Slice 2 implementation, obtain approval to stage only reviewed Slice 1 files and create the required local commit. No files were staged or committed here.