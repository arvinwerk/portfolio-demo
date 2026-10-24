# Image for one Hetzner VM. The API key stays out of the image.
# On the server, next to this repo:
#   cp .env.example .env
#   docker compose up -d --build
#
# .env is read when the container starts, not during the build.

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build \
  && test -f .next/standalone/server.js \
  && test -f content/personal.json \
  && test -f content/rag/profile.txt

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --home /app nextjs
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
# The page and the chat read this folder from the working directory at
# request time. The file tracer also copies it into standalone; this copy
# keeps the deployed files on the image even if a route is not traced.
COPY --from=build --chown=nextjs:nodejs /app/content ./content
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
