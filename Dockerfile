# Dockerfile for Hugging Face Spaces
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy application files
COPY . .

# Build Next.js application
RUN npm run build

# Create data directory for persistent storage
RUN mkdir -p /data

# Pre-pull Ollama model (optional - comment out if you want to pull at runtime)
# RUN ollama pull llama3.2 || true

# Expose port (Hugging Face Spaces will set PORT env var)
ENV PORT=7860
EXPOSE 7860

# Start Ollama in background, wait for it to be ready, then start Next.js
# Note: Next.js automatically uses PORT env var from Hugging Face Spaces
CMD ollama serve & \
    sleep 10 && \
    ollama pull ${OLLAMA_MODEL:-llama3.2} || true && \
    npm start

