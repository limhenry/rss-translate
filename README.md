# RSS Feed Translator

This project is a web server that translates the titles of an RSS feed from a source language to a target language. It is built with Go (Golang) and leverages Redis for caching. The entire application is containerized with Docker for easy deployment and scalability.

## Features

- **RSS Feed Translation**: Translates the titles of articles in an RSS feed.
- **Google Cloud Translation**: Translates titles using Google Cloud Translation Basic API.
- **Caching**: Caches translated titles in Redis to reduce redundant API calls and improve performance.
- **Dockerized**: The application is fully containerized with Docker and Docker Compose for easy setup and deployment.
- **Batch Translations**: Gathers all titles from the RSS feed and translates them in a single batch request for efficiency.

## Technologies Used

- **Backend**: [Go](https://go.dev/) (v1.26)
- **Translation**: [Google Cloud Translation API](https://cloud.google.com/translate/docs)
- **Database**: [Redis](https://redis.io/) for caching
- **Parsing**: `beevik/etree` for dynamic XML RSS feed parsing and manipulation
- **Containerization**: [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Go](https://go.dev/) (v1.26 or later)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd rss-translate
    ```

2.  **Download dependencies:**
    ```bash
    go mod download
    ```

3.  **Set up environment variables:**
    Create a `.env` file by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and add your Google Cloud Translation API key. See the [Environment Variables](#environment-variables) section for more details.

## Usage

### Running the Application

#### Development

To run the application locally:

```bash
go run main.go
```

The server will be available at `http://localhost:3000`.

#### Production (Docker)

To build and run the application with Docker Compose:

```bash
docker-compose up -d --build
```

The server will be available at `http://localhost:3000`.

### API Endpoint

The application exposes a single GET endpoint to fetch and translate an RSS feed.

`GET /?url=<rss-url>&sl=<source-language>&tl=<target-language>&prefix=<link-prefix>`

**Parameters:**

- `url`: The URL of the RSS feed to translate.
- `sl`: The source language of the feed (e.g., `DE` for German).
- `tl`: The target language for the translation (e.g., `EN` for English).
- `prefix` (optional): A URL to prepend to each item's link in the RSS feed. This is useful for routing links through a proxy service.

**Example:**

```
http://localhost:3000/?url=https://www.ndr.de/index~rss2.xml&sl=DE&tl=EN&prefix=https://proxy.com/
```

This will return an XML response with the titles of the NDR RSS feed translated from German to English, and each item's link will be prefixed with the provided URL.

## Environment Variables

The following environment variables are used to configure the application. These should be defined in a `.env` file in the project root.

| Variable         | Description                                                                     | Default     |
| ---------------- | ------------------------------------------------------------------------------- | ----------- |
| `LOGGING`        | Set to `true` to enable detailed logging for caching and translation API calls. | `false`     |
| `REDIS_HOST`     | The hostname of the Redis server.                                               | `localhost` |
| `REDIS_PORT`     | The port of the Redis server.                                                   | `6379`      |
| `GOOGLE_API_KEY` | Your API key for the Google Cloud Translation API (Basic).                      |             |

## Disclaimer

This project was generated with the assistance of an AI programming partner. While the code has been reviewed, it may contain errors or non-optimal solutions. Please use it as a reference and exercise your own judgment.

## Automated Publishing with GitHub Actions

This project uses GitHub Actions to automatically build and publish the Docker image to the GitHub Container Registry (GHCR).

The workflow is defined in `.github/workflows/docker-publish.yml` and will trigger on every push to a tag matching the pattern `v*.*.*` (e.g., `v1.0.0`).

To publish a new version:

1.  Ensure all your changes are committed to the main branch.
2.  Tag your commit with the next version and push it.
    ```bash
    # Create a version tag
    git tag v1.1.0

    # Push the tag to GitHub
    git push origin v1.1.0
    ```

GitHub Actions will then automatically build and push the image to `ghcr.io/${{ github.repository }}`.
