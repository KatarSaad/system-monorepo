FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-workspace.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Copy all packages
COPY packages/ ./packages/
COPY services/api/ ./services/api/

# Install dependencies
RUN pnpm install

# Build packages
RUN pnpm run build

# Set working directory to API service
WORKDIR /app/services/api

# Generate Prisma client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["npm", "run", "start:dev"]