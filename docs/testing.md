# Testing

`pnpm test` runs Vitest.

Domain tests cover dates, the filter, project ids, content validation, the recruiter sheet, and the profile store, including a replaced file, a directory with both text and markdown, and a path that points outside the directory. Component tests cover the card, the skills, the filter, and the chat window.

The route test checks that a question reaches the model with the facts from the sheet, and that an invented assistant answer does not land in that prompt. A second test sends the model's stream through the real SDK and checks that the text is signed and that the key is absent from the model request.

`pnpm test:e2e` runs Playwright against a production build. The suite covers the page, the filter, the chat, and the agent page. The filter is checked in the first HTML, after a click, with the back button, without JavaScript, and with the click leaving the scroll position alone. The chat covers opening and closing, the poster over the page, an empty message, an answer stream, searching the profile, stopping, and the sentences `/api/chat` returns. Without `AI_MODEL` and `AI_API_KEY` that route answers 503. An invalid or oversized body is refused before the model is involved. A change to what the visitor sees updates that suite in the same change. The rule is in `.cursor/rules/tests.mdc`.

A release is published only when `pnpm test` and `pnpm test:e2e` are both green. On `master` and `development` those are two separate jobs. Publication starts only when both are `success`. Every pull request and every feature branch runs the same two workflows.

```bash
pnpm exec playwright install chromium
```
