---
type: Convention
title: Project Structure
description: Standard backend layout — services, clients, models, routes, and middleware under src/; tests, test-support code, and all Fake classes under tests/.
tags: [conventions, structure, backend, project-layout, testing, fakes, middleware]
timestamp: 2026-10-05T00:00:00Z
---

# Standard Backend Layout

```
project/
├── src/
│   ├── services/      # Business logic and domain services
│   ├── clients/       # External API clients, SDK wrappers, database connectors
│   ├── models/        # Immutable data records, types, schemas, entities
│   ├── routes/        # HTTP routes, endpoints, and API route definitions
│   └── middleware/    # Auth, validation, Result→HTTP mapping, error, logging middleware
├── tests/
│   ├── fakes/         # All hand-written Fake implementations
│   └── ...            # Test files and other test-support code
├── migrations/        # Versioned, forward-only schema migrations (only when there is a database)
├── Makefile           # make build, lint, test, start, stop, restart, migrate
├── package.json        # or pyproject.toml, go.mod, etc.
└── README.md
```

# Directory Purposes

| Directory | Contains |
|-----------|----------|
| `src/services/` | Business logic and domain services — the core of the application. Orchestrates clients and models. Knows nothing about HTTP: no status codes, no request/response objects, no headers. |
| `src/clients/` | External API clients, SDK wrappers, database connectors. Anything that talks to the outside world. |
| `src/models/` | Immutable data records: TypeScript interfaces/types, frozen Python dataclasses, Go structs, schemas, entities. Records are data with public read-only fields and no behavior; the [no-getters rule](/conventions/code-structure.md#no-getters-or-setters) governs the objects outside this directory that act on them. |
| `src/routes/` | HTTP routes, endpoints, and API route definitions. Route classes use object names such as `HttpRoute` or `OrderEndpoint`, never `Handler` or `Controller`. Thin — delegates to services. Route files contain route classes only; helpers go to `services/` or `clients/`, and response/error handling goes to `middleware/`. |
| `src/middleware/` | Cross-cutting HTTP concerns, one class per file: authentication and session lookup, request validation and parsing, the single `Result` → status code mapping, the single thrown-exception → 500 mapping, logging and request IDs, rate limiting, CORS. Each middleware is a class with constructor-injected dependencies and an interface; middleware that performs I/O also has a Fake under `tests/`. Nothing HTTP-shaped lives anywhere else in `src/`. Naming follows the same rule as routes: `BearerAuth`, `JsonBody`, `ResultResponse`, never `AuthHandler` or `ErrorInterceptor`. |

# Test Placement

Every project must have both a dedicated top-level `src/` directory and a dedicated top-level `tests/` directory. They are siblings and have distinct responsibilities:

- `src/` contains production source files only. Fake implementations are prohibited here.
- `tests/` contains test files and test-support code, including every hand-written Fake class.
- Test files and source files must never be co-located in the same directory.
- Every Fake must reside under `tests/`, never beside the interface or production implementation it implements.

```
project/
├── src/               # Production source only; no Fakes
└── tests/             # Tests, test support, and all Fakes
```

This separation is intentional and applies even when a language or framework commonly co-locates tests with source files. Configure the project's tools to discover tests and import Fake implementations from `tests/`; do not place tests or Fakes under `src/` or beside production files.

# Principle

> Five directories under `src/` cover every backend: `services`, `clients`, `models`, `routes`, and `middleware`. At the repository root, `src/`, `tests/`, and (for projects with a database) `migrations/` are the only code directories. Don't invent new folders without a strong reason.
