---
type: Workflow
title: Deployment Strategy
description: Decision framework for where to deploy — Vercel, Railway, or local — and when authentication gets added.
tags: [deployment, vercel, railway, local, clerk, auth, domains]
timestamp: 2026-06-19T00:00:00Z
---

# Platform Selection

| Project type | Platform | Why |
|-------------|----------|-----|
| **Static websites** | [Vercel](https://vercel.com) | Optimized for frontend — instant deploys, edge CDN, preview URLs per branch. |
| **Backend services** | [Railway](https://railway.app) | Simple container-based platform — give it a repo or Dockerfile, it builds and runs. Less platform lock-in than serverless. |
| **Local-only projects** | Local machine or home lab | When the project only ever needs to be available locally — internal tools, experiments, home automation. |

# The Authentication Boundary

Authentication isn't something I add by default. It's triggered by a specific threshold:

| State | Authentication |
|-------|---------------|
| **Local deployment** | None — I relax authentication and authorization concerns. The network boundary is the security boundary. |
| **Internet deployment** | [Clerk.com](https://clerk.com) — user management, social login, session handling. Added when the project goes public. |

# Domain Strategy

When a project gets deployed to the internet, I **purchase a domain** for it so it has a friendly, memorable name. No subdirectory-sharing or port-based URLs for public-facing services. A domain signals that the project is real.
