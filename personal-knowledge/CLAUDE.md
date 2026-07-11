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
- A Fake implementation (hand-written, stored under `tests/`, and used only in tests)

### Dependency Injection
Constructor injection. No DI framework. Dependencies are explicit — passed
through constructors, never imported or instantiated directly.

### Literal Requirements and Fallbacks
Implement the requested logic exactly as given. Do not add default values,
alternate sources, silent fallback paths, or recovery behavior unless the
requirement explicitly asks for them. If a database connection string is
specified as an environment variable, read that env var and fail clearly when
it is missing.

### Size and Complexity Limits
- Classes: fewer than 700 lines
- Functions: fewer than 30 lines
- Indentation: max 2 levels (extract early if deeper)

### Route Handler Discipline
Route handlers in src/routes/ call services in src/services/ ONLY.
Handlers never make I/O calls directly.

### Type Discipline
- All function arguments must be strongly typed — no `any`, no untyped params.
- Prefer typed objects over primitives — `EmailAddress` not `string`, `CustomerId` not `number`.
- Functions return values — never mutate incoming arguments. Return new state.

### No Static Classes or Properties
- Every dependency is an instance passed through a constructor. No static methods.
- The only exception: a `main` entry point if the language requires it.

### Error Handling: Result Types, Not Exceptions
- Do not throw exceptions for expected outcomes (e.g., "user not found").
- Return a Result type (`{ ok: true, value } | { ok: false, error }`) if the language supports it.
- Go: return `(value, error)`. TypeScript: use discriminated unions. Python: return union types.
- Exceptions are for truly unrecoverable situations only. Never use try/catch as control flow.

```
Request → Route Handler → Service → Client (I/O interface) → External World
```

### Project Layout
```
project/
├── src/
│   ├── services/      # Business logic
│   ├── clients/       # External API clients, DB connectors
│   ├── models/        # Types, schemas, entities
│   └── routes/        # HTTP handlers (thin, delegates to services)
└── tests/             # Tests and test-support code, including all Fakes
```
Production source belongs only in `src/`; tests and test-support code belong only
in `tests/`. Every Fake class must reside under `tests/`, never under `src/` or
beside its production implementation. Never co-locate test files and production
source files, even when the language commonly does so.

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
- Required values have no implicit defaults unless a fallback is explicitly stated

### Deployment Targets
- Vercel: static sites and frontends
- Railway: backends and services
- Full deployment docs: ~/src/open-doc-format/personal-knowledge/deployment/

### Docker and Dev Loop
- Dockerfile by default for all projects
- docker-compose for multi-container projects
- Makefile in every project: make build, make test, make start, make stop, make restart
- Omit Dockerfile only when host filesystem access is required

### Elegant Objects Principles
Follow the OOP recommendations from Yegor Bugayenko's *Elegant Objects*:
no -er class names, immutable objects, no static methods/utility classes,
no getters/setters, no NULL args or returns, always use interfaces, and
fakes over mocks. Full list: ~/src/open-doc-format/personal-knowledge/references/elegant-objects.md

### Full Bundle
Read more at ~/src/open-doc-format/personal-knowledge/index.md after cloning.

# Project
Since this repo could be just a piece of a larger project then read PROJECT.md if it exists to understand how this fits into the bigger picture.

# Docs
If this repo has a `./docs` folder, treat it as the table of contents for the
project's API surface. Read `docs/index.md` (or `docs/README.md` if no index
exists) first to see what's documented before exploring source directly, and
consult the relevant doc under `docs/` before implementing or modifying any
API endpoint, schema, or public interface.
