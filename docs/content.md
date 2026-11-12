# Content

The JSON in `content/` is the portfolio the app reads when `CONTENT_DIR` is unset. Those files stay in git so the app builds without a server directory.

When `CONTENT_DIR` is an absolute path, the page and the chat read that directory on every request. A code deploy replaces the release and leaves the directory in place.

`deploy/content` reads an archive from stdin and places it in `~/.local/share/portfolio-content`. That directory sits outside `~/portfolio/current`. The script writes `CONTENT_DIR` into `~/portfolio/.env` and into a systemd drop-in, and restarts `portfolio.service`. Conversations in `chat/` and reports in `reviews/` stay.

A release that contains `content/.publish`, with `CONTENT_DIR` set to an absolute path, copies `personal.json`, `projects.json`, `skills.json`, `banners.json`, and the files in `rag/` into that directory on the first page load, then deletes the marker. Images, `chat/`, and extra rag files already in the directory stay.

- `content/personal.json` holds the profile. `${age}` and `${yearsAsDeveloper}` in `foreword` are filled on the server. `education` and `dateOfBirth` may be absent. Without a birth date the foreword must not mention `${age}`.
- `content/skills.json` uses `category` values `skills`, `framework`, `other`, or `ai`.
- `content/projects.json` gives each project an id of its position in the file plus one.
- `content/banners.json` uses paths under `/images/`.
- `content/rag/recruiter.txt` is the sheet the model receives as facts. `opleiding` and `geboren` may be absent. `profile.txt` is the person, `werk.txt` is the projects. Other `.txt`, `.md`, or `.markdown` files in that directory count for the index, unless `RAG_DOCUMENT_PATH` points at one of them.

Images for the published site live in `images/` next to the JSON, under `CONTENT_DIR`. Without `CONTENT_DIR` they come from `public/images/`.
