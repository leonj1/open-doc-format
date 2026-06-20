---
type: Reference
title: USAGE — How Agents Reference This OKF Bundle
description: Copy-paste snippets for CLAUDE.md, AGENTS.md, and pi settings. Bundle is in a private GitHub repo — agents access it via gh CLI, local clone, or inline rules.
tags: [reference, usage, agents, claude-code, droid, pi, codestructure]
timestamp: 2026-06-19T00:00:00Z
---

# Overview

This bundle lives in a **private** GitHub repo:

```
https://github.com/leonj1/open-doc-format/tree/master/personal-knowledge
```

Since the repo is private, raw.githubusercontent.com URLs return 404.
Use one of these three approaches instead.

---

# Approach 1: Clone Once, Use Local Paths (Recommended)

Clone the bundle once, then reference local paths in every project's config:

```bash
gh repo clone leonj1/open-doc-format ~/src/open-doc-format
```

Then your agent configs use local file paths (no network, no auth, instant).
Snippets below assume `~/src/open-doc-format/personal-knowledge/`.

---

# Approach 2: Fetch on Demand with gh CLI

Agents with `gh` access can fetch individual files:

```bash
gh api repos/leonj1/open-doc-format/contents/personal-knowledge/conventions/code-structure.md \
  --jq ".content" | base64 -d
```

This returns the file content from the GitHub API. Works for private repos
as long as `gh auth status` passes.

---

# Approach 3: Inline Key Rules (No Fetch Needed)

Embed the critical rules directly in your config files. The agent reads them
immediately without fetching anything. Use the snippets below.

---

# AGENTS.md — Universal (Claude Code, Droid, Codex, Devboxer, Cursor)

Create an `AGENTS.md` at the root of any project. This version bakes in the
key rules and tells agents how to fetch the full bundle on demand.

```markdown
# Jose's Coding Conventions

This project follows my personal conventions, documented in full at:
  https://github.com/leonj1/open-doc-format/tree/master/personal-knowledge

The bundle is in a private repo. Clone it once for local access:
  gh repo clone leonj1/open-doc-format ~/src/open-doc-format

Then read relevant docs from ~/src/open-doc-format/personal-knowledge/.

To fetch a single file without cloning:
  gh api repos/leonj1/open-doc-format/contents/personal-knowledge/conventions/code-structure.md --jq ".content" | base64 -d

---

## Key Rules (applied to all code in this project)

### I/O Interface Pattern
Every class that performs I/O (network, disk, database, HTTP) gets:
- An interface
- A production implementation
- A Fake implementation (hand-written, used only in unit tests)

### Dependency Injection
Constructor injection. No DI framework. Dependencies are explicit — passed
through constructors, never imported or instantiated directly.

### Size and Complexity Limits
- Classes: fewer than 700 lines
- Functions: fewer than 30 lines
- Indentation: max 2 levels (extract early if deeper)

### Route Handler Discipline
Route handlers in src/routes/ call services in src/services/ ONLY.
Handlers never make I/O calls directly.
```
Request → Route Handler → Service → Client (I/O interface) → External World

### Project Layout
```
project/
├── src/
│   ├── services/      # Business logic
│   ├── clients/       # External API clients, DB connectors
│   ├── models/        # Types, schemas, entities
│   └── routes/        # HTTP handlers (thin, delegates to services)
└── tests/             # Top-level, sibling to src/
```

### Naming
Classes = nouns. Functions = verbs. Top-level classes short (Report),
deeper classes longer (PdfReport). Follow language conventions otherwise.

### Commits
FEAT: for features. BUG: for bug fixes. CHORE: for trivial changes.
Default branch: main or master. Feature branches for features and hotfixes.
Rare direct commits to main for quick fixes.

### Languages
- TypeScript: AI/LLM backends, when strong types needed
- Python: backends needing extensibility
- Go: when a statically linked binary matters
- Java: optional, when required
- Rust: rare, only when the project demands it

### Configuration
- Config files: values that vary per environment (DB strings, file paths)
- Environment variables: production/staging credentials
- .env files: local dev credentials (never committed)

### Docker and Dev Loop
- Dockerfile by default for all projects
- docker-compose for multi-container projects
- Makefile in every project: make build, make test, make start, make stop, make restart
- Omit Dockerfile only when host filesystem access is required

### Full Bundle
Read more at ~/src/open-doc-format/personal-knowledge/index.md after cloning.
```

---

# CLAUDE.md — Claude Code Specific

```markdown
# Jose's Personal Conventions

Full OKF bundle: https://github.com/leonj1/open-doc-format/tree/master/personal-knowledge

Clone for local access:
  gh repo clone leonj1/open-doc-format ~/src/open-doc-format

Fetch any doc on demand:
  gh api repos/leonj1/open-doc-format/contents/personal-knowledge/<path> --jq ".content" | base64 -d

---

## Code Structure (read first)
~/src/open-doc-format/personal-knowledge/conventions/code-structure.md
Key: I/O interfaces + Fake impls, constructor DI, <700-line classes, <30-line functions, ≤2 indentations

## Project Structure
~/src/open-doc-format/personal-knowledge/conventions/project-structure.md
Key: src/services, src/clients, src/models, src/routes, tests/ at top level

## Naming
~/src/open-doc-format/personal-knowledge/conventions/naming.md
Key: nouns for classes, verbs for functions, depth = name length

## Git Commits
~/src/open-doc-format/personal-knowledge/conventions/git-commits.md
Key: FEAT/BUG/CHORE prefixes, feature branches, main/master default

## Deployment
~/src/open-doc-format/personal-knowledge/deployment/
Key: Vercel for static, Railway for backends, Dockerfiles, docker-compose, Makefile

---

Before writing code:
1. Read ~/src/open-doc-format/personal-knowledge/conventions/code-structure.md
2. Read ~/src/open-doc-format/personal-knowledge/conventions/project-structure.md
3. Apply all rules listed above
```

For Claude Code, you can also add the directory at launch:

```bash
claude --add-dir ~/src/open-doc-format/personal-knowledge
```

---

# Pi

### Context Files in .pi/settings.json

After cloning to `~/src/open-doc-format/`:

```json
{
  "contextFiles": [
    "~/src/open-doc-format/personal-knowledge/conventions/code-structure.md",
    "~/src/open-doc-format/personal-knowledge/conventions/project-structure.md",
    "~/src/open-doc-format/personal-knowledge/conventions/naming.md",
    "~/src/open-doc-format/personal-knowledge/conventions/git-commits.md"
  ]
}
```

### Additional Directory

```bash
pi --add-dir ~/src/open-doc-format/personal-knowledge
```

### OKF Extension

The `.pi/extensions/okf.ts` extension (in the same repo) gives you:
- `/okf-validate` — check the bundle
- `/okf-interview` — expand the bundle
- 7 OKF tools for creating, validating, and managing OKF concepts

---

# Droid / Factory

### Personal Conventions Skill

Create `.factory/skills/personal-conventions/SKILL.md`:

```yaml
---
name: personal-conventions
description: Jose's coding conventions — I/O interfaces, DI, class/function size limits, route discipline, commit format, and project structure. Apply when writing or reviewing code.
---

# Jose's Coding Conventions

Full bundle: https://github.com/leonj1/open-doc-format/tree/master/personal-knowledge
Clone: gh repo clone leonj1/open-doc-format ~/src/open-doc-format

## Key Rules

- Every I/O class gets an interface + production impl + Fake impl for tests
- Constructor-based dependency injection — no DI framework
- Classes <700 lines, functions <30 lines, max 2 indentations
- Route handlers never make I/O calls — delegate to services only
- Commit messages: FEAT/BUG/CHORE prefix, feature branches, main/master default
- Project layout: src/services, src/clients, src/models, src/routes
- TypeScript for AI/LLM backends, Python for extensibility, Go for static binaries
- Dockerfiles by default, docker-compose for multi-container
- make build, make test, make start, make stop, make restart

## Fetch Full Docs

After cloning, read from ~/src/open-doc-format/personal-knowledge/.
Before cloning, fetch individual files:
  gh api repos/leonj1/open-doc-format/contents/personal-knowledge/conventions/code-structure.md --jq ".content" | base64 -d
```

---

# GitHub API Reference — All File Paths

These paths work with `gh api repos/leonj1/open-doc-format/contents/<path>`:

| Document | API Path |
|----------|----------|
| **Bundle Index** | `personal-knowledge/index.md` |
| USAGE (this file) | `personal-knowledge/USAGE.md` |
| Code Structure | `personal-knowledge/conventions/code-structure.md` |
| Project Structure | `personal-knowledge/conventions/project-structure.md` |
| Naming | `personal-knowledge/conventions/naming.md` |
| Languages | `personal-knowledge/conventions/languages.md` |
| Configuration | `personal-knowledge/conventions/configuration.md` |
| Git Commits | `personal-knowledge/conventions/git-commits.md` |
| Dependencies | `personal-knowledge/conventions/dependencies.md` |
| Deployment Strategy | `personal-knowledge/deployment/strategy.md` |
| CI/CD | `personal-knowledge/deployment/ci-cd.md` |
| Docker | `personal-knowledge/deployment/docker.md` |
| Secrets | `personal-knowledge/deployment/secrets.md` |
| Local Dev Loop | `personal-knowledge/deployment/local-dev-loop.md` |
| Devboxer Deployments | `personal-knowledge/deployment/devboxer-deployments.md` |
| Coding Modalities | `personal-knowledge/tools/coding-modalities.md` |
| CLI Tools | `personal-knowledge/tools/cli-tools.md` |
| Dotfiles | `personal-knowledge/tools/dotfiles.md` |
| Machine Bootstrap | `personal-knowledge/tools/machine-bootstrap.md` |
| Intel (Server) | `personal-knowledge/homelab/hardware/intel.md` |
| AMD (Server) | `personal-knowledge/homelab/hardware/amd.md` |
| Client Devices | `personal-knowledge/homelab/hardware/client-devices.md` |
| Storage | `personal-knowledge/homelab/storage.md` |
| Services | `personal-knowledge/homelab/services/overview.md` |
| Network Topology | `personal-knowledge/homelab/network/topology.md` |

Fetch any of these with:
```bash
gh api repos/leonj1/open-doc-format/contents/<path> --jq ".content" | base64 -d
```
