---
type: Convention
title: Code Hygiene
description: Default conventions for the areas the other documents leave open — linting and formatting, logging in every language, comments and docstrings, database migrations, API versioning, and frontend state management and styling.
tags: [conventions, linting, formatting, logging, comments, docstrings, migrations, api-versioning, frontend, state-management, styling, defaults]
timestamp: 2026-10-05T00:00:00Z
---

# Scope

These are the defaults an agent applies when a project has not said otherwise. A project's own `AGENTS.md` or `README.md` may override any row. Everything here sits on top of [Code Structure and Patterns](/conventions/code-structure.md), [Project Structure](/conventions/project-structure.md), and [Dependencies and Libraries](/conventions/dependencies.md).

# Linting and Formatting

One formatter and one linter per language, both run through the Makefile so that every machine and every agent produces identical output. Formatting is never discussed in review; the tool decides.

| Language | Formatter | Linter | Type check |
|----------|-----------|--------|------------|
| TypeScript / JavaScript | Prettier, default config | ESLint with `typescript-eslint` recommended rules | `tsc --noEmit` with `strict: true` |
| Python | Ruff format | Ruff check, default rule set plus `B` and `I` | mypy or pyright in strict mode |
| Go | `gofmt` | `go vet` and `staticcheck` | compiler |
| Java | google-java-format | Checkstyle (Google style) | compiler |
| Rust | `rustfmt` | `clippy` with warnings denied | compiler |

Rules that apply everywhere:

- `make lint` runs formatter check, linter, and type check and fails on any finding. `make test` depends on `make lint`.
- Tool configuration lives in the repository (`.prettierrc`, `pyproject.toml`, `.golangci.yml`). Do not rely on editor settings.
- Enable the linter's rule for unused variables and imports, max nesting depth of 2, and max function length of 30 lines where the tool supports them, so the [size limits](/conventions/code-structure.md#size-and-complexity-limits) are enforced mechanically.
- No inline rule-disabling comments (`eslint-disable`, `noqa`, `nolint`) without a one-line reason on the same line.
- Line length follows the formatter's default. Do not fight it.
- Do not add a second overlapping tool (Black next to Ruff, TSLint next to ESLint, Biome next to Prettier).

# Logging

Logging is structured, JSON in production, and goes through an injected logger object, never a global. Go already has a default in [Dependencies](/conventions/dependencies.md); this table completes the set.

| Language | Library | Notes |
|----------|---------|-------|
| Go | `rs/zerolog` | Already the default. |
| TypeScript | `pino` | JSON by default; `pino-pretty` only in local dev via the `.env` flag. |
| Python | standard `logging` with `structlog` on top | `structlog` renders JSON; the stdlib handles levels and handlers. |
| Java | SLF4J API with Logback | JSON encoder in production. |
| Rust | `tracing` with `tracing-subscriber` | JSON formatter in production. |

Rules that apply everywhere:

- **Inject the logger.** The logger is a constructor argument that implements a small project-owned `Log` interface (five methods or fewer). Tests inject a `FakeLog` under `tests/` and may assert on recorded entries when a log line is part of the contract (an audit record, for example).
- **One log per boundary, not per line.** Request logging is a single [middleware](/conventions/project-structure.md) entry on the way out. Services log domain events that matter; they do not narrate control flow. Clients log one line per external call failure with the operation name and the sanitized target.
- **Levels.** `error` means a human may need to act. `warn` means a degraded but handled outcome. `info` is a business event. `debug` is off in production. Nothing is logged at `trace`.
- **Never log secrets or personal data.** Tokens, passwords, connection strings, full request bodies, and email addresses are redacted or omitted. A log line carries identifiers (`orderId`), not payloads.
- **Correlate.** Every log line inside a request carries the request ID set by the logging middleware. Pass it through the logger instance, not as a parameter to every function.
- **Logs are not error handling.** Logging a failure does not replace returning a `Result`. A caught-and-logged exception that continues is a hidden fallback, which [Literal Requirements and Fallbacks](/conventions/code-structure.md#literal-requirements-and-fallbacks) forbids.
- **Output to stdout only.** No log files, no rotation code. Railway, Docker, and `journald` capture stdout.

# Comments and Docstrings

Code explains *what*; comments explain *why*. Tests are the primary documentation, per Elegant Objects 2.7.

- **Public interfaces get a docstring.** Every interface and every method on it carries one sentence stating the contract: what it returns, which `Result` errors it can produce, and any invariant the caller must respect. Use the language's native form (TSDoc, PEP 257 docstrings, Go doc comments, Javadoc, `///`).
- **Implementations usually do not.** A production class implementing a documented interface repeats nothing. Add a comment only where the implementation does something non-obvious: a workaround for a vendor bug, a performance trade-off, a reference to a specification section.
- **No narration.** A comment that restates the next line (`// increment counter`) is deleted. A comment that describes a function's steps means the function should be split.
- **No commented-out code.** Git holds history.
- **No TODO without an owner and a reason.** `// TODO(jose): remove after the v2 migration lands` is acceptable; a bare `// TODO` is not. Prefer a `Result` error or a failing test over a TODO that silently skips work.
- **No file headers, license banners, or author tags** in source files. The repository's `LICENSE` and git history carry that information.
- **No generated-by or AI-attribution comments.** Code reads the same regardless of who typed it.
- **Explain magic values once.** A value with a reason (`Milliseconds(250)` because the vendor rate-limits at 4 req/s) gets its reason at the one place it is constructed, which is the composition root or the value object, never at each use.

# Database Migrations

Schema changes are versioned files committed with the code that needs them, applied forward only, and run as an explicit step, never on application start.

| Language | Tool |
|----------|------|
| TypeScript | Drizzle Kit or Prisma Migrate, whichever matches the project's query layer |
| Python | Alembic |
| Go | `golang-migrate` with plain SQL files |
| Java | Flyway |

Rules that apply everywhere:

- **Location.** Migrations live in `migrations/` at the repository root, outside `src/` and `tests/`, because they are neither production source nor tests. They are the one sanctioned top-level directory beyond those two.
- **Naming.** Timestamp prefix plus a short description: `20261005143000_add_order_status.sql`. Never renumber or edit a migration that has been pushed.
- **Forward only.** Write the up migration. Write a down migration only when it is trivially safe (dropping a newly added nullable column). Recovering from a bad migration is a new forward migration, not a rollback.
- **Expand, then contract.** Any change that could break the running version is split: add the new column or table and deploy, backfill, switch the code, then drop the old column in a later migration. Because [push to main deploys](/deployment/ci-cd.md) with no staging, a destructive migration and the code that depends on it never ship in the same commit.
- **Run explicitly.** `make migrate` applies pending migrations against the `DATABASE_URL` from the environment. The application does not auto-migrate on boot; it fails clearly if the schema version is behind.
- **Data migrations are code.** A backfill that needs logic is a one-off script under `scripts/` that uses the normal clients and interfaces, with a test under `tests/`, not raw SQL buried in a migration.
- **Schema is the source of truth, not the ORM model.** The migration defines the column; the `src/models/` record mirrors it. When they disagree, the migration is right.

# API Versioning

APIs are versioned by URL path prefix, and a version is a promise about response shapes, not an excuse to fork the codebase.

- **Path prefix.** `/v1/orders`, never a header, query parameter, or content-type version. The prefix is visible in logs, curl commands, and routers without inspection.
- **Start at v1.** Every public HTTP API ships under `/v1/` from the first commit, even when there is only one consumer.
- **Additive changes do not bump.** Adding a field, an endpoint, or an optional query parameter stays in the current version. Clients must ignore fields they do not know.
- **Breaking changes bump the whole prefix.** Removing or renaming a field, changing a type, changing an error kind, or changing a status mapping is `/v2/`. There is no per-endpoint versioning.
- **One service, many routes.** A `/v2/` route is a new route class in `src/routes/` and, where the response differs, a new response mapping in `src/middleware/`. The service in `src/services/` is shared; versions differ in HTTP shape, not business logic. Services never know which version called them, which follows from [services never seeing HTTP](/conventions/code-structure.md#services-never-return-http-status-codes).
- **Two live versions at most.** When `/v3/` ships, `/v1/` is removed in the same change. The removal is a `FEAT` commit that names the retired version.
- **Error payload is stable within a version.** Every error response in a version has the same shape: `{ "error": { "kind": "OutOfStock", "message": "..." } }`, where `kind` is the domain error name from the service's `Result`, never a numeric code.
- **Internal and local-only services** (home lab tools behind the network boundary, single-consumer backends) still use `/v1/`. The cost is one path segment; the benefit is never having to retrofit it.

# Frontend State Management and Styling

These extend [ReactJS Component Authoring](/conventions/react-components.md). Keep state as local as it can be and as typed as the backend.

## State

| State kind | Where it lives | Tool |
|------------|----------------|------|
| Server data (anything fetched) | A query cache, never component state | TanStack Query |
| URL state (filters, pagination, selected tab) | The URL | The router's search params |
| Form state | The form | React Hook Form with a Zod schema |
| UI state local to one component (open/closed, hover) | `useState` in that component | React |
| UI state shared by several components (theme, sidebar, current user) | One store per concern | Zustand |

Rules that apply everywhere:

- **No Redux by default.** Reach for it only when a project already uses it. Zustand plus TanStack Query covers the rest with less ceremony.
- **No global store for server data.** Fetched data is cached and invalidated by the query layer; copying it into a store creates a second source of truth.
- **Each store is a typed object with behavior**, exposing actions such as `open()` and `close()`, never a raw `set` the component calls with arbitrary fields. This is the frontend form of [no setters](/conventions/code-structure.md#no-getters-or-setters).
- **Side effects live in hooks**, one hook per file, under `src/hooks/`. Components render; they do not fetch, subscribe, or time.
- **Types come from the API contract.** Request and response types are generated from the backend's OpenAPI document or shared from a `src/models/` package, never hand-copied.
- **Context is for dependency injection, not state.** A `React.Context` carries an injected client or logger so tests can swap in a Fake; it does not carry frequently changing values.

## Styling

- **Tailwind CSS** is the default for styling, with `clsx` for conditional classes. No CSS-in-JS runtimes (styled-components, Emotion) and no global stylesheets beyond Tailwind's base layer.
- **Component library:** shadcn/ui components copied into `src/components/ui/`, since they are owned source rather than a dependency and can be edited to fit the one-function-per-file rule.
- **Design tokens** (colors, spacing, radii, fonts) are defined once in the Tailwind theme. A component never hardcodes a hex value or pixel size that the theme already names.
- **Variants** are declared with `class-variance-authority`, one `cva` definition per component file, instead of string concatenation in JSX.
- **No inline `style={{}}`** except for values that are genuinely computed at runtime (a measured width, a drag position).
- **Dark mode** uses the `class` strategy and the theme's semantic tokens (`bg-background`, `text-foreground`), so no component needs a `dark:` prefix for the common case.
- **Responsive design** uses Tailwind's breakpoints in markup. No media queries in separate files.

# Related

- [Code Structure and Patterns](/conventions/code-structure.md) — size limits these linters enforce; the no-fallbacks rule logging must respect
- [Project Structure](/conventions/project-structure.md) — where `migrations/` and `src/middleware/` sit
- [Dependencies and Libraries](/conventions/dependencies.md) — latest versions; Go's zerolog default
- [ReactJS Component Authoring](/conventions/react-components.md) — component size and one-function-per-file rules
- [CI/CD and Triggers](/deployment/ci-cd.md) — why migrations must be expand-then-contract
