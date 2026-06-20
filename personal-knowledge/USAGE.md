---
type: Reference
title: USAGE — How Agents Reference This OKF Bundle
description: Copy-paste snippets for CLAUDE.md, AGENTS.md, and pi settings that point agents at this OKF bundle via GitHub URLs.
tags: [reference, usage, agents, claude-code, droid, pi, codestructure]
timestamp: 2026-06-19T00:00:00Z
---

# Overview

This bundle lives at:

```
https://github.com/leonj1/open-doc-format/tree/master/personal-knowledge
```

The snippets below use **raw GitHub URLs** so agents can read the content even when the files aren't on the local filesystem. Each snippet is self-contained — copy, paste, done.

---

# AGENTS.md — Universal (Claude Code, Droid, Codex, Devboxer, Cursor)

Create an `AGENTS.md` file at the root of any project where you want your conventions applied:

```markdown
# Jose's Coding Conventions

This project follows my personal conventions. Read the relevant documents
from my Open Knowledge Format (OKF) bundle before writing code.

## Must-Read Before Coding

- **Code Structure:**
  https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/code-structure.md

- **Project Structure:**
  https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/project-structure.md

- **Naming Conventions:**
  https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/naming.md

- **Git Commits:**
  https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/git-commits.md

## Key Rules (Quick Reference)

- Every I/O class gets an interface + production impl + Fake impl for tests
- Constructor-based dependency injection — no DI framework
- Classes <700 lines, functions <30 lines, max 2 indentations
- Route handlers never make I/O calls — delegate to services only
- Commit messages: FEAT/BUG/CHORE prefix, feature branches, main/master default
- Project layout: src/services, src/clients, src/models, src/routes

## Other Conventions (Read as Needed)

- **Languages:** https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/languages.md
- **Configuration:** https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/configuration.md
- **Dependencies:** https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/dependencies.md

## Deployment Conventions

- **Strategy:** https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/deployment/strategy.md
- **CI/CD:** https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/deployment/ci-cd.md
- **Docker:** https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/deployment/docker.md
- **Local Dev:** https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/deployment/local-dev-loop.md

## Full Bundle Index

https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/index.md
```

---

# CLAUDE.md — Claude Code Specific

For projects where you want Claude Code to apply your conventions, create `CLAUDE.md`:

```markdown
# Jose's Personal Conventions

Read my OKF convention documents before writing code. All URLs point to
the canonical bundle on GitHub.

## Code Structure (read first)
https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/code-structure.md

## Project Structure
https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/project-structure.md

## Naming
https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/naming.md

## Git Commits
https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/git-commits.md

## Key rules summary:
- Every I/O class: interface + production impl + Fake impl
- Constructor injection, no DI framework
- Classes <700 lines, functions <30 lines, max 2 indentations
- Route handlers never do I/O — delegate to services
- Commit: FEAT/BUG/CHORE prefix on main/master from feature branches
- Project layout: src/services, src/clients, src/models, src/routes
- TypeScript for AI/LLM, Python for extensibility, Go for static binaries
- Dockerfiles by default, docker-compose for multi-container
- make build, make test, make start, make stop, make restart
```

If you prefer not to inline URLs, add the bundle as an additional directory
when launching Claude Code:

```bash
claude --add-dir ~/src/open-doc-format/personal-knowledge
```

Then reference files with local paths in CLAUDE.md:

```markdown
Before writing code, read the OKF conventions:
- conventions/code-structure.md    (I/O interfaces, DI, size limits)
- conventions/project-structure.md (src/services, clients, models, routes)
- conventions/git-commits.md       (FEAT/BUG/CHORE, feature branches)
```

---

# Pi — Settings and Context

### Option A: Context Files in settings.json

Add to `.pi/settings.json` in any project:

```json
{
  "contextFiles": [
    "https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/code-structure.md",
    "https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/project-structure.md",
    "https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/naming.md",
    "https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/git-commits.md"
  ]
}
```

Pi loads these files into context at the start of every session.

### Option B: Additional Directory

Launch pi with the bundle directory added:

```bash
pi --add-dir ~/src/open-doc-format/personal-knowledge
```

### Option C: Use the OKF Extension

The OKF extension in `.pi/extensions/okf.ts` gives you:
- `/okf-validate` — check bundle conformance
- `/okf-interview` — expand the bundle with more knowledge
- 7 OKF tools the LLM can call (`okf_create_concept`, `okf_validate_bundle`, etc.)

---

# Droid / Factory

### Option A: AGENTS.md

Create `AGENTS.md` (use the universal snippet above). Droid reads it at startup.

### Option B: Personal Conventions Skill

Create `.factory/skills/personal-conventions/SKILL.md`:

```yaml
---
name: personal-conventions
description: Jose's coding conventions — I/O interfaces, dependency injection, class/function size limits, route discipline, commit format, and project structure. Apply when writing or reviewing code.
---

# Jose's Coding Conventions

Read these OKF concept documents before writing any code:

## Must-Read

- Code Structure: https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/code-structure.md
- Project Structure: https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/project-structure.md
- Naming: https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/naming.md
- Git Commits: https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/git-commits.md

## Key Rules (Quick Reference)

- Every I/O class gets an interface + production impl + Fake impl for tests
- Constructor-based dependency injection — no DI framework
- Classes <700 lines, functions <30 lines, max 2 indentations
- Route handlers never make I/O calls — delegate to services only
- Commit messages: FEAT/BUG/CHORE prefix, feature branches, main/master default
- Project layout: src/services, src/clients, src/models, src/routes
- TypeScript for AI/LLM backends, Python for extensibility, Go for static binaries
- Dockerfiles by default, docker-compose for multi-container
- make build, make test, make start, make stop, make restart

## Full Bundle

Index: https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/index.md
```

---

# Quick Reference — All Raw URLs

| Document | Raw URL |
|----------|---------|
| **Bundle Index** | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/index.md` |
| Code Structure | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/code-structure.md` |
| Project Structure | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/project-structure.md` |
| Naming | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/naming.md` |
| Languages | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/languages.md` |
| Configuration | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/configuration.md` |
| Git Commits | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/git-commits.md` |
| Dependencies | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/conventions/dependencies.md` |
| Deployment Strategy | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/deployment/strategy.md` |
| CI/CD | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/deployment/ci-cd.md` |
| Docker | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/deployment/docker.md` |
| Secrets | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/deployment/secrets.md` |
| Local Dev Loop | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/deployment/local-dev-loop.md` |
| Devboxer Deployments | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/deployment/devboxer-deployments.md` |
| Coding Modalities | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/tools/coding-modalities.md` |
| CLI Tools | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/tools/cli-tools.md` |
| Dotfiles | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/tools/dotfiles.md` |
| Machine Bootstrap | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/tools/machine-bootstrap.md` |
| Intel (Server) | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/homelab/hardware/intel.md` |
| AMD (Server) | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/homelab/hardware/amd.md` |
| Client Devices | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/homelab/hardware/client-devices.md` |
| Storage | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/homelab/storage.md` |
| Services | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/homelab/services/overview.md` |
| Network Topology | `https://raw.githubusercontent.com/leonj1/open-doc-format/refs/heads/master/personal-knowledge/homelab/network/topology.md` |
