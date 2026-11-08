export const reviewLenses = ["interface", "content", "findability"] as const;

export type ReviewLens = (typeof reviewLenses)[number];

export const lensTitle: Record<ReviewLens, string> = {
  interface: "UI en gebruik",
  content: "Content",
  findability: "Vindbaarheid",
};

export const lensQuestion: Record<ReviewLens, string> = {
  interface: "Hoe kan een bezoeker de pagina vlotter lezen, navigeren en gebruiken, ook op een klein scherm?",
  content: "Welke teksten zijn onduidelijk, dun of inconsistent met de rest van het profiel?",
  findability: "Hoe vinden mensen deze pagina, en welke titel, kop, linktekst of beschrijving ontbreekt daarvoor?",
};

export function isReviewLens(value: string): value is ReviewLens {
  return (reviewLenses as readonly string[]).includes(value);
}
