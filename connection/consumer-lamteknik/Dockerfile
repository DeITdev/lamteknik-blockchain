FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=optional

COPY server.js ./
COPY config ./config

ENV NODE_ENV=production

CMD ["node", "server.js"]
