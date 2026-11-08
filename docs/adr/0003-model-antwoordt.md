# Het model antwoordt vanuit het blad

## Status

Aanvaard. Herziet het antwoordpad van ADR 0001.

## Context

ADR 0001 haalde het model uit het antwoord. Een filter in het domain koos één zin uit `content/rag/recruiter.txt`. Die zin was voorspelbaar. Een klein model had daarvoor projecten, vaardigheden en datums veranderd, zowel met een zoektool als met het profiel los in de prompt.

De bezoeker hoort het model. De feiten blijven het blad. Het blad is klein genoeg om in zijn geheel mee te gaan. Leeftijd en jaren interfaces worden vooraf uitgerekend, zodat het model die getallen niet zelf verzint. Een tool die eerst een deel van het blad kiest blijft achterwege: die keuze was de filter, en het kleine model riep haar onbetrouwbaar aan.

## Besluit

De sessie stuurt het gesprek naar het lokale model op `AI_BASE_URL`. Het systembericht is de charter plus het hele blad, met de uitgerekende leeftijd en de jaren interfaces. Het model schrijft het antwoord. `AI_API_KEY` ondertekent het transcript en gaat niet mee in dat verzoek.

Staat een feit niet in het blad, dan hoort het antwoord te zijn: dat staat niet in het profiel. Salaris, tarief en beschikbaarheid staan er niet in.

## Gevolgen

Een antwoord wacht op het model. Is het model er niet, dan krijgt de bezoeker de zin dat het antwoord niet lukte. Een klein model kan nog afwijken van het blad. De prompt geeft het geen uitgezochte deelverzameling, en de datums zijn al getallen. Wisselt de ondertekeningssleutel, dan vervalt de oude geschiedenis.
