# Lokaal Qwen-model

## Status

Aanvaard voor de runtime. Het antwoordpad is herzien in ADR 0003: de chat roept het model aan, met het recruiterblad als gegevens.

## Context

De chat liep via Anthropic. Een lokaal model is geen tweede webserver. Ollama houdt de gewichten in een eigen cache en spreekt een OpenAI-compatibel pad op de eigen machine.

Dat pad is geprobeerd met `qwen2.5:3b`, omdat die grootte `searchProfile` aanriep, en daarna met `qwen2.5:1.5b` en het profiel in de prompt. Op recruiter vragen veranderden beide de feiten: een project met Angular en Laravel werd een ander project, een vaardigheid die niet in het blad staat kreeg ja, en een startdatum werd verzonnen. De 3B is op de VPS bovendien te traag om een gesprek te dragen.

## Besluit

Het model draait naast de site, niet in het Next-proces. Ollama en `qwen/Modelfile` blijven. `pnpm qwen` en Compose maken het model `qwen` aan, buiten de Next-image en buiten git. `AI_BASE_URL` mag alleen naar loopback, `host.docker.internal` of een hostnaam zonder punt wijzen. `AI_API_KEY` ondertekent het transcript en gaat niet mee naar het model. `AI_MODEL` zet de chat aan.

Hoe het model het blad gebruikt, staat in ADR 0003.

## Gevolgen

Het blad moet op de server mee, ook als `CONTENT_DIR` buiten de checkout staat. Wisselt de ondertekeningssleutel, dan vervalt de oude geschiedenis. De gewichten blijven buiten de Next-image.
