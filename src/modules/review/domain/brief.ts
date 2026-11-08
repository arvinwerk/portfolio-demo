import { lensQuestion, lensTitle, type ReviewLens } from "./lens";
import { clip, type ReviewReport } from "./report";
import { sanitizePublicText } from "./sanitize";

export type ReviewExcerpt = {
  label: string;
  text: string;
  audience: "shared" | ReviewLens;
};

const maxPriorReports = 6;
const maxExcerptCount = 8;
const maxExcerptLength = 900;

export function reviewBrief(input: {
  date: string;
  lens: ReviewLens;
  excerpts: readonly ReviewExcerpt[];
  prior: readonly ReviewReport[];
}): string {
  const prior = input.prior
    .filter((report) => report.date < input.date)
    .toSorted((left, right) => right.date.localeCompare(left.date) || left.lens.localeCompare(right.lens))
    .slice(0, maxPriorReports);
  const inspiration =
    prior.length === 0
      ? "Er zijn nog geen eerdere rapporten."
      : prior
          .map((report) => {
            const suggestions = report.suggestions.map((suggestion) => `- ${suggestion}`).join("\n");
            const score = report.score === null ? "geen score" : `${report.score}/10`;
            return `${report.date}, ${lensTitle[report.lens]}, ${score}\n${suggestions}`;
          })
          .join("\n\n");
  const excerpts = input.excerpts
    .filter((excerpt) => excerpt.audience === "shared" || excerpt.audience === input.lens)
    .slice(0, maxExcerptCount)
    .map((excerpt) => `### ${excerpt.label}\n${clip(sanitizePublicText(excerpt.text), maxExcerptLength)}`)
    .join("\n\n");

  return sanitizePublicText(`Je beoordeelt één portfolio-pagina op ${input.date}.
Lens: ${lensTitle[input.lens]}.
Vraag: ${lensQuestion[input.lens]}
Kijk naar de pagina én naar de codefragmenten. Gebruik de eerdere rapporten als inspiratie. Herhaal ze niet letterlijk. Zeg wat nog openstaat of wat de betere volgende stap is.
Schrijf in het Nederlands. Alleen voorstellen die iemand zonder servertoegang kan begrijpen.
Noem geen sleutel, wachtwoord, ip-adres, e-mailadres, servernaam of absoluut pad.

## Eerdere rapporten

${inspiration}

## Materiaal

${excerpts}

## Vorm

## Score
7/10
## Suggesties
- voorstel
## Toelichting
korte alinea

Het cijfer is een geheel getal van 1 tot en met 10. 10 betekent dat deze lens weinig in de weg zit.`);
}
