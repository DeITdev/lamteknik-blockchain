FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 4100

CMD ["node", "server-lamteknik.js"]
