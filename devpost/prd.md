---
doc: prd
status: approved
---

# Community Evidence Review — Product Requirements

A calm, evidence-led research aid for an early-stage founder evaluating whether one public community may be useful for learning about one consumer problem. Source: `scope.md > Who It's For`, `The Unique Kernel`.

## The Core Journey

1. The founder opens a concise starting view that explains the purpose: examine evidence from one public community against one consumer problem, with the final judgment left to the founder. There is no onboarding, account, dashboard, or extra navigation. Source: `scope.md > The Core Loop`, `The POC Boundary`.
2. The founder establishes the consumer problem and the one public community to examine. A separate “Try the example” action loads a complete, clearly labeled fictional/demo problem and public-community scenario. Both paths lead into the same evidence-review experience. The exact method for supplying the community or source material is not defined here. Source: `scope.md > What "Working" Looks Like`, `The POC Boundary`.
3. If either required item is missing, the founder remains on the opening view and sees specific inline validation for each missing item. Existing entries are preserved; the product does not guess or generate the missing information. The fictional example action supplies both items as a clearly identified demo scenario.
4. If inspectable source material is available, the founder examines a structured evidence review. It distinguishes published rules, direct source evidence, limited observations, AI inference, and unknowns. Supporting, weakening, complicating, and contextual evidence are visible without a score or verdict. Source content remains visually distinct from AI explanation. Source-collection details are left open. Source: `scope.md > The Unique Kernel`, `What "Working" Looks Like`, `The POC Boundary`.
5. After a normal evidence review, the founder selects one conclusion in a separate “Your judgment” area: “Investigate further,” “Not enough evidence yet,” or “Set aside.” The product records and displays that choice as the founder's, allows it to be changed during the current review, and then stops. It does not validate the choice or recommend a next action. Source: `scope.md > The Unique Kernel`, `The POC Boundary`.
6. If no inspectable source material is available, the product shows “Evidence review unavailable,” explains what cannot be established, and stops without fabricating evidence or presenting the “Your judgment” choices. This is distinct from a normal review in which the founder inspects actual evidence and concludes “Not enough evidence yet.” Source: `scope.md > What "Working" Looks Like`, `The POC Boundary`.

## Screens and Layout

- **Opening view:** One focused starting surface with a short purpose statement, places to establish the research problem and community, and a “Try the example” action. The user can proceed only after both requirements are established. Missing requirements are identified inline. No onboarding, account, dashboard, or additional navigation.
- **Evidence review:** One structured research-brief-like surface. The problem and community remain identifiable. Evidence categories, source content, AI interpretation, uncertainty, and the final “Your judgment” area are clearly separated. The judgment area appears only after a normal evidence review.
- **Evidence review unavailable:** A distinct state within the core flow, not a separate error page or modal. It identifies the problem and community, states that no inspectable source material is available, and identifies what cannot be established. It does not show normal evidence or judgment controls.

## Look and Feel

A calm, credible research tool: clean and minimal, with strong typography, clear hierarchy, generous whitespace, restrained sections, subtle borders, and neutral surfaces. Use consistent labels for Published Rule, Direct Source Evidence, Limited Observation, AI Inference, and Unknown. Present source material as primary and inspectable; make the AI explanation visually secondary. Make provenance and uncertainty easy to scan. Supporting, weakening, complicating, and contextual evidence may be distinguished with neutral labels, icons, or restrained accents, not strong red/green verdict treatment. Clearly label fictional/demo material. No fixed brand palette was established.

Avoid chatbot styling, glowing or futuristic AI aesthetics, decorative gradients, excessive animation, gamification, scores or gauges, traffic-light verdicts, and visual treatments that make the AI seem more authoritative than its sources.

## Features and Behavior

### Establish the research

- The founder supplies or establishes one consumer problem and one public community before starting a review. This describes the user's need, not a technical input or collection method.
- “Try the example” provides both a fictional consumer problem and a fictionalized public-community scenario, along with fictional/demo source material sufficient to demonstrate the evidence-review experience. Every part of this scenario is visibly labeled fictional/demo and is not based on the learner's private MVPs, customers, or plans.
- Attempting to proceed without the research problem shows “Describe the consumer problem you want to investigate.”
- Attempting to proceed without the community shows “Identify the public community you want to examine.”
- If both are missing, both messages are visible. Any existing entry remains intact. The AI does not guess, invent, or automatically complete either item.
- **Acceptance criteria:** A review cannot start until both items are established. Missing-field feedback is clear, specific, inline, and preserves entered information. “Try the example” establishes both items without requiring either to be entered separately.

### Examine an evidence review

- When inspectable material is available, the review identifies the research problem and community and presents evidence in a structured, non-chat interface.
- Keep source material visibly separate from the AI's interpretation. An evidence item may include a short source identifier or title, the relevant original excerpt/content, an inspectable source location/reference when available, publication date when available, an evidence relationship (supports, weakens, complicates, or context), and a short AI explanation of relevance.
- Do not rewrite or paraphrase a source and present that text as the original. If a source location/reference or date is unavailable, show that it is unavailable; do not invent metadata.
- Apply these labels and meanings consistently:
  - **Published Rule:** An explicit statement from published community rules or description. Show it only when that actual rule material is available for inspection; otherwise leave it unknown.
  - **Direct Source Evidence:** Specific, inspectable source material relevant to the research problem. The source itself is distinct from any AI explanation.
  - **Limited Observation:** A description of what appears in the source items actually examined. Any item counts refer only to that examined material; do not generalize to the community as a whole.
  - **AI Inference:** An interpretation derived from available source material, clearly identified as inference rather than fact.
  - **Unknown:** Something the available material does not establish.
- Show evidence that supports fit as well as evidence that weakens or complicates it; contextual material may also be shown. Do not hide contradictory evidence.
- Do not claim prevalence, representativeness, frequency, or community-wide patterns unless the evidence and sampling method available support the specific claim. Do not convert missing evidence into evidence that a claim is false.
- Do not present unsupported AI-generated claims as evidence. The AI organizes evidence and explains its interpretation; the researcher inspects sources and decides what they establish.
- Do not generate a numerical fit or confidence score, traffic-light rating, “good/bad community” label, or recommendation such as “you should post here.”
- **Acceptance criteria:** Each displayed evidence item allows the founder to distinguish original source material from AI interpretation, inspect its source context when available, see missing metadata marked unavailable, and tell whether the item supports, weakens, complicates, or contextualizes the research problem. Inferences and unknowns are separately labeled. Observations remain bounded to examined items.

### Handle unavailable evidence

- When no inspectable source material is available, do not generate a normal evidence review.
- Show a neutral “Evidence review unavailable” state that identifies the research problem and community, says no inspectable source material is available, and explains what cannot be established from the available evidence.
- Distinguish “No evidence available to establish this” from evidence that shows something is not true.
- Do not reconstruct published rules from general knowledge, fill the gap with assumed community characteristics, invented excerpts, community-wide claims, substitute sources, or an automatic search elsewhere.
- Do not show the three “Your judgment” choices or record the unavailable state as the founder's judgment. The founder has not completed an evidence-grounded review. Stop without an AI recommendation or substitute conclusion.
- **Acceptance criteria:** With no inspectable source material, the unavailable state appears instead of normal evidence or judgment controls, identifies what cannot be established, and does not invent or retrieve substitute evidence.

### Record the founder's judgment

- Only after a normal evidence review, show a visually separate “Your judgment” area with three neutral choices: “Investigate further,” “Not enough evidence yet,” and “Set aside.”
- The founder makes the selection; the AI does not preselect, recommend, score, endorse, validate, or label any choice as correct.
- Immediately after selection, display it under “Your judgment” as the founder's recorded conclusion based on their review of the evidence.
- The founder can change the selection during the current review; the new selection replaces the previous one. Selecting the active choice again clears it, leaving the review with no founder judgment selected. No judgment history or audit trail is required.
- The selected judgment remains visible for the current review/session, but does not need to persist after leaving and returning. “Download results” explicitly creates a plain-text snapshot on the user's device when requested; the application does not retain, manage, or reopen it. This is distinct from saved reviews, which remain out of scope.
- Once selected, the review is complete. The founder may still explicitly download its current results or edit inputs; no celebratory success state, AI confirmation, automatic outreach, post, lead collection, alternative community recommendation, or other next-step suggestion follows.
- **Acceptance criteria:** A founder can select each of the three choices after a normal review, see the selected choice explicitly attributed to them, replace it during that review, or clear the active choice by selecting it again. The review may have no founder judgment; downloading results in that state records “No founder judgment selected.” No judgment choices or recorded judgment appear in the evidence-unavailable state.

## States and Boundaries

- **First use:** The opening view explains the purpose and enables the core task without onboarding, account creation, dashboard, or extra navigation.
- **Missing research problem or community:** Remain on the opening view, show one specific inline message per missing requirement, show both when both are missing, preserve existing entries, and do not let the review begin.
- **Fictional demo:** Clearly label the problem, community scenario, and source items as fictional/demo. The fixture includes material demonstrating all five evidence distinctions and both supporting and weakening/complicating evidence.
- **Normal evidence review:** Show source-grounded evidence and the five distinctions with provenance, uncertainty, and bounded observations. The founder may then record and change their own judgment in the current session.
- **Evidence review unavailable:** No inspectable source material means no normal review and no judgment controls. Show what cannot be established and stop without filling gaps or recommending.
- **Unavailable source context:** Missing date, location/reference, or published rules are shown as unavailable or unknown, never invented.
- **Session boundary:** A judgment may be changed while the current review remains open. Reviews and judgments do not need to persist after leaving the application; no history is kept.

## Product Decisions

- Keep the product generic and independent of the learner's private MVPs, customers, and future plans; use a fictional/demo research scenario. Source: `scope.md > The POC Boundary`, `Explicitly Cut`.
- Focus on one public community and one consumer problem; do not rank communities. Source: `scope.md > The Core Loop`, `The POC Boundary`.
- Preserve the five evidence distinctions and avoid claims beyond inspected sources and the sampling method. The researcher makes the final judgment. Source: `scope.md > The Unique Kernel`, `What "Working" Looks Like`.
- Use a structured evidence review, not a chatbot-first interface. Conversational follow-up is outside the core POC and deferred; it is not part of this hackathon build.
- Separate insufficient evidence after an actual review from absence of inspectable material that prevents a review. Only a normal review offers the founder's three judgment choices.
- Working title follows the approved scope heading, “Community Evidence Review”; no separate product name was chosen.
- The judgment is replaceable during the current review only; no decision history or cross-session persistence is needed.

## What We're Building

A minimal opening view, a “Try the example” path, a structured evidence review for one public community and one consumer problem, an honest evidence-unavailable state, and a founder-controlled judgment area after a normal review. The experience makes source provenance, the five evidence distinctions, supporting and complicating evidence, and uncertainty inspectable.

## Deferred From the POC

- Application-managed saved reviews, saved judgments, or decision history: the current-review judgment and optional user-initiated local text snapshot are sufficient for the proof of concept. The application does not retain, manage, or reopen downloaded snapshots.
- Conversational follow-up: explicitly deferred and outside this POC; it is not part of the hackathon build.
- Multiple-community comparison, ranking, individual lead generation, sales prospecting, and a full customer-discovery platform: outside the single-community proof of concept.
- Automated outreach, posting, further searches, or recommendations: the product stops after the founder's judgment or at the evidence-unavailable boundary.

## Possible Later Enhancements

Conversational follow-up could be considered for a future version beyond this hackathon if a separate need arises. Saved reviews or judgments could also be revisited later if a demonstrated need arises.

## Non-Goals

- Decide whether the founder should approach or post to a community; the founder retains that judgment.
- Score, rank, or label communities, or treat the AI's interpretation as authoritative.
- Infer rules, audience fit, prevalence, representativeness, frequency, or community-wide patterns without inspectable supporting material and an adequate sampling method.
- Fill an evidence gap with general AI knowledge, fabricated content, substitute sources, or automatic searching.
- Generate outreach, collect individual leads, save judgment history, or manage the wider customer-discovery process.
- Use or reveal the learner's private MVPs, customers, or future product plans.

## Open Questions

- How the founder supplies or identifies the community, and how inspectable source material is obtained: leave unresolved for `4-spec`; the PRD defines the user need and evidence behavior only.
- Which public source materials and sourcing method can be used within the POC while making each item inspectable: resolve during `4-spec` before implementation.
- Which AI provider and technical approach, if any, will produce the labeled inferences: resolve during `4-spec`; no provider or implementation is selected here.
- The exact fictional consumer problem, community scenario, and source content: select when defining the demo data, ensuring every item is clearly fictional, inspectable within the demo, and collectively demonstrates the required evidence distinctions and mixed evidence.
- How to handle partial source availability beyond the specified no-inspectable-source state: determine in `4-spec` if the chosen sourcing approach makes this behavior necessary; do not fill gaps with unsupported claims.