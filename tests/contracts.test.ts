import { describe, expect, it } from "vitest";
import {
  MAX_EXCERPT_CHARACTERS,
  MAX_SOURCE_ITEMS,
  SOURCE_TYPE_VALUES,
  countCharacters,
  validateReviewInput,
  type ReviewInput,
  type SourceItem,
} from "../lib/contracts";

function makeSourceItem(index: number, excerpt = "A supplied public source excerpt."): SourceItem {
  return {
    id: `source-${index}`,
    sourceType: SOURCE_TYPE_VALUES[index % SOURCE_TYPE_VALUES.length],
    excerpt,
    reference: null,
    publicationDate: null,
  };
}

function makeReview(sourceItems: SourceItem[] = [makeSourceItem(1)]): ReviewInput {
  return {
    problem: "People forget to water small balcony plants.",
    community: "The Window Garden Exchange (fictional demo)",
    sourceItems,
  };
}

describe("review input validation", () => {
  it("accepts complete input with either approved founder-selected source type", () => {
    const result = validateReviewInput(
      makeReview([
        {
          ...makeSourceItem(1),
          sourceType: "published_rules_or_community_description",
        },
        {
          ...makeSourceItem(2),
          sourceType: "discussion_or_other_source_material",
        },
      ]),
    );

    expect(result.success).toBe(true);
  });

  it("shows separate messages when both the problem and community are missing", () => {
    const result = validateReviewInput({ problem: "", community: " ", sourceItems: [] });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.problem).toBe("Describe the consumer problem you want to investigate.");
      expect(result.errors.community).toBe("Identify the public community you want to examine.");
    }
  });

  it("allows no source items so the caller can show the evidence-unavailable state", () => {
    expect(validateReviewInput(makeReview([])).success).toBe(true);
  });

  it("accepts exactly eight separate source items and rejects a ninth", () => {
    const eightItems = Array.from({ length: MAX_SOURCE_ITEMS }, (_, index) => makeSourceItem(index));
    const nineItems = [...eightItems, makeSourceItem(8)];

    expect(validateReviewInput(makeReview(eightItems)).success).toBe(true);

    const result = validateReviewInput(makeReview(nineItems));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.sourceItems).toContain("at most 8 source items");
    }
  });

  it("accepts an excerpt at 3,000 characters and rejects one at 3,001", () => {
    const atLimit = "x".repeat(MAX_EXCERPT_CHARACTERS);
    const overLimit = `${atLimit}x`;

    expect(validateReviewInput(makeReview([makeSourceItem(1, atLimit)])).success).toBe(true);

    const result = validateReviewInput(makeReview([makeSourceItem(1, overLimit)]));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.items["source-1"]?.excerpt).toContain("3,000 characters or fewer");
    }
  });

  it("counts astral Unicode characters consistently for the visible count and limit", () => {
    const oneEmoji = "\u{1F331}";

    expect(countCharacters(oneEmoji)).toBe(1);
    expect(countCharacters(oneEmoji.repeat(MAX_EXCERPT_CHARACTERS))).toBe(MAX_EXCERPT_CHARACTERS);
    expect(
      validateReviewInput(makeReview([makeSourceItem(1, oneEmoji.repeat(MAX_EXCERPT_CHARACTERS))])).success,
    ).toBe(true);
  });

  it("keeps optional reference and date metadata outside the excerpt character limit", () => {
    const item = {
      ...makeSourceItem(1, "A short excerpt."),
      reference: `https://example.invalid/${"r".repeat(MAX_EXCERPT_CHARACTERS + 1)}`,
      publicationDate: "Founder-supplied date",
    };

    const result = validateReviewInput(makeReview([item]));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sourceItems[0].reference).toBe(item.reference);
      expect(result.data.sourceItems[0].publicationDate).toBe(item.publicationDate);
    }
  });

  it("rejects blank source text and unsupported source types without rewriting input", () => {
    const original = makeReview([
      {
        ...makeSourceItem(1, "  "),
        sourceType: "discussion_or_other_source_material",
      },
    ]);
    const before = structuredClone(original);

    const result = validateReviewInput(original);

    expect(result.success).toBe(false);
    expect(original).toEqual(before);

    const invalidType = {
      ...makeReview(),
      sourceItems: [{ ...makeSourceItem(1), sourceType: "model_decides" }],
    };
    expect(validateReviewInput(invalidType).success).toBe(false);
  });

  it("requires the founder to select a source type instead of accepting an implicit default", () => {
    const result = validateReviewInput(
      {
        ...makeReview(),
        sourceItems: [{ ...makeSourceItem(1), sourceType: "" }],
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.items["source-1"]?.sourceType).toBe("Choose one of the two source types.");
    }
  });

  it("rejects duplicate source IDs", () => {
    const first = makeSourceItem(1);
    const second = { ...makeSourceItem(2), id: first.id };
    const result = validateReviewInput(makeReview([first, second]));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.items[first.id]?.sourceType).toBeUndefined();
      expect(result.errors.sourceItems).toBe("Each source item must have a unique ID.");
    }
  });
});