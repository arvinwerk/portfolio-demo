# Lokaal Qwen-model

## Status

Aanvaard. Het antwoordpad is herzien: de chat roept het model niet meer aan.

## Context

De chat liep via Anthropic. Een lokaal model is geen tweede webserver. Ollama houdt de gewichten in een eigen cache en spreekt een OpenAI-compatibel pad op de eigen machine.

Dat pad is geprobeerd met `qwen2.5:3b`, omdat die grootte `searchProfile` aanriep, en daarna met `qwen2.5:1.5b` en het profiel in de prompt. Op recruiter vragen veranderden beide de feiten: een project met Angular en Laravel werd een ander project, een vaardigheid die niet in het blad staat kreeg ja, en een startdatum werd verzonnen. De 3B is op de VPS bovendien te traag om een gesprek te dragen.

## Besluit

De assistant beantwoordt die vragen uit `content/rag/recruiter.txt`. Het domain kiest de zin. De sessie streamt die zin en stuurt geen verzoek naar het model. Ontbreekt een feit, dan is de zin: dat staat niet in het profiel.

Ollama en `qwen/Modelfile` blijven. `pnpm qwen` en Compose maken het model `qwen` aan, buiten de Next-image en buiten git. `AI_BASE_URL` mag alleen naar loopback, `host.docker.internal` of een hostnaam zonder punt wijzen. `AI_API_KEY` ondertekent het transcript. `AI_MODEL` zet de chat aan.

## Gevolgen

Een antwoord wacht niet op een model. Het blad moet op de server mee, ook als `CONTENT_DIR` buiten de checkout staat. Wisselt de ondertekeningssleutel, dan vervalt de oude geschiedenis. De gewichten blijven beschikbaar op de machine, en ze doen niet mee aan het antwoord.
