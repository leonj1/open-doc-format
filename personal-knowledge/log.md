# Personal Knowledge — Update Log

## 2026-10-05
* **Update**: [Code Structure and Patterns](/conventions/code-structure.md) gained an **Object Design** section that turns the applied [Elegant Objects](/references/elegant-objects.md) recommendations into explicit rules with language-specific guidance and named exceptions: never accept or return null (`null`/`None`/`nil`), no getters or setters (with a clarified boundary for the data records in `src/models/`), classes are final or abstract, constructors contain no logic, no `new` outside secondary constructors or the composition root, no public constants, no type introspection or casting, and every public method implements an interface. The size table now caps classes at four fields and fewer than five public methods, and interfaces at five methods. Wrapping every primitive argument in a typed object and never mutating an argument were promoted from preferences to rules, with Go and Python guidance. The **No DI Framework** rule now names the excluded containers and defines the composition root.
* **Update**: Added `src/middleware/` as the fifth standard directory in [Project Structure](/conventions/project-structure.md); middleware classes, their interfaces, and the single `Result` → HTTP mapping live there. The layout and request-flow diagram in [AGENTS.md](/AGENTS.md) and [CLAUDE.md](/CLAUDE.md) now show the middleware layer.
* **Update**: [Naming Conventions](/conventions/naming.md) now reconciles the verbs-for-functions rule with Elegant Objects 2.4: manipulators are verbs, builders are nouns, boolean queries are adjectives.
* **Creation**: Added [Code Hygiene](/conventions/code-hygiene.md) — default conventions for linting and formatting, logging in every language, comments and docstrings, database migrations, API versioning, and frontend state management and styling.
* **Update**: [Docker and Containers](/deployment/docker.md) no longer lists Proxmox as a home lab target; both servers are bare-metal Docker hosts per [Services](/homelab/services/overview.md). The coverage-gate sentence in Code Structure no longer refers to CI.
* **Update**: Promoted the new rules into the Key Rules of [AGENTS.md](/AGENTS.md), [CLAUDE.md](/CLAUDE.md), and the Droid skill in [USAGE.md](/USAGE.md), and added Code Hygiene to the Pi contextFiles list and the GitHub API path table.
* **Removal**: Dropped the stale 2026-06-19 log line that said asserting fields is banned; the current Testing Philosophy requires asserting exact values.

## 2026-09-27
* **Update**: [Code Structure and Patterns](/conventions/code-structure.md) now states that services never return HTTP status codes — no status fields, HTTP-named error kinds, or framework request/response objects in `src/services/` — because the same service is called from CLIs, queue consumers, and tests where a status code is meaningless, and because a status picked in a service duplicates the `Result` → HTTP mapping that belongs in one response middleware. Error values are named after the domain fact that failed (`OutOfStock`), not the transport outcome (`Conflict`). Promoted to the Key Rules in [AGENTS.md](/AGENTS.md), [CLAUDE.md](/CLAUDE.md), and [USAGE.md](/USAGE.md), and to the `src/services/` row in [Project Structure](/conventions/project-structure.md).

## 2026-09-01
* **Creation**: Added [ReactJS Component Authoring](/conventions/react-components.md) — component files are limited to 700 total lines, own only their component function, import every other function from its own file, and decompose long JSX into independent components.

## 2026-08-25
* **Creation**: Documented [Choosing Data Structures](/conventions/data-structures.md) — a decision framework (operations first, then invariants), a problem-signal → structure selection table, make-invalid-states-unrepresentable patterns (tagged unions over boolean flags, enums over magic strings, records over parallel lists), domain wrappers when the language lacks a structure, standard-library-first guidance, and explicit instructions for AI coding agents to justify any plain list or map.
* **Update**: Promoted the data-structure rules into the inlined Key Rules in [AGENTS.md](/AGENTS.md), [CLAUDE.md](/CLAUDE.md), and the Droid skill snippet in [USAGE.md](/USAGE.md), and added the concept to the Pi contextFiles list and the GitHub API path table, so agents apply the rules when writing code without fetching the full document.

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
