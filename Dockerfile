# Stage 1: Build the application using esbuild
FROM node:24-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Create the final production image
FROM node:24-slim

WORKDIR /usr/src/app

# Copy the single bundled file from the builder stage
COPY --from=builder /usr/src/app/dist/index.js ./dist/index.js

CMD [ "node", "dist/index.js" ]
