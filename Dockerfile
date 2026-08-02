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

# Start API server immediately to pass Railway healthcheck
CMD ["npm", "run", "start", "--workspace=apps/backend"]
