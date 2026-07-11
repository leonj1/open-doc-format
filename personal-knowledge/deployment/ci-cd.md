---
type: Workflow
title: CI/CD and Deployment Triggers
description: How code reaches production — Dockerfile-first builds, manual repo registration, git webhooks, and commit-triggered deploys.
tags: [deployment, ci-cd, dockerfile, vercel, railway, webhooks]
timestamp: 2026-07-11T00:00:00Z
---

# No CI/CD Pipelines

I don't use GitHub Actions, CircleCI, or any standalone CI/CD platform. No build pipelines, no test gates, no staging environments.

# Deployment Flow

1. **Register the repo** manually in Vercel or Railway's dashboard.
2. **Enable the git webhook** — the platform connects to GitHub and listens for commits.
3. **Push to the default branch** (`main` or `master`).
4. The platform **builds and deploys automatically** on commit, using the repository's Dockerfile by default.

That's the entire pipeline. Push = deploy.

# Dockerfile Is the Default Build Definition

Every deployable repository maintains a `Dockerfile` by default. It is the authoritative build recipe for local and hosted deployments. Railway and any other container-capable platform must build from that Dockerfile rather than infer a platform-native build configuration.

A platform-native builder may replace the Dockerfile only when the deployment target cannot build or run containers. That exception must be explicit in the repository documentation; it must never be assumed merely because the platform offers automatic build detection.

# Platforms

| Platform | How it's triggered |
|----------|-------------------|
| [Vercel](https://vercel.com) | Git webhook on default branch → auto-build → auto-deploy |
| [Railway](https://railway.app) | Git webhook on default branch → auto-build → auto-deploy |

# Why This Works

- The projects are personal — no coordination with other developers, no review gates.
- The deployment platform executes the build, but the repository's Dockerfile defines that build by default.
- A broken deploy is quickly noticed and fixed with another commit. Rollback is `git revert` and push.
