# Personal Knowledge — Update Log

## 2026-07-23
* **Creation**: Added [I Have ADHD — ADHD-Friendly AI Output Style](/references/i-have-adhd.md), documenting the skill's action-first response model, ten rules, safety and ambiguity exceptions, installation paths, and customization workflow.

## 2026-07-11
* **Update**: [Code Structure and Patterns](/conventions/code-structure.md) now defines interfaces as stable, project-owned abstractions around external boundaries. Fakes test consumer behavior without touching or claiming to verify the real boundary; production adapters use separate contract or integration tests. The guidance also explains why hand-written Fakes are preferred over configurable mocking frameworks without claiming that either guarantees correctness.

## 2026-07-10
* **Update**: [Project Structure](/conventions/project-structure.md) now requires dedicated, separate top-level `src/` and `tests/` directories. Production source and test files must never be co-located, including in languages that commonly place them together.

## 2026-06-23
* **Update**: Added no-implicit-fallbacks coding rule to [Code Structure and Patterns](/conventions/code-structure.md), [Configuration Management](/conventions/configuration.md), and the inline agent snippets in [USAGE.md](/USAGE.md). Required values must come from the specified source and fail clearly when absent unless a fallback is explicitly stated.

## 2026-06-20
* **Creation**: Added [References](/references/index.md) section with [Elegant Objects (Yegor Bugayenko)](/references/elegant-objects.md) — the book's 23 OOP recommendations, captured from OCR-extracted markdown of a scanned copy and cross-linked to [Code Structure](/conventions/code-structure.md) and [Naming Conventions](/conventions/naming.md).
* **Update**: Promoted Elegant Objects to an applied convention — added its principles to the inlined Key Rules in [USAGE.md](/USAGE.md) (AGENTS.md, CLAUDE.md, Pi contextFiles, and the Droid skill) so agents follow them when writing code, not just reference them.

## 2026-06-19
* **Creation**: Documented [USAGE.md](/USAGE.md) — copy-paste snippets for AGENTS.md, CLAUDE.md, Pi, and Droid using gh CLI and local clone paths (private repo compatible). Includes full inline key rules so agents don't need to fetch.
* **Update**: [Dependencies and Libraries](/conventions/dependencies.md) — changed from "avoid latest" to "always use latest versions" of every dependency; lockfiles pin the latest, not stale versions
* **Update**: [Code Structure and Patterns](/conventions/code-structure.md) — added code coverage requirement: above 80% enforced in CI or manually before merge; consumer code isolated from I/O through Fake implementations
* **Update**: Expanded [Code Structure and Patterns](/conventions/code-structure.md) — added Testing Philosophy: tests must assert functional user outcomes (BDD), not technical implementation details. Asserting fields is banned; asserting user-visible behavior is required. Implementation detail tests freeze the codebase and are not allowed.
* **Creation**: Documented [Coding Modalities](/tools/coding-modalities.md) — VSCode, Zed, Devboxer, Telegram
* **Creation**: Documented [CLI Tools](/tools/cli-tools.md) — Bash, tmux, vim, jq, curl, git, AI agents
* **Creation**: Documented [Dotfiles Philosophy](/tools/dotfiles.md) — stock defaults for portability
* **Creation**: Documented [Machine Bootstrap](/tools/machine-bootstrap.md) — 5-step fresh machine setup
* **Creation**: Documented [Language Preferences](/conventions/languages.md) — TypeScript, Python, Go, Java, Rust
* **Creation**: Documented [Project Structure](/conventions/project-structure.md) — services, clients, models, routes
* **Creation**: Documented [Naming Conventions](/conventions/naming.md) — nouns for classes, verbs for functions
* **Creation**: Documented [Configuration Management](/conventions/configuration.md) — files, env vars, .env
* **Creation**: Documented [Git and Commits](/conventions/git-commits.md) — FEAT/BUG/CHORE, feature branches
* **Creation**: Documented [Dependencies and Libraries](/conventions/dependencies.md) — pinned versions, mux, zerolog
* **Creation**: Documented [Deployment Strategy](/deployment/strategy.md) — Vercel, Railway, local
* **Creation**: Documented [CI/CD and Triggers](/deployment/ci-cd.md) — git webhook on commit
* **Creation**: Documented [Docker and Containers](/deployment/docker.md) — Dockerfiles as default
* **Creation**: Documented [Secrets Management](/deployment/secrets.md) — platform dashboard env vars
* **Creation**: Documented [Local Development Loop](/deployment/local-dev-loop.md) — Docker Compose + Makefile
* **Creation**: Documented [Devboxer Deployments](/deployment/devboxer-deployments.md) — Railway via API token
* **Creation**: Documented [Intel](/homelab/hardware/intel.md) and [AMD](/homelab/hardware/amd.md) servers
* **Creation**: Documented [Client Devices](/homelab/hardware/client-devices.md) — Mac Minis, MacBook Pro, iPad Pros
* **Creation**: Documented [Storage and Backup](/homelab/storage.md) — local disks, Unraid 40 TB
* **Creation**: Documented [Services](/homelab/services/overview.md) — Jarvis on Intel, misc on AMD
* **Creation**: Documented [Network Topology](/homelab/network/topology.md) — UniFi Dream Machine SE
* **Creation**: Established bundle structure
