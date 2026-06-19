---
type: Workflow
title: Devboxer Deployments
description: Devboxer uses a Railway API token to manage cloud deployments on my behalf — creating, updating, and monitoring services when prompted.
tags: [deployment, devboxer, railway, automation]
timestamp: 2026-06-19T00:00:00Z
---

# How It Works

Devboxer holds a **Railway API token** with deployment permissions. When I prompt it to deploy or manage a service, it calls the Railway API directly from its cloud environment.

# What It Can Do

- Create new Railway services from a GitHub repo.
- Update existing services (new commits, config changes).
- Monitor deployment status.
- Manage environment variables on Railway.

# Relationship to Manual Deploys

Devboxer doesn't replace manual deploys — it's an **alternative path**. When I'm working through Devboxer (remote, AI-driven, producing PRs), I can also ask it to handle the deployment without switching contexts. When I'm working locally with VSCode or the CLI, I register repos and manage deploys manually.

# Credential Scope

The token is scoped to Railway only. No access to Vercel, my home lab, or any other platform. Devboxer is a Railway deployment tool, not a universal infrastructure manager.
