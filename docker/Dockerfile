FROM oven/bun:1-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN BUILD_STANDALONE=1 \
    DATABASE_URL=postgresql://127.0.0.1:1/reah \
    SESSION_SECRET=build-only-session-placeholder-00000000 \
    bun --bun run build

FROM oven/bun:1-alpine
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000

COPY --from=build --chown=bun:bun /app/.next/standalone ./
COPY --from=build --chown=bun:bun /app/.next/static ./.next/static
COPY --from=build --chown=bun:bun /app/public ./public

USER bun
EXPOSE 3000
CMD ["bun", "server.js"]
