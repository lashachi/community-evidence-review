import {
  InvalidAnalysisRequestError,
  InvalidAnalysisResultError,
  analyzeEvidence,
} from "@/lib/evidence-analysis";
import { AnalysisProviderError } from "@/lib/openai-analysis";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  try {
    return Response.json(await analyzeEvidence(body));
  } catch (error) {
    if (error instanceof InvalidAnalysisRequestError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof AnalysisProviderError) {
      return Response.json(
        { error: "The analysis service could not complete the review. Your source material remains in this page." },
        { status: 502 },
      );
    }
    if (error instanceof InvalidAnalysisResultError) {
      return Response.json(
        { error: "The analysis service returned a review that could not be safely validated." },
        { status: 502 },
      );
    }

    return Response.json(
      { error: "The review could not be completed. Your source material remains in this page." },
      { status: 500 },
    );
  }
}
