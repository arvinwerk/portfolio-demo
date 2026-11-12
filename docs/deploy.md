# Deploy

`output: "standalone"` produces one Node server without the full `node_modules`. The Dockerfile also copies `public/`, `.next/static/`, and `content/`. The page and the chat read `content/` from disk on each request, so that directory is in the image.

```bash
cp .env.example .env
docker compose up -d --build
```

The site listens on `127.0.0.1:3000`. Compose sets `AI_MODEL=qwen` and `AI_BASE_URL=http://qwen:11434/v1`. `AI_API_KEY` comes from `.env` when the site starts. The key and the weights are not baked into the Next image. The `qwen` service loads the model into the `qwen` volume. The chat waits for that model. Until it is there, the visitor gets the sentence that the answer failed.

## Production

On the VPS the site runs as the standalone archive from the deploy, not through Compose. The archive includes `qwen/`, so `sh qwen/start.sh` can create the model there. The chat reads `recruiter.txt` from `CONTENT_DIR/rag` when that variable is set. `deploy/portfolio.service` keeps the process on `127.0.0.1:3000`.

Nginx sits in front. `deploy/ssl` writes that vhost, sets `X-Real-IP`, and leaves `/api/chat` unbuffered. Port 80 redirects to HTTPS and keeps serving `/.well-known/acme-challenge/`. Without `SITE_ADDRESS`, Certbot requests a certificate for the public IPv4 address. That certificate lasts six days. Certbot's timer renews it and reloads Nginx. With `SITE_ADDRESS` set to a hostname that points at this machine, the certificate is issued for that name. `CERTBOT_EMAIL` is the address for the expiry notice.

Every push to `master` publishes the app. The pipeline then runs `deploy/ssl`, once `deploy/run` is the key's command. Until that wrapper is in place, publication still succeeds and the pipeline skips HTTPS. The `ssl` command belongs to `deploy/run`. Without `~/.config/portfolio/ssl.env` the public IPv4 address is used. That file may set `SITE_ADDRESS` and `CERTBOT_EMAIL`, with `chmod 600`.

Once, next to the wrapper in [Development](development.md), the deploy user gets the right to start only that script as root:

```bash
sudo sh deploy/ssl
printf '%s\n' 'arvinwerk ALL=(root) NOPASSWD: /home/arvinwerk/.local/lib/portfolio/ssl' | sudo tee /etc/sudoers.d/portfolio-ssl
sudo chmod 440 /etc/sudoers.d/portfolio-ssl
```

## Daily review

Three agents look at the page and the code every day. One watches UI and use, the second watches the content, and the third watches findability. They read the older markdown reports first. A run writes three new files under `content/reviews/`, or under `CONTENT_DIR/reviews` when that variable is set. `/agents` shows only those proposals, each with a score from 1 to 10 and that day's average. Keys, passwords, IP addresses, email addresses, and absolute paths are removed from the report before it reaches the page.

The run talks to Qwen through Ollama at `OLLAMA_URL` (default `http://127.0.0.1:11434`). `QWEN_MODEL` defaults to `qwen`. `REVIEW_SOURCE_DIR` is the checkout the agents read. No API key goes with the request.

```bash
pnpm review:daily
```

On the machine where Ollama runs, the examples `deploy/review-daily.service` and `deploy/review-daily.timer` can do that daily, at 07:00 Europe/Amsterdam. The timer expects a checkout in `~/portfolio-src`. The decision is in `docs/adr/0002-daily-review.md`.
