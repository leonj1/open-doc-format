---
type: Workflow
title: CI/CD and Deployment Triggers
description: How code reaches production — manual repo registration, git webhooks, and commit-triggered deploys.
tags: [deployment, ci-cd, vercel, railway, webhooks]
timestamp: 2026-06-19T00:00:00Z
---

# No CI/CD Pipelines

I don't use GitHub Actions, CircleCI, or any standalone CI/CD platform. No build pipelines, no test gates, no staging environments.

# Deployment Flow

1. **Register the repo** manually in Vercel or Railway's dashboard.
2. **Enable the git webhook** — the platform connects to GitHub and listens for commits.
3. **Push to the default branch** (`main` or `master`).
4. The platform **builds and deploys automatically** on commit.

That's the entire pipeline. Push = deploy.

# Platforms

| Platform | How it's triggered |
|----------|-------------------|
| [Vercel](https://vercel.com) | Git webhook on default branch → auto-build → auto-deploy |
| [Railway](https://railway.app) | Git webhook on default branch → auto-build → auto-deploy |

# Why This Works

- The projects are personal — no coordination with other developers, no review gates.
- Vercel and Railway handle the build step — I don't maintain Dockerfiles or build scripts.
- A broken deploy is quickly noticed and fixed with another commit. Rollback is `git revert` and push.
