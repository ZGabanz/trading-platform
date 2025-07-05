FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for ts-node)
RUN npm install

# Copy source code
COPY . .

# Expose the port
EXPOSE 4005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4005/health || exit 1

# Start the application with ts-node
CMD ["npx", "ts-node", "src/index.ts"] 