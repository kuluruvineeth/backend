# BUILDER
FROM node:18-buster-slim AS builder

WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/

RUN npm install

COPY --chown=node:node . .

RUN npm run build

USER node


# PRODUCTION
FROM node:18-buster-slim AS production

WORKDIR /app

RUN apt-get update && apt-get install -y poppler-utils && apt-get install -y openssl

COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD [ "npm","run","start:prod" ]