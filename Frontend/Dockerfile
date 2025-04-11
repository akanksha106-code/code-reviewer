FROM node:20-slim

WORKDIR /usr/src/app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y wget && \
    rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev"]
