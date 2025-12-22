# Stage 1: Build the application
FROM node:24-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Create the production image
FROM node:24-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

CMD [ "node", "dist/index.js" ]
