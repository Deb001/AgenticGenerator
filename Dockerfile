# Use the official lightweight Node.js 18 image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package manifest files (package.json and optionally package-lock.json)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the application source code
COPY . .

# Ensure the data directory exists for SQLite persistence
RUN mkdir -p /data

# Define environment variables with sensible defaults
ENV PORT=3000
ENV DB_PATH=/data/calculator.db

# Expose the application port (default 3000)
EXPOSE 3000

# Define the default command to run the server
CMD ["node", "src/server.js"]