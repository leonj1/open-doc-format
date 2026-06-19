---
type: Convention
title: Configuration Management
description: How I handle config files, environment variables, and credentials across local, staging, and production environments.
tags: [conventions, configuration, secrets, environment]
timestamp: 2026-06-19T00:00:00Z
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

# What's Never Committed

- `.env` files — in `.gitignore` always.
- Any file containing credentials, tokens, or API keys.
