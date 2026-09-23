FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* .npmrc* ./
# The deployment API executes the Hardhat CLI at runtime, and Hardhat is a
# development dependency. Keep dev dependencies in the gateway image so
# POST /blockchains/:target/deploy/lamteknik can deploy contracts.
RUN npm ci

COPY . .

EXPOSE 4100

CMD ["node", "server-lamteknik.js"]
