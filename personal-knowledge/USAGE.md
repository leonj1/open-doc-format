---
type: Reference
title: USAGE — How Agents Reference This OKF Bundle
description: Reference paths for CLAUDE.md, AGENTS.md, and pi settings. Bundle is in a private GitHub repo — agents access it via gh CLI or local clone.
tags: [reference, usage, agents, claude-code, droid, pi, codestructure]
timestamp: 2026-10-08T00:00:00Z
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

# Approach 3: Copy Agent Files (No Fetch at Runtime)

Copy the standalone agent files into each project's config. The agent reads
them immediately without fetching anything at runtime. Use the snippets below.

---

# AGENTS.md — Universal (Claude Code, Droid, Codex, Devboxer, Cursor)

Create an `AGENTS.md` at the root of any project by copying:

```bash
cp ~/src/open-doc-format/personal-knowledge/AGENTS.md ./AGENTS.md
```

Fetch it directly with `gh`:

```bash
gh api repos/leonj1/open-doc-format/contents/personal-knowledge/AGENTS.md --jq ".content" | base64 -d
```

---

# CLAUDE.md — Claude Code Specific

Create a `CLAUDE.md` at the root of any project by copying:

```bash
cp ~/src/open-doc-format/personal-knowledge/CLAUDE.md ./CLAUDE.md
```

Fetch it directly with `gh`:

```bash
gh api repos/leonj1/open-doc-format/contents/personal-knowledge/CLAUDE.md --jq ".content" | base64 -d
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
    "~/src/open-doc-format/personal-knowledge/conventions/before-coding.md",
    "~/src/open-doc-format/personal-knowledge/conventions/code-structure.md",
    "~/src/open-doc-format/personal-knowledge/conventions/data-structures.md",
    "~/src/open-doc-format/personal-knowledge/conventions/project-structure.md",
    "~/src/open-doc-format/personal-knowledge/conventions/naming.md",
    "~/src/open-doc-format/personal-knowledge/conventions/git-commits.md",
    "~/src/open-doc-format/personal-knowledge/conventions/code-hygiene.md",
    "~/src/open-doc-format/personal-knowledge/references/elegant-objects.md"
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
description: Jose's coding conventions — deciding whether and what to code, I/O interfaces, manual DI, Elegant Objects rules (no null, no getters, class caps), size limits, route and middleware discipline, code hygiene defaults, commit format, and project structure. Apply when exploring, designing, writing, or reviewing code.
---

# Jose's Coding Conventions

Full bundle: https://github.com/leonj1/open-doc-format/tree/master/personal-knowledge
Clone: gh repo clone leonj1/open-doc-format ~/src/open-doc-format

## Before Coding

Read the affected code and trace its callers before choosing a solution.
Omit speculative work. Search for reusable code, then prefer standard-library
features, native platform capabilities, and installed dependencies before
writing the smallest necessary change. Avoid scaffolding for hypothetical needs.
Preserve explicit requirements, validation, security, accessibility, and data-loss
protection; the implementation rules below still apply, including required tests.
Full guidance: conventions/before-coding.md.

## Key Rules

- Every I/O class gets a stable project-owned interface + production impl + Fake impl stored under tests/; external contract changes stay in the production adapter, while Fakes test consumers without claiming to test the real boundary
- Constructor-based dependency injection — no DI framework or container (no Spring/NestJS/Angular injector, Guice, tsyringe, inversify, wire, fx); one composition root is the only place that `new`s production classes
- Implement logic exactly as specified — no default values, alternate sources, or fallback paths unless explicitly requested
- All function arguments strongly typed — wrap every primitive argument in a typed object (`EmailAddress` not `string`, `Port` not `int`); long call sites mean introduce a record, not fall back to primitives
- Functions return values — never mutate incoming arguments, including in Go (value receivers) and Python (frozen dataclasses)
- Never accept or return `null`/`undefined`/`None`/`nil`; absence is a `Result` error, a tagged-union case, or a null object; no optional parameters
- No getters or setters, no public fields, no mutators on classes outside `src/models/`; ask the object to act or render itself. `src/models/` holds immutable data records with read-only fields and no behavior
- Every public method implements an interface — clients, services, and middleware all have one
- Classes are final or abstract (never subclass a concrete class; no concrete struct embedding in Go); constructors only assign fields; no `new` outside the composition root, secondary constructors, and value objects; no public constants; no `instanceof`/`isinstance`/type switches/casts
- Never default to lists/maps — pick the most constrained structure whose operations match the problem (priority queue, stack, queue, set, counter, ring buffer); enums/tagged unions over magic strings and boolean flags; wrap raw structures in domain classes; a plain list or map requires a stated justification (full guidance: conventions/data-structures.md)
- No static classes or properties — everything is an instance
- Result types over exceptions — never use exceptions for control flow
- Quality tests prove exact results, state changes, boundary payloads, and prohibited side effects; a success flag alone is insufficient
- Classes <700 lines, functions <30 lines, max 2 indentations, ≤4 fields per class, <5 public methods per class, ≤5 methods per interface
- Routes and endpoints never make I/O calls — delegate to services only; route classes use object names such as `HttpRoute` or `OrderEndpoint`, never `Handler` or `Controller`
- Services never return, embed, or accept HTTP status codes or request/response objects — they return domain-named errors (`OutOfStock`), and one response middleware maps `Result` → status code
- All middleware (auth, validation, `Result` → HTTP, error → 500, logging) lives in `src/middleware/`, one class per file, with an interface and a Fake under `tests/` where it does I/O; routes contain no try/catch and no helpers
- Commit messages: FEAT/BUG/CHORE prefix, feature branches, main/master default
- Project layout: `src/services`, `src/clients`, `src/models`, `src/routes`, `src/middleware`, plus `migrations/` when there is a database; tests, test-support code, and every Fake only in a separate top-level tests/ directory; never co-locate production and test code
- TypeScript for AI/LLM backends, Python for extensibility, Go for static binaries
- Dockerfiles by default, docker-compose for multi-container
- make build, make lint, make test, make start, make stop, make restart (and make migrate when there is a DB)
- Naming: manipulator methods are verbs (`save()`), builders are nouns (`total()`, `asPdf()`), booleans are adjectives (`empty()`); no `get`/`set` prefixes
- Code hygiene defaults: one formatter + one linter + strict type check per language run by `make lint`; structured JSON logging to stdout through an injected `Log` interface, never log secrets; docstrings on interface methods only, no narration or commented-out code; timestamped forward-only migrations in `migrations/` applied by `make migrate`; `/v1/` path-prefix API versioning with at most two live versions; TanStack Query + Zustand + React Hook Form/Zod for frontend state, Tailwind + shadcn/ui + cva for styling (full guidance: conventions/code-hygiene.md)
- Elegant Objects principles: no -er class names, immutable objects, no static/utility classes, no getters/setters, no NULL args or returns, always use interfaces, final or abstract classes, code-free constructors, no public constants, no casting, fakes over mocks; Result values override checked exceptions (rules: conventions/code-structure.md Object Design; full list: references/elegant-objects.md)

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
| AGENTS | `personal-knowledge/AGENTS.md` |
| CLAUDE | `personal-knowledge/CLAUDE.md` |
| Before Coding | `personal-knowledge/conventions/before-coding.md` |
| Code Structure | `personal-knowledge/conventions/code-structure.md` |
| Data Structures | `personal-knowledge/conventions/data-structures.md` |
| Project Structure | `personal-knowledge/conventions/project-structure.md` |
| Naming | `personal-knowledge/conventions/naming.md` |
| Code Hygiene | `personal-knowledge/conventions/code-hygiene.md` |
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
| Elegant Objects (book ref) | `personal-knowledge/references/elegant-objects.md` |

Fetch any of these with:
```bash
gh api repos/leonj1/open-doc-format/contents/<path> --jq ".content" | base64 -d
```
