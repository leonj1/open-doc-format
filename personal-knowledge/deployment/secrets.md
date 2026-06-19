---
type: Convention
title: Secrets Management
description: How secrets reach production — Vercel and Railway dashboard environment variables. Local uses .env files.
tags: [deployment, secrets, vercel, railway, security]
timestamp: 2026-06-19T00:00:00Z
---

# Production Secrets

I create environment variables directly in the platform dashboards:

| Platform | Where |
|----------|-------|
| [Vercel](https://vercel.com) | Project Settings → Environment Variables |
| [Railway](https://railway.app) | Service → Variables |

The platforms inject them at runtime. They never appear in the repository, never in a config file, never in a Dockerfile.

# Local Secrets

As described in [Configuration Management](/conventions/configuration.md), local development secrets live in `.env` files — never committed.

# No External Secret Store

I don't use HashiCorp Vault, SOPS, Infisical, or any dedicated secret management tool. For personal projects, the platform dashboards are sufficient.
