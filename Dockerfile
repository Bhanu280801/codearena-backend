FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates python3 g++ openjdk-17-jdk \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
ENV DATABASE_URL=postgresql://codearena:codearena@localhost:5432/codearena
RUN npm run prisma:generate

COPY src ./src

ENV NODE_ENV=production

CMD ["npm", "start"]
