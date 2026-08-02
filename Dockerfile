FROM node:20-alpine

# Install openssl and compatibility libraries for Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat

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

# Fast container startup: start API server in 1s for instant healthcheck pass
CMD ["node", "apps/backend/dist/main.js"]
