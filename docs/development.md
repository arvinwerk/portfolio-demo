# Development

GitFlow with two long-lived branches. `master` is production. `development` is the test environment, on one subdomain. Feature branches are not deployed. Merge them into `development`. When the test environment looks right, merge `development` into `master`.

The app stays on `/`. The filter, the images, and `/api/chat` stay the same paths. Development listens on `127.0.0.1:3001`, beside production on port 3000.

The deploy key starts only the command `run`. Once on the VM, in this order, so production keeps the old script. Run this from a checkout, or copy `deploy/run` to the VM first.

```bash
target=$(command -v run)
mkdir -p ~/.local/lib/portfolio
cp "$target" ~/.local/lib/portfolio/run-production
chmod 755 ~/.local/lib/portfolio/run-production
install -m 755 deploy/run ~/.local/lib/portfolio/run
printf '%s\n' '#!/bin/sh' 'exec "$HOME/.local/lib/portfolio/run"' > "$target"
chmod 755 "$target"
```

When `~/.ssh/authorized_keys` has a `command=` with a path, that path is `target`. After that, `git push -u origin development` creates the branch from `master`. Every push to `development` publishes the site. `run` with no extra argument remains the production deploy.

`~/.config/portfolio/development.env` follows `deploy/development.env.example`, with `chmod 600`. `DEVELOPMENT_DOMAIN` is the hostname. `CONTENT_DIR` may be the same directory as production. Node 22 is on the PATH on the VM.

DNS points that hostname at the same machine. The existing proxy forwards it to `127.0.0.1:3001`, sets `X-Real-IP`, and does not buffer `/api/chat`. `deploy/caddy-development.caddy` and `deploy/nginx-development.conf` are that vhost. Put basic auth on it while the chat key is the same as production.
