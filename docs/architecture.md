# Architecture

The repository is one Next.js app. Page, content, the chat route, and the profile index run in the same process. That monolith is the boundary this site wants.

A monorepo pays off when packages have their own release, or when several apps share one library. This site has one deploy and no second consumer of the index. A package boundary would split types and scripts without giving them an owner.

The web process stays one Next.js app. Ollama runs beside it. A local model has its own runtime and its own disk cache, and those stay out of the Node process. That boundary is recorded in `docs/adr/0001-lokaal-qwen.md`. The chat sends the conversation to that runtime, with the recruiter sheet as the facts. The browser only sees `/api/chat`.

Source lives in `src/`. Two bounded contexts, `portfolio` and `assistant`, each have `domain`, `application`, `infrastructure`, and `interface`. `src/app` wires those modules and holds no business rules. `server-only` on adapters that read files or see the key makes the build fail when a client component imports them. The domain does not import React, so age, the filter, ids, and the conversation can be tested without rendering the page. `src/shared/kernel/architecture.test.ts` enforces the import direction.

## From file to page

`JsonPortfolioRepository` reads `content/*.json`. The anti-corruption layer in `portfolio-document.ts` checks the shape of the document. `assemblePortfolio` builds the aggregate from that. The split keeps document checks testable without the filesystem, and keeps the repository testable against the real sample files.

`composePortfolioPage` turns the aggregate into a read model: age, years as a developer, skill groups, the valid keyword selection, and the filtered projects. A project id is its position in the file plus one. `PortfolioView` renders that model. The filter and the chat are the only client components, because only they have interaction after the first response. URL hrefs belong to the interface. The selection rule belongs to the domain.

## Seams

Each context keeps the same order: a document or a request comes in, the domain decides, the interface draws.

`src/app/api/chat/route.ts` hands the request to the assistant module. The session lives in `createLocalQwenSession`. The route does not import that session.

`ProfileKnowledge` is the port to the facts. `facts` reads the recruiter sheet. `search` is the BM25 index: `FileProfileStore` reads the text files, lets LangChain split them, ranks them with BM25, refuses anything larger than 64 kB, and caches the pieces on itself.

The window imports the error sentence it shows the visitor, and the welcome sentence from the domain. Restoring a conversation stays in the domain.
