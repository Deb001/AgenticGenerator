# ---------- Stage 1: Build React application ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies based on package.json and package-lock.json (or yarn.lock)
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent

# Copy source files and build
COPY . ./
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:stable-alpine AS runtime
# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*
# Copy built assets from builder stage
COPY --from=builder /app/build /usr/share/nginx/html
# Copy custom nginx configuration (optional, ensure file exists in repo)
# If you have a custom nginx.conf, uncomment the next line and adjust the path.
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the web server
EXPOSE 80

# Run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
