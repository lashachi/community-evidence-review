import { describe, expect, it, vi } from "vitest";
import {
  InvalidAnalysisRequestError,
  InvalidAnalysisResultError,
  analyzeEvidence,
} from "../lib/evidence-analysis";
import {
  AnalysisProviderError,
  analyzeWithOpenAI,
  REVIEW_INSTRUCTIONS,
} from "../lib/openai-analysis";
import {
  AnalysisResultSchema,
  SOURCE_TYPE_VALUES,
  type AnalysisResult,
  type ReviewInput,
} from "../lib/contracts";

const review: ReviewInput = {
  problem: "People forget to water small balcony plants.",
  community: "The Window Garden Exchange (fictional demo)",
  sourceItems: [
    {
      id: "source-rules",
      sourceType: "published_rules_or_community_description",
      excerpt: "Research questions are welcome when clearly labeled.",
      reference: null,
      publicationDate: null,
    },
    {
      id: "source-discussion",
      sourceType: "discussion_or_other_source_material",
      excerpt: "I forget to water my plants when work runs late.",
      reference: "Founder-supplied reference",
      publicationDate: null,
    },
  ],
};

const validAnalysis: AnalysisResult = {
  claims: [
    {
      kind: "limited_observation",
      relationship: "supports",
      summary: "One supplied item describes missed watering after late shifts.",
      explanation: "This is one report in the supplied material, not a community-wide pattern.",
      sourceItemIds: ["source-discussion"],
    },
    {
      kind: "ai_inference",
      relationship: "context",
      summary: "Schedule variability may be relevant to the problem.",
      explanation: "This is an interpretation of the single cited account, not an established fact.",
      sourceItemIds: ["source-discussion"],
    },
  ],
  unknowns: [{ summary: "The supplied items do not establish how common this problem is." }],
};

describe("evidence analysis orchestration", () => {
  it("returns a validated result with submitted source references", async () => {
    const provider = vi.fn(async () => validAnalysis);

    await expect(analyzeEvidence(review, provider)).resolves.toEqual({
      status: "complete",
      analysis: validAnalysis,
    });
    expect(provider).toHaveBeenCalledTimes(1);
    expect(provider).toHaveBeenCalledWith(review);
  });

  it("does not call the provider when there are no source items", async () => {
    const provider = vi.fn(async () => validAnalysis);

    await expect(analyzeEvidence({ ...review, sourceItems: [] }, provider)).resolves.toEqual({
      status: "unavailable",
    });
    expect(provider).not.toHaveBeenCalled();
  });

  it("rejects invalid requests before contacting the provider", async () => {
    const provider = vi.fn(async () => validAnalysis);
    const invalidReview = {
      ...review,
      sourceItems: [{ ...review.sourceItems[0], sourceType: "not-a-source-type" }],
    };

    await expect(analyzeEvidence(invalidReview, provider)).rejects.toBeInstanceOf(
      InvalidAnalysisRequestError,
    );
    expect(provider).not.toHaveBeenCalled();
  });

  it("rejects an analysis that cites a source ID not submitted in the request", async () => {
    const provider = vi.fn(async () => ({
      ...validAnalysis,
      claims: [{ ...validAnalysis.claims[0], sourceItemIds: ["not-submitted"] }],
    }));

    await expect(analyzeEvidence(review, provider)).rejects.toBeInstanceOf(
      InvalidAnalysisResultError,
    );
  });

  it("rejects duplicate source IDs on a claim", async () => {
    const provider = vi.fn(async () => ({
      ...validAnalysis,
      claims: [{ ...validAnalysis.claims[0], sourceItemIds: ["source-discussion", "source-discussion"] }],
    }));

    await expect(analyzeEvidence(review, provider)).rejects.toBeInstanceOf(
      InvalidAnalysisResultError,
    );
  });

  it("rejects malformed results and any model-assigned Published Rule kind", async () => {
    const malformed = vi.fn(async () => ({
      ...validAnalysis,
      claims: [{ ...validAnalysis.claims[0], kind: "published_rule" }],
    }));

    await expect(analyzeEvidence(review, malformed)).rejects.toBeInstanceOf(
      InvalidAnalysisResultError,
    );
  });

  it("does not automatically retry after a provider failure", async () => {
    const provider = vi.fn(async () => {
      throw new Error("provider unavailable");
    });

    await expect(analyzeEvidence(review, provider)).rejects.toThrow("provider unavailable");
    expect(provider).toHaveBeenCalledTimes(1);
  });
});

describe("analysis schema boundaries", () => {
  it("does not define a model-generated Published Rule category", () => {
    const invalidClaim = {
      ...validAnalysis,
      claims: [{ ...validAnalysis.claims[0], kind: "published_rule" }],
    };

    expect(SOURCE_TYPE_VALUES[0]).toBe("published_rules_or_community_description");
    expect(AnalysisResultSchema.safeParse(invalidClaim).success).toBe(false);
  });
});

describe("research-problem-relative relationship instructions", () => {
  it("defines every relationship relative to the submitted research problem and proposed fit", () => {
    expect(REVIEW_INSTRUCTIONS).toContain(
      "the relationship label describes how its cited supplied evidence relates to the submitted research problem and proposed audience-problem fit",
    );
    expect(REVIEW_INSTRUCTIONS).toContain(
      "It does not describe whether the source merely supports the wording or factual accuracy of the AI-generated observation or inference.",
    );
    expect(REVIEW_INSTRUCTIONS).toContain(
      "supports: the cited evidence tends to support or provide evidence in favour of the submitted research problem or proposed fit.",
    );
    expect(REVIEW_INSTRUCTIONS).toContain(
      "weakens: the cited evidence tends to contradict, reduce support for, or provide evidence against the submitted research problem or proposed fit.",
    );
    expect(REVIEW_INSTRUCTIONS).toContain(
      "complicates: the cited evidence qualifies the research problem or makes the apparent fit conditional, mixed, or less straightforward.",
    );
    expect(REVIEW_INSTRUCTIONS).toContain(
      "context: the cited evidence is relevant background but does not itself clearly support or weaken the submitted research problem or proposed fit.",
    );
  });

  it("does not treat an accurate timer observation as support when the source weakens the problem fit", () => {
    expect(REVIEW_INSTRUCTIONS).toContain(
      "do not label that evidence supports merely because it supports an accurate observation that the timer was sufficient.",
    );
    expect(REVIEW_INSTRUCTIONS).toContain(
      "evidence that the stated difficulty is not a problem tends to weaken the proposed fit.",
    );
  });
});

describe("OpenAI request configuration", () => {
  it("sends one strict Responses request with the approved model and no retrieval tools", async () => {
    const requestBodies: Array<Record<string, unknown>> = [];
    const fakeFetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      requestBodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
      return new Response(JSON.stringify({ error: { message: "Mocked failure" } }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    });

    vi.stubEnv("OPENAI_API_KEY", "test-key-not-a-real-credential");
    vi.stubGlobal("fetch", fakeFetch);
    try {
      await expect(analyzeWithOpenAI(review)).rejects.toBeInstanceOf(AnalysisProviderError);
    } finally {
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
    }

    expect(fakeFetch).toHaveBeenCalledTimes(1);
    expect(requestBodies).toHaveLength(1);
    expect(requestBodies[0]).toMatchObject({
      model: "gpt-5.6-luna",
      reasoning: { effort: "low" },
      store: false,
      max_output_tokens: 3000,
    });
    expect(requestBodies[0]).not.toHaveProperty("tools");
    expect(JSON.stringify(requestBodies[0])).toContain(review.sourceItems[0].excerpt);
    expect(JSON.stringify(requestBodies[0])).toContain(review.sourceItems[1].excerpt);

    const text = requestBodies[0].text as {
      format?: { type?: string; strict?: boolean; schema?: { properties?: Record<string, unknown> } };
    };
    expect(text.format?.type).toBe("json_schema");
    expect(text.format?.strict).toBe(true);
    expect(text.format?.schema?.properties).toHaveProperty("claims");
    expect(text.format?.schema?.properties).toHaveProperty("unknowns");
  });

  it("treats a timed-out provider request as a single failed attempt", async () => {
    let requestCount = 0;
    const fakeFetch = vi.fn(async () => {
      requestCount += 1;
      throw new DOMException("The request timed out.", "AbortError");
    });

    vi.stubEnv("OPENAI_API_KEY", "test-key-not-a-real-credential");
    vi.stubGlobal("fetch", fakeFetch);
    try {
      await expect(analyzeWithOpenAI(review)).rejects.toBeInstanceOf(AnalysisProviderError);
    } finally {
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
    }

    expect(requestCount).toBe(1);
  });
});
