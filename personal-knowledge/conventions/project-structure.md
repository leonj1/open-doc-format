---
type: Convention
title: Project Structure
description: Standard backend layout with production source in src/ and tests, test-support code, and all Fake classes in tests/.
tags: [conventions, structure, backend, project-layout, testing, fakes]
timestamp: 2026-07-11T00:00:00Z
---

# Standard Backend Layout

```
project/
├── src/
│   ├── services/      # Business logic and domain services
│   ├── clients/       # External API clients, SDK wrappers, database connectors
│   ├── models/        # Data models, types, schemas, entities
│   └── routes/        # HTTP handlers, controllers, API route definitions
├── tests/
│   ├── fakes/         # All hand-written Fake implementations
│   └── ...            # Test files and other test-support code
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

> Four directories cover every backend. Don't invent new top-level folders without a strong reason.
