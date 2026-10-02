import type { ReviewInput, SourceItem } from "./contracts";

export const DEMO_REVIEW: ReviewInput = {
  problem:
    "How do people with small balcony gardens manage watering when their daily schedules change?",
  community: "The Window Garden Exchange (fictional community)",
  sourceItems: [
    {
      id: "demo-rules-01",
      sourceType: "published_rules_or_community_description",
      excerpt:
        "Fictional community description and rules: A peer space for small-space gardening. Keep questions on topic. No product promotion. Research questions are welcome when clearly labeled and focused on learning.",
      reference: "Fictional demo source; no real URL",
      publicationDate: null,
    },
    {
      id: "demo-discussion-01",
      sourceType: "discussion_or_other_source_material",
      excerpt:
        "When my work shift runs late, I get home and find the balcony pots dry again. I have tried leaving a note by the door, but I still forget on busy days.",
      reference: "Fictional demo discussion item 1",
      publicationDate: "Fictional date: 2026-04-12",
    },
    {
      id: "demo-discussion-02",
      sourceType: "discussion_or_other_source_material",
      excerpt:
        "I use a kitchen timer after breakfast and honestly watering has not been a problem for me. The reminder is enough for my three pots.",
      reference: "Fictional demo discussion item 2",
      publicationDate: "Fictional date: 2026-04-19",
    },
    {
      id: "demo-discussion-03",
      sourceType: "discussion_or_other_source_material",
      excerpt:
        "Most weeks I remember. It only becomes stressful if I travel or we get several very hot days in a row; then the small containers dry much faster.",
      reference: "Fictional demo discussion item 3",
      publicationDate: "Fictional date: 2026-05-02",
    },
    {
      id: "demo-discussion-04",
      sourceType: "discussion_or_other_source_material",
      excerpt:
        "Does anyone have suggestions for herbs that tolerate a sunny balcony? I am choosing plants for a new set of pots.",
      reference: "Fictional demo discussion item 4",
      publicationDate: "Fictional date: 2026-05-07",
    },
  ],
};

export function createDemoReview(): ReviewInput {
  return {
    ...DEMO_REVIEW,
    sourceItems: DEMO_REVIEW.sourceItems.map((item): SourceItem => ({ ...item })),
  };
}