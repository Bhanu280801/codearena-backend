FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates python3 g++ openjdk-17-jdk \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN npx prisma generate

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]