---
type: Convention
title: Configuration Management
description: How I handle config files, environment variables, credentials, required configuration values, and explicit function arguments across local, staging, and production environments.
tags: [conventions, configuration, secrets, environment, no-fallbacks]
timestamp: 2026-07-11T00:00:00Z
---

# Three-Tier Configuration Strategy

| Tier | Method | What goes there |
|------|--------|-----------------|
| **Environment-agnostic** | Configuration files (`.properties`, `.yaml`, `.json`) | Values that rarely change but vary per environment — database connection strings, file paths, feature flags |
| **Production / Staging** | Environment variables | Credentials, API keys, secrets — never in files |
| **Local development** | `.env` file | Credentials for local services — read by the app in dev mode, never committed |

# Rationale

- **Config files** for non-sensitive, environment-differentiated settings. A `production.properties` vs `development.properties` is fine.
- **Environment variables** for production secrets because they're injected by the platform (Vercel, Railway, Docker), not stored in the repo.
- **`.env` files** for local convenience because copying secrets from a password manager into env vars on every shell session is friction I don't need.

# Function Arguments Never Have Defaults

Every function parameter is required. Function signatures must not declare default argument values, infer omitted arguments, or make arguments optional as a substitute for requiring the caller to choose a value. Every caller must explicitly pass every argument at every call site.

| Good | Bad |
|------|-----|
| `connect(host, port, timeout)` | `connect(host, port=5432, timeout=30)` |
| `connect(host="db.internal", port=5432, timeout=30)` | `connect(host="db.internal")` |

This rule applies even when one value is commonly used. Repetition at call sites is intentional because it keeps each caller's choice visible.

# Configuration Values Have No Implicit Fallbacks

When code is told to read a value from a specific configuration source, it must read that source only unless a fallback is explicitly specified.

Examples:
- If the database connection string is defined as an environment variable, read that environment variable and fail clearly when it is missing.
- Do not add a default connection string, localhost URL, sample token, alternate environment variable name, or config-file fallback unless the requirement names that fallback.
- Local development should provide required values through `.env` or the documented setup path, not through hidden defaults in application code.

# What's Never Committed

- `.env` files — in `.gitignore` always.
- Any file containing credentials, tokens, or API keys.
