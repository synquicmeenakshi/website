# Multi-stage build for ZenYourLife (Frontend + Admin + Backend with PM2)
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Build Admin
FROM node:18-alpine AS admin-builder

WORKDIR /app/admin
COPY admin/package*.json ./
RUN npm ci
COPY admin/ ./
RUN npm run build

# Final production image
FROM node:18-alpine

WORKDIR /app

# Install PM2 globally
RUN npm install -g pm2

# Set up backend directory structure first
RUN mkdir -p /app/backend /app/frontend/dist /app/admin/dist /app/logs

# Copy backend package files and install dependencies
COPY backend/package*.json /app/backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Copy all backend source files
COPY backend/ /app/backend/

# Copy built frontend and admin to proper locations
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
COPY --from=admin-builder /app/admin/dist /app/admin/dist

# Create uploads directory with proper permissions
RUN mkdir -p /app/backend/uploads /app/logs && \
    chmod -R 755 /app/backend/uploads /app/logs

# Copy PM2 ecosystem config to root
COPY ecosystem.config.js /app/ecosystem.config.js

# Set working directory back to /app for PM2
WORKDIR /app

# Expose backend port 5001
EXPOSE 5001

# Health check on port 5001
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start with PM2 using ecosystem config
CMD ["pm2-runtime", "start", "/app/ecosystem.config.js"]
