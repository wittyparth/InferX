# ========== Base Stage ==========
FROM node:20-alpine as base

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Set environment variable for file watching on Windows
ENV CHOKIDAR_USEPOLLING=true

# ========== Dependencies Stage ==========
FROM base as dependencies

COPY pnpm-lock.yaml package.json ./

RUN pnpm install --frozen-lockfile

# ========== Development Stage ==========
FROM base as development

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Run development server with hot reload
CMD ["pnpm", "dev"]

# ========== Builder Stage ==========
FROM base as builder

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# ========== Production Stage ==========
FROM node:20-alpine as production

WORKDIR /app

RUN npm install -g pnpm

# Copy built application and node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

EXPOSE 3000

ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
