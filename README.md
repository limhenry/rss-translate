# RSS Feed Translator

This project is a web server that translates the titles of an RSS feed from a source language to a target language. It is built with Node.js, Fastify, and TypeScript, and it leverages multiple translation providers and Redis for caching. The entire application is containerized with Docker for easy deployment and scalability.

## Features

- **RSS Feed Translation**: Translates the titles of articles in an RSS feed.
- **Multiple Translation Providers**: Supports various translation services, which can be configured via an environment variable.
    - Google Cloud Translation - Basic API (`google_translate`)
    - Gemini (`gemini`)
    - OpenAI (`openai`)
- **Caching**: Caches translated titles in Redis to reduce redundant API calls and improve performance.
- **Dockerized**: The application is fully containerized with Docker and Docker Compose for easy setup and deployment.
- **Batch Translations**: Gathers all titles from the RSS feed and translates them in a single batch request for efficiency.
- **Structured Output**: Uses structured output (with Zod schemas) when using Genkit providers to ensure reliable API responses.

## Technologies Used

- **Backend**: [Node.js](https://nodejs.org/), [Fastify](https://fastify.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Translation**:
    - [Genkit](https://firebase.google.com/docs/genkit) for [Gemini](https://ai.google.dev/docs) and [OpenAI](https://platform.openai.com/docs) providers
    - [Google Cloud Translation API](https://cloud.google.com/translate/docs)
- **Database**: [Redis](https://redis.io/) for caching
- **Parsing**: `xml2js` for parsing RSS feeds
- **Containerization**: [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v24 or later)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd rss-translate
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and add your API keys for the translation providers you intend to use. See the [Environment Variables](#environment-variables) section for more details.

## Usage

### Running the Application

#### Development

To run the application in development mode with hot-reloading:

```bash
npm run dev
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

| Variable               | Description                                                                                             | Default        |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | -------------- |
| `LOGGING`                | Set to `true` to enable detailed logging for caching and translation API calls.                | `false`        |
| `TRANSLATE_PROVIDER`   | The translation provider to use. Options: `google_translate`, `gemini`, `openai`. See Features section for full names. | `google_translate` |
| `REDIS_HOST`           | The hostname of the Redis server.                                                                       | `localhost`    |
| `REDIS_PORT`           | The port of the Redis server.                                                                           | `6379`         |
| `GOOGLE_API_KEY`       | Your API key for the Google Cloud Translation API (Basic).                                              |                |
| `GEMINI_API_KEY`       | Your API key for the Gemini API.                                                                        |                |
| `OPENAI_API_KEY`       | Your API key for the OpenAI API.                                                                        |                |
| `GEMINI_MODEL`         | The Gemini model to use (defaults to `gemini-2.5-flash`).                                                | `gemini-2.5-flash` |
| `OPENAI_MODEL`         | The OpenAI model to use (defaults to `gpt-4o`).                                                        | `gpt-4o`         |

## Disclaimer

This project was generated with the assistance of an AI programming partner. While the code has been reviewed, it may contain errors or non-optimal solutions. Please use it as a reference and exercise your own judgment.

## Automated Publishing with GitHub Actions

This project uses GitHub Actions to automatically build and publish the Docker image to the GitHub Container Registry (GHCR).

The workflow is defined in `.github/workflows/docker-publish.yml` and will trigger on every push to a tag matching the pattern `v*.*.*` (e.g., `v1.0.0`).

To publish a new version:

1.  Ensure all your changes are committed to the main branch.
2.  Run the `npm version` command to bump the version, create a commit, and tag it.
    ```bash
    # For a patch release (e.g., v1.0.0 -> v1.0.1)
    npm version patch

    # Or for a minor release (e.g., v1.0.1 -> v1.1.0)
    npm version minor
    ```
3.  Push the commit and the new tag to GitHub. This will trigger the workflow.
    ```bash
    git push --follow-tags
    ```

GitHub Actions will then automatically build and push the image to `ghcr.io/${{ github.repository }}`.

## Future Improvements

- Translate additional fields in the RSS feed, such as `description`.
- Add support for more translation providers.
- Implement a more robust error-handling and logging strategy.
- Add unit and integration tests.
