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

The interface isolates application code from filesystem, database, device, and
API contracts. When an external contract changes, keep the project-owned
interface stable and update its production implementation in one place unless
the application's required behavior also changes. Fakes exercise consumers of
that interface without touching the real boundary; they do not test the
production adapter. Use separate contract or integration tests for real-boundary
behavior. Mocking frameworks are prohibited because configured expectations can
mirror implementation details and produce false confidence; neither mocks nor
Fakes guarantee correctness by themselves.

### Dependency Injection
Constructor injection. No DI framework or container (no Spring/NestJS/Angular
injector, Guice, tsyringe, inversify, wire, fx). Dependencies are explicit —
passed through constructors, never imported or instantiated directly. One
composition root (`main` or the app bootstrap) is the only place that `new`s
production classes; elsewhere `new` appears only in secondary constructors
and for value objects/records.

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
- Fields per class: four or fewer
- Public methods per class: fewer than five
- Methods per interface: five or fewer
When a class cannot fit, extract a collaborator and inject it.

### Route Discipline
Routes and endpoints in src/routes/ call services in src/services/ ONLY.
They never make I/O calls directly. Route classes use object names such as
`HttpRoute` or `OrderEndpoint`, never `Handler` or `Controller`.
Services never return, embed, or accept HTTP status codes — they return
domain-named errors (`OutOfStock`), and one response middleware maps those
to status codes. All middleware (auth, validation, Result → HTTP mapping,
error → 500, logging) lives in src/middleware/, one class per file, each with
an interface and a Fake under `tests/` where it does I/O. Routes contain no
try/catch and no helpers.

### Type Discipline
- All function arguments must be strongly typed — no `any`, no untyped params.
- Wrap every primitive argument in a typed object — `EmailAddress` not `string`,
  `Port` not `int`, `CustomerId` not `number`. Validate once in the wrapper at
  the edge. Long call sites mean "introduce a record", not "use a primitive".
- Functions return values — never mutate incoming arguments. Return new state.
  This holds in Go (value receivers, no mutating pointer receivers) and Python
  (frozen dataclasses, `dataclasses.replace`, no in-place list/dict mutation).
- Never accept or return `null`/`undefined`/`None`/`nil`. Absence is a named
  `Result` error, a tagged union case, or a null object — never a nullable.
  No optional parameters.

### Choosing Data Structures
- Never default to a list/array or map/dict. First enumerate the operations the
  code performs and the invariants ("this structure is corrupt if ever ..."),
  then pick the most constrained structure that makes those invalid states
  unrepresentable: priority queue for take-next-by-priority, stack for LIFO,
  queue/deque for FIFO, set for uniqueness, counter for tallies, ring buffer
  for bounded recent history.
- Model fixed state sets as enums and mutually exclusive modes as tagged
  unions — never magic strings or combinable boolean flags.
- Values that travel together live in one record — never parallel collections.
- If the language lacks the structure, wrap the raw list/map in a domain class
  (e.g. `PendingJobs`, not `JobHeap`) that exposes only valid operations and
  keeps the raw structure private.
- A plain list or map is acceptable only when there are genuinely no
  invariants; justify the choice in one sentence in the commit/PR description.
- `sort()` before every read, `contains()` before every insert, or a "keep
  these in sync" comment means the structure is too permissive — replace the
  structure instead of adding discipline.

### No Static Classes or Properties
- Every dependency is an instance passed through a constructor. No static methods.
- The only exception: a `main` entry point if the language requires it.

### Object Design (Elegant Objects, applied)
- No getters or setters, no public fields, no builder-style mutators on classes
  outside `src/models/`. Ask the object to act (`order.taxed(rate)`) or to
  render itself (`report.asPdf()`); never reach in. `src/models/` holds
  immutable data records (types, frozen dataclasses, structs) with read-only
  fields and no behavior — the rule governs the objects that act on them.
- Every public method implements an interface: clients, services, and
  middleware all have one. Fakes are required for anything that does I/O.
- Classes are final or abstract, never extended concretely. No subclassing a
  production class; no concrete struct embedding in Go. Compose and decorate.
- Constructors only assign arguments to fields: no parsing, I/O, computation,
  or `new`. One primary constructor; secondaries delegate to it.
- No public constants or exported constant bags. Inject a value object instead.
- No `instanceof`, `isinstance`, type switches, reflection, or downcasts.
  Branch on a `Result`'s tag, or add a method to the interface.
  Permitted only in the edge error middleware and in a decoding adapter.

### Error Handling: Result Types, Not Exceptions
- Do not throw exceptions for expected outcomes (e.g., "user not found").
- Return a Result type (`{ ok: true, value } | { ok: false, error }`) if the language supports it.
- Go: return `(value, error)`. TypeScript: use discriminated unions. Python: return union types.
- Exceptions are for truly unrecoverable situations only. Never use try/catch as control flow.
- Name error values after the domain fact that failed (`OutOfStock`), never after a transport outcome (`Conflict`, `status: 400`).

### Quality Tests
Tests must prove exact results, state changes, boundary payloads, and prohibited
side effects. A success flag alone is insufficient. Assertions on Fake state,
serialized boundary requests, and collaborator cardinality or ordering are required
when those facts are part of the behavior or boundary contract. Do not assert
private methods or incidental internal call structure.

```
Request → Middleware → Route → Service → Client (I/O interface) → External World
            (auth, validate, parse)              Result flows back; response middleware
                                                 maps Result → status, error middleware → 500
```

### Project Layout
```
project/
├── src/
│   ├── services/      # Business logic
│   ├── clients/       # External API clients, DB connectors
│   ├── models/        # Immutable data records: types, schemas, entities
│   ├── routes/        # HTTP routes and endpoints (thin, delegates to services)
│   └── middleware/    # Auth, validation, Result→HTTP, error→500, logging
├── migrations/        # Versioned, forward-only schema migrations (when there is a DB)
└── tests/             # Tests and test-support code, including all Fakes
```
Production source belongs only in `src/`; tests and test-support code belong only
in `tests/`. Every Fake class must reside under `tests/`, never under `src/` or
beside its production implementation. Never co-locate test files and production
source files, even when the language commonly does so.

### Naming
Classes = nouns, never -er/-or role names. Manipulator methods = verbs
(`save()`), builder methods = nouns (`total()`, `asPdf()`), boolean queries =
adjectives (`empty()`). No `get`/`set` prefixes. Top-level classes short
(Report), deeper classes longer (PdfReport). Follow language conventions otherwise.

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
- Makefile in every project: make build, make lint, make test, make start, make stop, make restart (plus make migrate when there is a DB)
- Omit Dockerfile only when host filesystem access is required

### Code Hygiene Defaults
- Lint/format: Prettier + ESLint + strict tsc (TS); Ruff + mypy/pyright strict (Python);
  gofmt + go vet + staticcheck (Go). `make lint` fails on any finding; `make test` depends on it.
  No inline disable comments without a reason.
- Logging: structured JSON to stdout via an injected `Log` interface (pino, structlog,
  zerolog, SLF4J+Logback, tracing). One request log line in middleware; never log secrets
  or PII; logging never replaces returning a `Result`.
- Comments: docstring on every interface method stating the contract and its `Result`
  errors; implementations stay silent unless explaining a non-obvious why. No narration,
  no commented-out code, no bare TODOs, no file headers or AI-attribution comments.
- Migrations: timestamped files in `migrations/`, forward-only, expand-then-contract,
  applied by `make migrate`, never on app start. Alembic / golang-migrate / Drizzle or
  Prisma / Flyway.
- API versioning: `/v1/` path prefix from day one; additive changes stay, breaking changes
  bump the whole prefix; at most two live versions; services never know the version.
  Error payload: `{ "error": { "kind": "OutOfStock", "message": "..." } }`.
- Frontend: TanStack Query for server data, URL for filters, React Hook Form + Zod for
  forms, Zustand stores (with actions, no raw `set`) for shared UI state, no Redux by
  default. Tailwind + shadcn/ui + cva; theme tokens only, no CSS-in-JS, no inline styles.
- Full doc: ~/src/open-doc-format/personal-knowledge/conventions/code-hygiene.md

### Elegant Objects Principles
Follow the OOP recommendations from Yegor Bugayenko's *Elegant Objects*:
no -er class names, immutable objects, no static methods/utility classes,
no getters/setters, no NULL args or returns, always use interfaces, final or
abstract classes, code-free constructors, no public constants, no casting,
four fields / five methods caps, and fakes over mocks. The one override: Result
values instead of checked exceptions. Rules with exceptions spelled out:
~/src/open-doc-format/personal-knowledge/conventions/code-structure.md (Object Design).
Full list: ~/src/open-doc-format/personal-knowledge/references/elegant-objects.md

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

## User communication

Respond briefly, directly, and respectfully.

- Lead with the answer or result.
- Stay strictly on the user’s question; avoid unsolicited side topics.
- Prefer dense, precise language over filler or generic reassurance.
- Use only the formatting needed for clarity.
- Explain technical detail when it helps the user act or decide.
- Ask a clarifying question only when a necessary choice or fact is missing.
- When work is complete, state what changed and how it was verified.
