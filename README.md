# Portfolio

Next.js-portfolio. De pagina is React. Persoonsgegevens, skills, projecten en banners komen uit `content/` en worden op de server gelezen. De browser haalt die JSON niet op.

Het filter staat in de URL (`/?keywords=Angular&keywords=React`). Een lege selectie toont alle projecten. Meerdere trefwoorden zijn een OF-filter, net als in de oude Angular-store. Een klik werkt de lijst bij. De link wijst naar `#werk`, zodat een gewone paginaload bij de lijst uitkomt. De eerste load filtert op de server aan de hand van de query.

## Content

De oorspronkelijke Angular-app verwees naar `/assets/api/*.json` en beelden die niet in de repo stonden. De JSON in `content/` is daarom voorbeeldcontent, met de twee campagnes die al in de oude `BannerService` stonden. Vervang de bestanden door je eigen gegevens:

- `content/personal.json` — profiel. `${age}` en `${yearsAsDeveloper}` in `foreword` worden op de server ingevuld vanuit `dateOfBirth` en `developingStartDate`.
- `content/skills.json` — `category` is `skills`, `framework` of `other`.
- `content/projects.json` — projecten krijgen hun id op volgorde in het bestand (`index + 1`).
- `content/banners.json` — paden onder `/images/`.

Beelden staan in `public/images/`.

## Chat

Het chatvenster rechtsonder hoort bij deze Next.js-app. De browser praat met `app/api/chat`. Die route streamt via de Vercel AI SDK. De sleutel blijft op de server.

Kopieer `.env.example` naar `.env.local` en vul de variabelen in. `AI_MODEL` is het model-id, bijvoorbeeld `claude-haiku-5-5`. `AI_API_KEY` is de sleutel van dat model.

## Scripts

```bash
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

`npm test` draait Vitest: domeinregels (leeftijd, filter, id's) en componenten via Testing Library.
