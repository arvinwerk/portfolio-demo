# Chat

`ChatWidget` is the window. `useChat` sends the conversation to the route. The route is a thin Next adapter around `handleVisitorChat`. That use case checks the pace, restores the conversation, and opens a session. The session reads the recruiter sheet, puts those facts in the prompt, and streams the model's answer to the browser.

`AI_MODEL` turns the chat on. `.env.example` sets `qwen`. The route refuses the request when the model or the key is missing, and the window shows that sentence instead of a raw error page. `AI_BASE_URL` stays a local address. Without that variable the default is `http://127.0.0.1:11434/v1`, and an address outside this machine or the Docker network is refused. The session sends the conversation there. `AI_API_KEY` signs the conversation and is left out of that request. `OLLAMA_URL` for the daily review follows the same boundary.

Incoming messages are checked: only user and assistant, a bounded count, text only, and a maximum length. The request body stops at 96 kB, including when the length header is missing or arrives late. Tool parts from the browser are dropped. An assistant message counts only when this server signed it with `AI_API_KEY`. An invented answer does not enter the next prompt. The signature travels in the stream and comes back on the next turn. When the key changes, the old history expires.

Each conversation lands in one text file. The visitor's first question is the name of that conversation. A follow-up replaces the same file with the conversation so far. Without `CHAT_LOG_DIR` the directory is `CONTENT_DIR/chat`, and without `CONTENT_DIR` it is `data/chat` in the working directory. Reloading the page starts a new conversation. The key is not in the file.

`/api/chat` has no login. Each address gets a window of 8 requests per minute. Each process also allows 100 requests per ten minutes, including when the address rides along in `x-forwarded-for`. Above that the route answers 429, before an answer is built. An invalid conversation still counts toward that window. The ceiling lives in the memory of this process. An address whose window is empty leaves the table. Several instances do not share it. A failure reaches the browser as a fixed sentence, not as raw error text.

## Profile for the chat

The chat reads `content/rag/recruiter.txt`. That sheet names the person, optional education, two dates, the skills, and the stack of each project. The domain turns it into a briefing, with age and years of interface work calculated on the day of the request. That briefing is the model's whole context. The model writes the answer. When a fact is absent, the answer is supposed to be: that is not in the profile. Salary and a start date are absent.

An earlier version let a small model search or choose the sentence itself. That changed projects, skills, and dates. The briefing therefore sends the whole sheet, not a filtered sentence, and the dates are already calculated. `pnpm qwen` and the Compose service create the model `qwen`. Without that model there is no answer. The decision is in `docs/adr/0003-model-antwoordt.md`.

The rest of the corpus is the directory `content/rag`. Every text file counts for the index: `.txt`, `.md`, and `.markdown`. LangChain's `RecursiveCharacterTextSplitter` cuts the documents by character size, with overlap. Okapi BM25 (`okapibm25`) ranks those pieces. The store caches them and rebuilds them when a file name, modification time, or size changes. A file larger than 64 kB is refused.

Without `RAG_DOCUMENT_PATH` every text file is indexed. With that variable the index stays on one file name. The recruiter sheet is read separately, always as `recruiter.txt` in the same directory. A path that contains a directory or `..` is refused, and so is another extension. After `realpath` the file still has to stay inside `content/rag`. The route includes the directory in the file trace.

`content/rag/profile.txt` and `content/rag/werk.txt` describe the same person as the page. Set `CONTENT_DIR` to an absolute directory outside the checkout when the published files should survive a code deploy. That directory has the same JSON files and `rag/` as `content/`, including `recruiter.txt`, plus `images/` in the shape of `content/images`. The page and the chat read that directory on every request. A deploy replaces the code and leaves the directory in place. Without `CONTENT_DIR`, the checkout's `content/` is what gets read.
