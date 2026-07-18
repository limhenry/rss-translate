# Stage 1: Build the Go application
FROM golang:1.26-alpine AS builder

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build a statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o rss-translate .

# Stage 2: Create the final production image
FROM alpine:3.20

WORKDIR /usr/src/app

# Install CA certificates to enable HTTPS calls to Google Translate
RUN apk add --no-cache ca-certificates

COPY --from=builder /usr/src/app/rss-translate ./rss-translate

CMD [ "./rss-translate" ]
