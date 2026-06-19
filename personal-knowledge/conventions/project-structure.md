---
type: Convention
title: Project Structure
description: Standard directory layout for backend projects — services, clients, models, routes — and test placement rules.
tags: [conventions, structure, backend, project-layout]
timestamp: 2026-06-19T00:00:00Z
---

# Standard Backend Layout

```
project/
├── src/
│   ├── services/      # Business logic and domain services
│   ├── clients/       # External API clients, SDK wrappers, database connectors
│   ├── models/        # Data models, types, schemas, entities
│   └── routes/        # HTTP handlers, controllers, API route definitions
├── tests/             # Test suite (preferred location)
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

Tests live in a top-level `tests/` directory, **sibling to `src/`**:

```
project/
├── src/
└── tests/
```

**Exception:** If the language or framework convention demands co-located test files (e.g., Go's `_test.go` alongside the source, Rust's `#[cfg(test)]` modules), I follow the language convention rather than forcing the `tests/` directory pattern.

# Principle

> Four directories cover every backend. Don't invent new top-level folders without a strong reason.
