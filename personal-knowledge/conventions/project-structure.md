---
type: Convention
title: Project Structure
description: Standard backend layout with production source and test code kept in dedicated, separate src/ and tests/ directories.
tags: [conventions, structure, backend, project-layout, testing]
timestamp: 2026-07-10T00:00:00Z
---

# Standard Backend Layout

```
project/
├── src/
│   ├── services/      # Business logic and domain services
│   ├── clients/       # External API clients, SDK wrappers, database connectors
│   ├── models/        # Data models, types, schemas, entities
│   └── routes/        # HTTP handlers, controllers, API route definitions
├── tests/             # Test suite; never mixed into src/
├── package.json        # or pyproject.toml, go.mod, etc.
└── README.md
```

# Directory Purposes

| Directory | Contains |
|-----------|----------|
| `src/services/` | Business logic and domain services — the core of the application. Orchestrates clients and models. |
| `src/clients/` | External API clients, SDK wrappers, database connectors. Anything that talks to the outside world. |
| `src/models/` | Data models, TypeScript interfaces/types, Python dataclasses, Go structs, schemas, entities. |
| `src/routes/` | HTTP handlers, controllers, API route definitions. Thin — delegates to services. |

# Test Placement

Every project must have both a dedicated top-level `src/` directory and a dedicated top-level `tests/` directory. They are siblings and have distinct responsibilities:

- `src/` contains production source files only.
- `tests/` contains test files only.
- Test files and source files must never be co-located in the same directory.

```
project/
├── src/               # Production source only
└── tests/             # Tests only
```

This separation is intentional and applies even when a language or framework commonly co-locates tests with source files. Configure the project's tools to discover and run tests from `tests/`; do not place tests under `src/` or beside production files.

# Principle

> Four directories cover every backend. Don't invent new top-level folders without a strong reason.
