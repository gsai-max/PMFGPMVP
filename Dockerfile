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

# Select schema & build backend workspace
RUN npm run build --workspace=apps/backend

# Expose API port
EXPOSE 4000

ENV NODE_ENV=production

# Run schema push, seed engine, and start API server
CMD ["sh", "-c", "npm run prisma:db:push --workspace=apps/backend && npm run prisma:seed --workspace=apps/backend && npm run start --workspace=apps/backend"]
