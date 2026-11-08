# Lokaal Qwen-model

## Status

Aanvaard.

## Context

De chat liep via Anthropic. Model en sleutel stonden in de omgeving, en de Route Handler streamde vanuit hetzelfde Next-proces. Een tweede webserver was geen winst: één deploy, geen tweede consument van de pagina, geen CORS.

Een lokaal model is geen tweede webserver. De gewichten en de runtime horen niet in het Node-proces. Ollama houdt die gewichten in een eigen cache en spreekt een OpenAI-compatibel pad op de eigen machine.

## Besluit

De assistant-adapter praat met dat pad. Het model heet `qwen` en komt uit `qwen/Modelfile`, met `qwen2.5:3b` als basis. Die grootte roept `searchProfile` aan. De 3B valt onder de Qwen Research Licence. `qwen2.5:1.5b` en `qwen2.5:7b` zijn Apache-2.0; de 1.5B laat de tool liggen. `AI_BASE_URL` mag alleen naar loopback, `host.docker.internal` of een hostnaam zonder punt wijzen. Een verzoek naar een publieke provider valt zo af. `AI_API_KEY` ondertekent het transcript en gaat niet mee naar het model.

`docker compose` start de runtime naast de site. `pnpm qwen` doet hetzelfde op de host. Beide maken het model `qwen` aan en houden de gewichten buiten de Next-image en buiten git.

## Gevolgen

De eerste start downloadt het model. Antwoorden kosten CPU-tijd. Het tempoplafond blijft, zodat één bezoeker het model niet blijft bezetten. Wisselt de ondertekeningssleutel, dan vervalt de oude geschiedenis.
