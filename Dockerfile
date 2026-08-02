FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN npm ci

# Copy full repository source
COPY . .

# Select schema & build backend workspace (compiles main.ts and seed.ts)
RUN npm run build --workspace=apps/backend

# Expose API port
EXPOSE 4000

ENV NODE_ENV=production

# Fast container startup: sync DB schema in ~1s then start API server immediately
CMD ["sh", "-c", "npx prisma db push --schema=apps/backend/prisma/schema.prisma --accept-data-loss && npm run start --workspace=apps/backend"]
