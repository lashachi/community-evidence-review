import { z } from "zod";

export const MAX_SOURCE_ITEMS = 8;
export const MAX_EXCERPT_CHARACTERS = 3000;

export const SOURCE_TYPE_VALUES = [
  "published_rules_or_community_description",
  "discussion_or_other_source_material",
] as const;

export const SOURCE_TYPE_LABELS: Record<(typeof SOURCE_TYPE_VALUES)[number], string> = {
  published_rules_or_community_description: "Published rules / community description",
  discussion_or_other_source_material: "Discussion / other source material",
};

export function countCharacters(value: string): number {
  return Array.from(value).length;
}

function nonBlankString(message: string) {
  return z.string().refine((value) => value.trim().length > 0, { message });
}

export const SourceItemSchema = z.object({
  id: nonBlankString("Source item ID is required."),
  sourceType: z.enum(SOURCE_TYPE_VALUES, {
    error: "Choose one of the two source types.",
  }),
  excerpt: nonBlankString("Enter source excerpt/content.").refine(
    (value) => countCharacters(value) <= MAX_EXCERPT_CHARACTERS,
    `Excerpt must be ${MAX_EXCERPT_CHARACTERS.toLocaleString()} characters or fewer.`,
  ),
  reference: z.string().nullable(),
  publicationDate: z.string().nullable(),
});

export const ReviewInputSchema = z
  .object({
    problem: nonBlankString("Describe the consumer problem you want to investigate."),
    community: nonBlankString("Identify the public community you want to examine."),
    sourceItems: z.array(SourceItemSchema).max(
      MAX_SOURCE_ITEMS,
      `A review can include at most ${MAX_SOURCE_ITEMS} source items.`,
    ),
  })
  .superRefine(({ sourceItems }, context) => {
    const seenIds = new Set<string>();

    sourceItems.forEach((item, index) => {
      if (seenIds.has(item.id)) {
        context.addIssue({
          code: "custom",
          path: ["sourceItems", index, "id"],
          message: "Each source item must have a unique ID.",
        });
      }

      seenIds.add(item.id);
    });
  });

export type SourceType = (typeof SOURCE_TYPE_VALUES)[number];
export type SourceItem = z.infer<typeof SourceItemSchema>;
export type ReviewInput = z.infer<typeof ReviewInputSchema>;

export type SourceItemField = "sourceType" | "excerpt";

export type ReviewValidationErrors = {
  problem?: string;
  community?: string;
  sourceItems?: string;
  items: Record<string, Partial<Record<SourceItemField, string>>>;
};

export type ReviewValidationResult =
  | { success: true; data: ReviewInput }
  | { success: false; errors: ReviewValidationErrors };

export function validateReviewInput(input: unknown): ReviewValidationResult {
  const result = ReviewInputSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: ReviewValidationErrors = { items: {} };

  for (const issue of result.error.issues) {
    const [root, index, field] = issue.path;

    if (root === "problem" && !errors.problem) {
      errors.problem = issue.message;
    } else if (root === "community" && !errors.community) {
      errors.community = issue.message;
    } else if (root === "sourceItems" && typeof index !== "number") {
      errors.sourceItems ??= issue.message;
    } else if (root === "sourceItems" && typeof index === "number" && field === "id") {
      errors.sourceItems ??= issue.message;
    } else if (
      root === "sourceItems" &&
      typeof index === "number" &&
      (field === "excerpt" || field === "sourceType")
    ) {
      const item = (input as { sourceItems?: Array<{ id?: unknown }> }).sourceItems?.[index];
      const itemId = typeof item?.id === "string" ? item.id : `item-${index + 1}`;
      const itemErrors = (errors.items[itemId] ??= {});
      itemErrors[field] ??= issue.message;
    }
  }

  return { success: false, errors };
}