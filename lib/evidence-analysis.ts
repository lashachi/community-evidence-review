import {
  AnalysisResultSchema,
  ReviewInputSchema,
  type AnalysisResult,
  type ReviewInput,
} from "./contracts";
import { analyzeWithOpenAI } from "./openai-analysis";

export class InvalidAnalysisRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAnalysisRequestError";
  }
}

export class InvalidAnalysisResultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAnalysisResultError";
  }
}

type AnalysisProvider = (review: ReviewInput) => Promise<unknown>;

export async function analyzeEvidence(
  input: unknown,
  provider: AnalysisProvider = analyzeWithOpenAI,
): Promise<{ status: "unavailable" } | { status: "complete"; analysis: AnalysisResult }> {
  const parsedInput = ReviewInputSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new InvalidAnalysisRequestError("The submitted research details are invalid.");
  }

  if (parsedInput.data.sourceItems.length === 0) {
    return { status: "unavailable" };
  }

  const rawResult = await provider(parsedInput.data);
  const parsedResult = AnalysisResultSchema.safeParse(rawResult);
  if (!parsedResult.success) {
    throw new InvalidAnalysisResultError("The provider returned a malformed evidence review.");
  }

  const submittedIds = new Set(parsedInput.data.sourceItems.map((item) => item.id));
  for (const claim of parsedResult.data.claims) {
    const uniqueIds = new Set(claim.sourceItemIds);
    if (
      uniqueIds.size !== claim.sourceItemIds.length ||
      claim.sourceItemIds.some((id) => !submittedIds.has(id))
    ) {
      throw new InvalidAnalysisResultError("The provider returned an invalid source reference.");
    }
  }

  return { status: "complete", analysis: parsedResult.data };
}
