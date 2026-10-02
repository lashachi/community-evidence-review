"use client";

import { useState, type FormEvent } from "react";
import {
  countCharacters,
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

type WorkspaceStage = "editing" | "ready" | "unavailable";
type DraftSourceItem = Omit<SourceItem, "sourceType"> & { sourceType: SourceType | "" };

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
    setStage("editing");
  }

  function addSourceItem() {
    if (sourceItems.length >= MAX_SOURCE_ITEMS) return;
    setSourceItems((current) => [...current, makeSourceItem()]);
  }

  function removeSourceItem(itemId: string) {
    setSourceItems((current) => current.filter((item) => item.id !== itemId));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttemptedContinue(true);
    setStage("editing");

    if (!validation.success) return;
    setStage(sourceItems.length === 0 ? "unavailable" : "ready");
  }

  function editInputs() {
    setStage("editing");
    setAttemptedContinue(false);
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
            <strong>Use public, non-sensitive material only.</strong> When analysis is connected in a
            later slice, excerpts submitted for analysis will be sent to OpenAI. Do not submit
            confidential company information, private community content, credentials, or personal
            or sensitive information. In this slice, checks are local only; nothing is sent to an
            external service.
          </aside>

          <div className="form-footer">
            <p>
              Your entries stay in this page only and clear on refresh or close. No review or
              judgment is saved.
            </p>
            <button className="button button-primary" type="submit">
              Check details locally
            </button>
          </div>
        </form>
      ) : (
        <section className="result-state" aria-live="polite" role="status">
          {stage === "unavailable" ? (
            <>
              <p className="eyebrow">Local input check</p>
              <h2>Evidence review unavailable</h2>
              <p><strong>Problem:</strong> {problem}</p>
              <p><strong>Community:</strong> {community}</p>
              <p>
                No inspectable source material was supplied, so an evidence-grounded review cannot
                be completed. Nothing has been sent to an AI service, and no judgment is available.
              </p>
            </>
          ) : (
            <>
              {sourceItems.some((item) => item.id.startsWith("demo-")) ? (
                <p><span className="demo-stamp">Fictional demo material</span></p>
              ) : null}
              <p className="eyebrow">Local input check</p>
              <h2>Details are ready for review</h2>
              <p><strong>Problem:</strong> {problem}</p>
              <p><strong>Community:</strong> {community}</p>
              <p>
                {sourceItems.length} separate source items passed local checks. This Slice 1 build
                does not analyze them; nothing was sent outside this browser. Passing validation
                does not verify the source, metadata, or content.
              </p>
            </>
          )}
          <button className="button button-secondary" onClick={editInputs} type="button">
            Edit inputs
          </button>
        </section>
      )}
    </div>
  );
}