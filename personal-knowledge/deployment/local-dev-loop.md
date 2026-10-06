---
type: Convention
title: Local Development Loop
description: Docker Compose for multi-container projects, single Dockerfile otherwise, and a Makefile to keep commands uniform across all projects.
tags: [deployment, local-dev, docker, makefile]
timestamp: 2026-10-05T00:00:00Z
---

# Container Strategy

| Project type | Tool |
|-------------|------|
| **Single service** | `Dockerfile` — `docker build` and `docker run` |
| **Multiple containers** | `docker-compose.yml` — services, networks, volumes defined together |

# Makefile — Uniform Commands

Every project gets a `Makefile` so the development commands are the same no matter what language or framework:

```makefile
build:
	docker build -t my-project .

lint:
	docker run my-project npm run lint

test: lint
	docker run my-project npm test -- --coverage

migrate:
	docker run --env-file .env my-project npm run migrate

start:
	docker-compose up -d

stop:
	docker-compose down

restart:
	docker-compose restart
```

| Command | What it does |
|---------|-------------|
| `make build` | Builds the Docker image |
| `make lint` | Runs the formatter check, linter, and type check; fails on any finding (see [Code Hygiene](/conventions/code-hygiene.md)) |
| `make test` | Runs `make lint`, then the test suite with coverage inside a container; fails below 80% |
| `make migrate` | Applies pending database migrations from `migrations/` (only in projects with a database) |
| `make start` | Starts the service(s) via Docker Compose |
| `make stop` | Stops everything |
| `make restart` | Restarts without rebuilding |

# Why Makefiles

- **Uniformity:** Every project starts, stops, builds, and tests the same way — regardless of whether it's TypeScript, Python, or Go.
- **No memorization:** I don't need to remember if this project uses `npm run dev` or `python manage.py runserver`. It's always `make start`.
- **Self-documenting:** Running `make` with no target shows available commands.
