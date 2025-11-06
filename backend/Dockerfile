# Multi-stage Dockerfile for Opun Backend (Fastify + TS)
FROM node:20-alpine AS base

# Common base setup
ENV NODE_ENV=production
WORKDIR /app

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Use full deps (incl. dev) to allow tsx runtime
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

RUN mkdir -p /app/.data && chmod -R 0777 /app/.data

EXPOSE 3333
USER node
# Run TS directamente con tsx (Node 20 usa --import)
CMD ["node", "--enable-source-maps", "--no-warnings", "--import", "tsx", "src/server.ts"]
