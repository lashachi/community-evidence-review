"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  countCharacters,
  AnalyzeResponseSchema,
  MAX_EXCERPT_CHARACTERS,
  MAX_SOURCE_ITEMS,
  SOURCE_TYPE_LABELS,
  SOURCE_TYPE_VALUES,
  validateReviewInput,
  type ReviewInput,
  type SourceItem,
  type SourceType,
} from "@/lib/contracts";
import { createDemoReview } from "@/lib/demo-fixture";

type WorkspaceStage = "editing" | "analyzing" | "review" | "error" | "unavailable";
type DraftSourceItem = Omit<SourceItem, "sourceType"> & { sourceType: SourceType | "" };
type FounderJudgment = "Investigate further" | "Not enough evidence yet" | "Set aside";
const FOUNDER_JUDGMENTS: FounderJudgment[] = [
  "Investigate further",
  "Not enough evidence yet",
  "Set aside",
];
const RELATIONSHIP_LABELS = {
  supports: "Supports",
  weakens: "Weakens",
  complicates: "Complicates",
  context: "Context",
} as const;

function makeSourceItem(): DraftSourceItem {
  return {
    id: crypto.randomUUID(),
    sourceType: "",
    excerpt: "",
    reference: null,
    publicationDate: null,
  };
}

export default function ReviewWorkspace() {
  const [problem, setProblem] = useState("");
  const [community, setCommunity] = useState("");
  const [sourceItems, setSourceItems] = useState<DraftSourceItem[]>([]);
  const [attemptedContinue, setAttemptedContinue] = useState(false);
  const [stage, setStage] = useState<WorkspaceStage>("editing");
  const [analysis, setAnalysis] = useState<Extract<
    ReturnType<typeof AnalyzeResponseSchema.parse>,
    { status: "complete" }
  >["analysis"] | null>(null);
  const [requestError, setRequestError] = useState("");
  const [submittedSnapshot, setSubmittedSnapshot] = useState<ReviewInput | null>(null);
  const [founderJudgment, setFounderJudgment] = useState<FounderJudgment | null>(null);
  const requestInProgress = useRef(false);

  const validation = validateReviewInput({ problem, community, sourceItems });
  const errors = attemptedContinue && !validation.success ? validation.errors : { items: {} };

  function updateSourceItem(
    itemId: string,
    field: "sourceType" | "excerpt" | "reference" | "publicationDate",
    value: string,
  ) {
    setSourceItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;
        if (field === "sourceType") return { ...item, sourceType: value as SourceType | "" };
        if (field === "excerpt") return { ...item, excerpt: value };
        return { ...item, [field]: value || null };
      }),
    );
  }

  function loadExample() {
    const example = createDemoReview();
    setProblem(example.problem);
    setCommunity(example.community);
    setSourceItems(example.sourceItems.map((item) => ({ ...item })));
    setAttemptedContinue(false);
    setAnalysis(null);
    setRequestError("");
    setSubmittedSnapshot(null);
    setFounderJudgment(null);
    setStage("editing");
  }

  function addSourceItem() {
    if (sourceItems.length >= MAX_SOURCE_ITEMS) return;
    setSourceItems((current) => [...current, makeSourceItem()]);
  }

  function removeSourceItem(itemId: string) {
    setSourceItems((current) => current.filter((item) => item.id !== itemId));
  }

  async function submitAnalysis(submission: ReviewInput) {
    if (requestInProgress.current) return;
    requestInProgress.current = true;
    setStage("analyzing");
    setAnalysis(null);
    setRequestError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      const body: unknown = await response.json();

      if (!response.ok) {
        const errorMessage =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof body.error === "string"
            ? body.error
            : "The review could not be completed. Your source material remains in this page.";
        setRequestError(
          errorMessage,
        );
        setStage("error");
        return;
      }

      const result = AnalyzeResponseSchema.safeParse(body);
      if (!result.success || result.data.status !== "complete") {
        setRequestError("The server returned a review that could not be safely validated.");
        setStage("error");
        return;
      }

      setAnalysis(result.data.analysis);
      setSubmittedSnapshot(null);
      setStage("review");
    } catch {
      setRequestError(
        "The review could not be completed. Your source material remains in this page.",
      );
      setStage("error");
    } finally {
      requestInProgress.current = false;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttemptedContinue(true);

    if (!validation.success) return;
    const submission = validation.data;
    setSubmittedSnapshot(submission);
    setFounderJudgment(null);
    setAnalysis(null);
    setRequestError("");
    if (submission.sourceItems.length === 0) {
      setStage("unavailable");
      return;
    }

    await submitAnalysis(submission);
  }

  async function retryAnalysis() {
    if (!submittedSnapshot) return;
    await submitAnalysis(submittedSnapshot);
  }

  function editInputs() {
    setStage("editing");
    setAttemptedContinue(false);
    setAnalysis(null);
    setRequestError("");
    setSubmittedSnapshot(null);
    setFounderJudgment(null);
  }

  function downloadResults() {
    if (stage !== "review" || !analysis) return;

    const lines = [
      "Community Evidence Review",
      "",
      "AI-assisted evidence review",
      "Problem: " + problem,
      "Community: " + community,
      "",
      "Direct Source Evidence",
    ];

    sourceItems.forEach((item, index) => {
      lines.push(
        "",
        `Source ${index + 1} — ${SOURCE_TYPE_LABELS[item.sourceType as SourceType]}`,
        `Reference: ${item.reference || "Not supplied"}`,
        `Publication date: ${item.publicationDate || "Not supplied"}`,
        "Original supplied material:",
        item.excerpt,
      );
    });

    lines.push("", "AI-assisted findings");
    analysis.claims.forEach((claim) => {
      const citedSources = claim.sourceItemIds
        .map((sourceId) => {
          const sourceIndex = sourceItems.findIndex((item) => item.id === sourceId);
          return sourceIndex >= 0 ? `Source ${sourceIndex + 1}` : null;
        })
        .filter((source) => source !== null);
      lines.push(
        "",
        claim.kind === "limited_observation" ? "Limited Observation" : "AI Inference",
        `Relationship to the research problem: ${RELATIONSHIP_LABELS[claim.relationship]}`,
        `Finding: ${claim.summary}`,
        `Explanation: ${claim.explanation}`,
        `Source items: ${citedSources.join(", ")}`,
      );
    });

    lines.push("", "Unknowns");
    if (analysis.unknowns.length) {
      analysis.unknowns.forEach((unknown) => lines.push(`- ${unknown.summary}`));
    } else {
      lines.push("No unknowns were returned.");
    }

    lines.push(
      "",
      "Your judgment",
      founderJudgment ?? "No founder judgment selected.",
      "",
      "The findings above are AI-assisted analysis of supplied material. Any selected judgment above is the founder's own decision.",
    );

    const file = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "community-evidence-review.txt";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
  }

  return (
    <div className="page-shell">
      <header className="masthead">
        <p className="wordmark">COMMUNITY EVIDENCE REVIEW</p>
        <span className="local-mark">Local workspace</span>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">Problem discovery · one community</p>
        <h1 id="page-title">Look closely at the evidence before deciding what it means.</h1>
        <p className="intro-copy">
          Examine source material from one public community against one consumer problem. The
          evidence review is designed to support your judgment, not make it for you.
        </p>
      </section>

      <div className="demo-callout">
        <p className="demo-copy">
          <strong>Start with a fictional example</strong>
          Load invented source material to explore the workspace. It is not analysis of a real
          community or a real product idea.
        </p>
        <button className="button button-secondary" onClick={loadExample} type="button">
          Try the example
        </button>
      </div>

      {stage === "editing" ? (
        <form noValidate onSubmit={handleSubmit}>
          <section aria-labelledby="research-heading">
            <div className="section-heading">
              <h2 id="research-heading">Set the research context</h2>
              <p>Both fields are required.</p>
            </div>

            <div className="research-fields">
              <div className="field-block">
                <label className="field-label" htmlFor="research-problem">
                  Consumer problem or research question
                </label>
                <span className="field-hint">
                  Describe the problem you want to learn about, without assuming the answer.
                </span>
                <textarea
                  aria-describedby={errors.problem ? "problem-error" : undefined}
                  aria-invalid={Boolean(errors.problem)}
                  aria-required="true"
                  id="research-problem"
                  onChange={(event) => setProblem(event.target.value)}
                  placeholder="What recurring consumer problem do you want to understand?"
                  value={problem}
                />
                {errors.problem ? (
                  <p className="field-error" id="problem-error" role="alert">
                    {errors.problem}
                  </p>
                ) : null}
              </div>

              <div className="field-block">
                <label className="field-label" htmlFor="community-name">
                  Public community
                </label>
                <span className="field-hint">
                  Identify one community. This app will not fetch or verify it.
                </span>
                <input
                  aria-describedby={errors.community ? "community-error" : undefined}
                  aria-invalid={Boolean(errors.community)}
                  aria-required="true"
                  id="community-name"
                  onChange={(event) => setCommunity(event.target.value)}
                  placeholder="Name of the public community"
                  type="text"
                  value={community}
                />
                {errors.community ? (
                  <p className="field-error" id="community-error" role="alert">
                    {errors.community}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section aria-labelledby="sources-heading">
            <div className="section-heading">
              <h2 id="sources-heading">Source material</h2>
              <p>{sourceItems.length} / {MAX_SOURCE_ITEMS} items</p>
            </div>
            <p className="field-hint">
              Each excerpt is a separate source item. Choose its source type yourself; the app does
              not authenticate the source or its metadata.
            </p>

            {errors.sourceItems ? (
              <p className="field-error" role="alert">{errors.sourceItems}</p>
            ) : null}

            {sourceItems.length > 0 ? (
              <div className="source-list">
                {sourceItems.map((item, index) => {
                  const itemErrors = errors.items[item.id] ?? {};
                  const excerptCount = countCharacters(item.excerpt);
                  const excerptTooLong = excerptCount > MAX_EXCERPT_CHARACTERS;

                  return (
                    <article className="source-card" key={item.id}>
                      <div className="source-heading">
                        <h3>Source item {index + 1}</h3>
                        <span className="source-number">{index + 1} of {MAX_SOURCE_ITEMS}</span>
                      </div>

                      <div className="source-type-row">
                        <div>
                          <label className="source-label" htmlFor={`source-type-${item.id}`}>
                            Source type
                          </label>
                          <select
                            aria-describedby={itemErrors.sourceType ? `source-type-error-${item.id}` : undefined}
                            aria-invalid={Boolean(itemErrors.sourceType)}
                            aria-required="true"
                            id={`source-type-${item.id}`}
                            onChange={(event) => updateSourceItem(item.id, "sourceType", event.target.value as SourceType)}
                            value={item.sourceType}
                          >
                            <option disabled value="">Choose a source type</option>
                            {SOURCE_TYPE_VALUES.map((sourceType) => (
                              <option key={sourceType} value={sourceType}>
                                {SOURCE_TYPE_LABELS[sourceType]}
                              </option>
                            ))}
                          </select>
                          {itemErrors.sourceType ? (
                            <p className="field-error" id={`source-type-error-${item.id}`} role="alert">
                              {itemErrors.sourceType}
                            </p>
                          ) : null}
                        </div>

                        <div>
                          <label className="source-label" htmlFor={`source-excerpt-${item.id}`}>
                            Original source excerpt / content
                          </label>
                          <textarea
                            aria-describedby={`source-count-${item.id}${itemErrors.excerpt ? ` source-error-${item.id}` : ""}`}
                            aria-invalid={Boolean(itemErrors.excerpt) || (attemptedContinue && excerptTooLong)}
                            id={`source-excerpt-${item.id}`}
                            onChange={(event) => updateSourceItem(item.id, "excerpt", event.target.value)}
                            placeholder="Paste the relevant source text here. The text will remain exactly as entered."
                            value={item.excerpt}
                          />
                          <div className="excerpt-meta">
                            <span id={`source-count-${item.id}`} aria-live="polite">
                              {excerptCount.toLocaleString()} / {MAX_EXCERPT_CHARACTERS.toLocaleString()}
                            </span>
                            <span>Required · not automatically shortened</span>
                          </div>
                          {itemErrors.excerpt ? (
                            <p className="field-error" id={`source-error-${item.id}`} role="alert">
                              {itemErrors.excerpt}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="source-metadata">
                        <div>
                          <label className="source-label" htmlFor={`source-reference-${item.id}`}>
                            Source reference <span className="field-hint">Optional; recorded only, never fetched or verified.</span>
                          </label>
                          <input
                            id={`source-reference-${item.id}`}
                            onChange={(event) => updateSourceItem(item.id, "reference", event.target.value)}
                            placeholder="URL or another useful identifier"
                            type="text"
                            value={item.reference ?? ""}
                          />
                        </div>
                        <div>
                          <label className="source-label" htmlFor={`source-date-${item.id}`}>
                            Publication date <span className="field-hint">Optional; supplied, not verified.</span>
                          </label>
                          <input
                            id={`source-date-${item.id}`}
                            onChange={(event) => updateSourceItem(item.id, "publicationDate", event.target.value)}
                            placeholder="As shown by your source"
                            type="text"
                            value={item.publicationDate ?? ""}
                          />
                        </div>
                      </div>

                      <div className="source-actions">
                        <button className="button button-quiet" onClick={() => removeSourceItem(item.id)} type="button">
                          Remove source item
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-sources">
                <p>No source items added yet.</p>
                <span>Add separate excerpts, or continue with none to see why a review cannot be completed.</span>
              </div>
            )}

            <div className="source-actions add-source-row">
              <button
                className="button button-secondary"
                disabled={sourceItems.length >= MAX_SOURCE_ITEMS}
                onClick={addSourceItem}
                type="button"
              >
                Add source item
              </button>
            </div>
            {sourceItems.length >= MAX_SOURCE_ITEMS ? (
              <p className="source-list-message">The POC accepts at most eight separate source items.</p>
            ) : null}
          </section>

          <aside className="privacy-note" aria-label="Source material privacy notice">
            <strong>Use public, non-sensitive material only.</strong> When you submit a review, the
            problem, community name, and each source item’s selected type, unchanged excerpt, and
            optional reference/date are sent to OpenAI for analysis. Do not submit confidential
            company information, private community content, credentials, or personal or sensitive
            information. The app does not save or log review content; OpenAI’s standard API abuse
            monitoring may retain submitted content under its current policy.
          </aside>

          <div className="form-footer">
            <p>
              Nothing is saved. Your inputs and review exist only in this browser page and will be
              lost if you refresh or close it. If you want to keep the information, copy it or
              capture it before leaving this page.
            </p>
            <button className="button button-primary" type="submit">
              {sourceItems.length === 0 ? "Continue without source material" : "Analyze supplied evidence"}
            </button>
          </div>
        </form>
      ) : (
        <section className="result-state" aria-live="polite" aria-busy={stage === "analyzing"}>
          {stage === "analyzing" ? (
            <>
              <p className="eyebrow">Evidence review</p>
              <h2>Reviewing the supplied material</h2>
              <p>Your source items are being analyzed. This may take a little while.</p>
            </>
          ) : null}
          {stage === "unavailable" ? (
            <>
              <p className="eyebrow">Evidence review</p>
              <h2>Evidence review unavailable</h2>
              <p><strong>Problem:</strong> {problem}</p>
              <p><strong>Community:</strong> {community}</p>
              <p>
                Without supplied source evidence, this review cannot establish how evidence relates
                to the submitted research problem. No analysis or judgment is available.
              </p>
            </>
          ) : null}
          {stage === "error" ? (
            <>
              <p className="eyebrow">Evidence review</p>
              <h2>Review could not be completed</h2>
              <p role="alert">{requestError}</p>
              <p>No partial findings are shown. Your entered material remains in this page.</p>
            </>
          ) : null}
          {stage === "review" && analysis ? (
            <div className="review-content">
              {sourceItems.some((item) => item.id.startsWith("demo-")) ? (
                <p><span className="demo-stamp">Fictional demo material</span></p>
              ) : null}
              <p className="eyebrow">Evidence review · supplied material only</p>
              <h2>What the supplied evidence may indicate</h2>
              <p><strong>Problem:</strong> {problem}</p>
              <p><strong>Community:</strong> {community}</p>
              <p className="review-disclaimer">
                The original source items below are shown separately from AI-generated analysis.
                Validation checks structure and source references, not whether an interpretation is
                correct. You make the judgment; this review provides no score or recommendation.
              </p>
              <section className="review-section" aria-labelledby="direct-evidence-heading">
                <h3 id="direct-evidence-heading">Direct Source Evidence</h3>
                <div className="source-list">
                  {sourceItems.map((item, index) => (
                    <article className="source-card source-card-readonly" id={`source-item-${item.id}`} key={item.id}>
                      <div className="source-heading">
                        <h4>Source item {index + 1}</h4>
                        <span className="source-number">Submitted source</span>
                      </div>
                      <p className="evidence-label">{SOURCE_TYPE_LABELS[item.sourceType as SourceType]}</p>
                      {item.sourceType === "published_rules_or_community_description" ? (
                        <p className="source-provenance">
                          Published Rule · founder-designated source type; not independently verified
                        </p>
                      ) : null}
                      <blockquote>{item.excerpt}</blockquote>
                      <dl className="source-details">
                        <div><dt>Reference</dt><dd>{item.reference || "Not supplied"}</dd></div>
                        <div><dt>Publication date</dt><dd>{item.publicationDate || "Not supplied"}</dd></div>
                      </dl>
                    </article>
                  ))}
                </div>
              </section>

              <section className="review-section" aria-labelledby="analysis-claims-heading">
                <h3 id="analysis-claims-heading">Limited Observation and AI Inference</h3>
                <p>
                  Supports, Weakens, Complicates, and Context describe how the cited evidence
                  relates to the research problem—not whether it verifies the wording of a claim.
                </p>
                {analysis.claims.length ? (
                  <div className="claim-list">
                    {analysis.claims.map((claim, index) => (
                      <article className="analysis-claim" key={`${claim.kind}-${index}`}>
                        <div className="claim-labels">
                          <span className="claim-kind">
                            {claim.kind === "limited_observation" ? "Limited Observation" : "AI Inference"}
                          </span>
                          <span className="claim-relationship">
                            {RELATIONSHIP_LABELS[claim.relationship]}
                          </span>
                        </div>
                        <h4>{claim.summary}</h4>
                        <p>{claim.explanation}</p>
                        <div className="claim-sources">
                          <strong>Source items:</strong>
                          {claim.sourceItemIds.map((sourceId) => {
                            const sourceIndex = sourceItems.findIndex((item) => item.id === sourceId);
                            return (
                              <a href={`#source-item-${sourceId}`} key={sourceId}>
                                Source {sourceIndex + 1}
                              </a>
                            );
                          })}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p>No limited observations or inferences were returned.</p>
                )}
              </section>

              <section className="review-section" aria-labelledby="unknowns-heading">
                <h3 id="unknowns-heading">Unknown</h3>
                {analysis.unknowns.length ? (
                  <ul className="unknown-list">
                    {analysis.unknowns.map((unknown, index) => (
                      <li key={`${unknown.summary}-${index}`}>{unknown.summary}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No unknowns were returned. This does not mean the supplied items establish every relevant fact.</p>
                )}
              </section>

              <section className="review-section" aria-labelledby="founder-judgment-heading">
                <h3 id="founder-judgment-heading">Your judgment</h3>
                <p>Choose the conclusion that reflects your judgment of this review.</p>
                <div className="source-actions">
                  {FOUNDER_JUDGMENTS.map((judgment) => (
                    <button
                      aria-pressed={founderJudgment === judgment}
                      className={`button button-secondary${founderJudgment === judgment ? " judgment-selected" : ""}`}
                      key={judgment}
                      onClick={() =>
                        setFounderJudgment((current) => (current === judgment ? null : judgment))
                      }
                      type="button"
                    >
                      <span aria-hidden="true">{founderJudgment === judgment ? "✓ " : ""}</span>
                      {judgment}
                    </button>
                  ))}
                </div>
                {founderJudgment ? (
                  <p aria-live="polite">
                    Your selected conclusion is your judgment: <strong>{founderJudgment}</strong>.
                  </p>
                ) : null}
                <button
                  className="button button-secondary"
                  onClick={downloadResults}
                  type="button"
                >
                  Download results
                </button>
                <p className="memory-only-notice">
                  Nothing is saved by this app. Download, copy, or capture your review and judgment
                  before editing inputs, refreshing, closing this page, or leaving if you want to
                  keep them.
                </p>
              </section>
            </div>
          ) : null}
          {stage !== "analyzing" ? (
            <>
              {stage === "error" && submittedSnapshot ? (
                <button
                  className="button button-primary"
                  onClick={retryAnalysis}
                  type="button"
                >
                  Try again
                </button>
              ) : null}
              <button className="button button-secondary" onClick={editInputs} type="button">
                Edit inputs
              </button>
            </>
          ) : null}
        </section>
      )}
      <footer className="site-footer">Designed and developed by Lashachi Inc.</footer>
    </div>
  );
}