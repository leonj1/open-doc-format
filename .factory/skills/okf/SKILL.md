---
name: okf
description: Create, validate, and consume Open Knowledge Format (OKF v0.1) bundles — portable knowledge represented as Markdown with YAML frontmatter. Use when building, auditing, or navigating OKF bundles.
---

# Open Knowledge Format (OKF) Skill

You are an expert in the **Open Knowledge Format (OKF) v0.1** — an open, vendor-neutral specification for representing knowledge as plain Markdown files with YAML frontmatter. OKF bundles are directories of `.md` files that live in git, render anywhere, and feed AI agents natively.

Use this skill when:
- Creating a new OKF bundle from scratch
- Adding, editing, or restructuring concept documents in a bundle
- Generating `index.md` files for progressive disclosure
- Adding or updating `log.md` entries
- Validating an existing bundle for conformance
- Navigating or consuming an OKF bundle

---

## Core Principles

1. **Minimalism**: OKF is just directories of `.md` files with YAML frontmatter. No SDK, no registry, no build step.
2. **Dual-audience**: Content must be readable by humans and parseable by agents. Favor structural Markdown (headings, lists, tables, fenced code blocks) over freeform prose.
3. **Permissive consumption**: Consumers MUST tolerate unknown fields, broken links, missing optional fields, and missing index files. Producers SHOULD be strict with the 3 conformance rules.

---

## Bundle Structure

A bundle is a directory tree. Two filenames are **reserved** — never use them for concept documents:

| File | Purpose |
|------|---------|
| `index.md` | Directory listing for progressive disclosure. No frontmatter (except optional `okf_version` at bundle root). |
| `log.md` | Chronological update history. ISO 8601 date headings, newest first. |

All other `.md` files are **concept documents**.

```
bundle/
├── index.md                        # Root index
├── log.md                          # Optional update log
├── <concept>.md                    # Root-level concept
└── <subdirectory>/
    ├── index.md
    ├── <concept>.md
    └── ...
```

### 3 Conformance Rules (hard rules)

1. Every non-reserved `.md` file must have a parseable YAML frontmatter block (`---` delimiters).
2. Every frontmatter must contain a non-empty `type` field.
3. Reserved filenames (`index.md`, `log.md`), when present, must follow their defined structure.

Everything else is soft guidance. Consumers must not reject bundles for missing optional fields, unknown types, broken links, or absent index files.

---

## Concept Documents

Every concept has two parts: **YAML frontmatter** and a **Markdown body**.

### Frontmatter

```yaml
---
type: <Type name>                  # REQUIRED — short, descriptive string
title: <Display name>              # Recommended — human-readable display name
description: <One-line summary>    # Recommended — used by index generators and search
resource: <canonical URI>          # Recommended — URI for the underlying asset; omit for abstract concepts
tags: [tag1, tag2]                 # Recommended — YAML list for cross-cutting categorization
timestamp: <ISO 8601 datetime>     # Recommended — last meaningful change
# Extensions: any additional keys allowed
---
```

**Rules for frontmatter:**
- `type` is the only required field. Pick descriptive, self-explanatory values (e.g., `BigQuery Table`, `API Endpoint`, `Playbook`, `Metric`). There is no central registry.
- `title`, `description`, `resource`, `tags`, and `timestamp` are recommended (in that priority order).
- Producers may add arbitrary extension keys. Consumers must preserve them on round-trip.

### Body

Use structural Markdown. The following section headings have **conventional** meaning:

| Heading | Purpose |
|---------|---------|
| `# Schema` | Structured description of columns, fields, or properties |
| `# Examples` | Concrete usage examples, often as fenced code blocks |
| `# Citations` | Numbered external sources backing claims in the body |

### Example: Resource-bound concept

```markdown
---
type: BigQuery Table
title: Customer Orders
description: One row per completed customer order across all channels.
resource: https://console.cloud.google.com/bigquery?p=acme&d=sales&t=orders
tags: [sales, orders, revenue]
timestamp: 2026-05-28T14:30:00Z
---

# Schema

| Column        | Type      | Description                              |
|---------------|-----------|------------------------------------------|
| `order_id`    | STRING    | Globally unique order identifier.        |
| `customer_id` | STRING    | Foreign key into [customers](/tables/customers.md). |
| `total_usd`   | NUMERIC   | Order total in US dollars.               |
| `placed_at`   | TIMESTAMP | When the customer submitted the order.   |

# Citations

[1] [BigQuery table schema](https://console.cloud.google.com/bigquery?p=acme&d=sales&t=orders)
```

### Example: Abstract concept (no resource)

```markdown
---
type: Playbook
title: Incident response — data freshness alert
description: Steps to triage a freshness alert on the orders pipeline.
tags: [oncall, incident]
timestamp: 2026-04-12T09:00:00Z
---

# Trigger

A freshness alert fires when `orders` lags more than 30 minutes.

# Steps

1. Check the [ingestion job dashboard](https://example.com/dash).
2. Verify upstream data sources.
3. Notify on-call if SLA breach is confirmed.
```

---

## Cross-Linking

### Absolute links (recommended)
Begin with `/`, interpreted relative to bundle root. Stable when documents move within subdirectories.
```markdown
See the [customers table](/tables/customers.md) for the join key.
```

### Relative links
```markdown
See the [neighboring concept](./other.md).
```

### Link semantics
A link asserts a *relationship*. Meaning is conveyed by surrounding prose. Consumers treat all links as directed edges. Broken links are tolerated — they may represent not-yet-written knowledge.

---

## Index Files (`index.md`)

Enable **progressive disclosure**. No frontmatter (except optional `okf_version` at root).

```markdown
# Section / Group Heading

* [Title 1](relative-url-1) — short description
* [Title 2](relative-url-2) — short description

# Another Section

* [Subdirectory](subdir/) — short description
```

Rules:
- Group concepts under descriptive headings.
- Include descriptions from each concept's frontmatter.
- Link subdirectories with trailing `/`.
- No YAML frontmatter (except `okf_version: "0.1"` at bundle root only).

### Example root `index.md`

```markdown
---
okf_version: "0.1"
---

# Datasets

* [Sales](/datasets/sales.md) — All sales-related tables for the retail business.

# Tables

* [Orders](/tables/orders.md) — One row per completed customer order.
* [Customers](/tables/customers.md) — Customer account master data.

# Playbooks

* [Revenue Review](/playbooks/revenue-review.md) — Monthly revenue review process.
```

---

## Log Files (`log.md`)

Optional. Records change history. Newest first. No frontmatter.

```markdown
# Directory Update Log

## YYYY-MM-DD
* **Update**: Description with [links](/path/to/concept.md).
* **Creation**: New concept for [Thing](/path/to/thing.md).

## YYYY-MM-DD
* **Initialization**: Created foundational directory structure.
```

Rules:
- Date headings MUST use ISO 8601 `YYYY-MM-DD`.
- Newest entries first.
- Leading bold word (`**Update**`, `**Creation**`, `**Deprecation**`) is conventional, not required.
- Include Markdown links to affected concepts.

---

## Citations

Listed under `# Citations` at the bottom, numbered:

```markdown
# Citations

[1] [Title of source](https://example.com)
[2] [Another source](https://example.org)
```

May be absolute URLs, bundle-relative paths, or paths into `references/`.

---

## Creating a Bundle: Step-by-Step

### New bundle

1. **Plan the structure**: Determine the domain and hierarchy (datasets/, tables/, playbooks/, references/, etc.).

2. **Create root `index.md`**: Include `okf_version: "0.1"` in frontmatter. List top-level groups with descriptions.

3. **Create concept documents** for each concept:
   - Create `.md` file at the appropriate path.
   - Add YAML frontmatter with at minimum `type` (required).
   - Write structural Markdown body.
   - Add `# Schema` if describing structured data.
   - Add `# Citations` if referencing external sources.
   - Cross-link to related concepts using absolute bundle-relative links.

4. **Create subdirectory `index.md` files**: Group and list concepts with descriptions.

5. **Create `log.md`** (optional): Record initialization.

6. **Validate**: Check all 3 conformance rules.

### Adding concepts to an existing bundle

1. Read relevant `index.md` files to understand the structure.
2. Place new concepts in the appropriate directory.
3. Follow concept document rules.
4. Update the corresponding `index.md`.
5. Optionally add a `log.md` entry.

---

## Validation

Run this when asked to validate a bundle:

1. **Rule 1 — Frontmatter**: Every non-reserved `.md` must have parseable YAML frontmatter.
2. **Rule 2 — `type` field**: Every frontmatter must have a non-empty `type`.
3. **Rule 3 — Reserved files**: `index.md` files: no frontmatter (except root `okf_version`). `log.md` files: ISO 8601 date headings.

**Soft checks** (warnings only):
- Broken cross-links
- Concepts without `description`
- Frontmatter YAML parse errors
- `index.md` referencing nonexistent concepts

Format output clearly:
```
## OKF Validation Report for `bundle/`

### ✅ Conformance
- Rule 1 (frontmatter): PASS — 12/12 concept documents have valid frontmatter
- Rule 2 (type field): PASS — all concepts have non-empty `type`
- Rule 3 (reserved files): PASS — 3 index.md files follow spec

### ⚠️ Warnings
- Broken link: `/tables/archived.md` from `/index.md`
- Missing description: `references/schema-v2.md`
```

---

## Consuming a Bundle

1. Start at `index.md` at the desired level.
2. Explore progressively following links to subdirectories or concepts.
3. Extract frontmatter for structured queries: `type`, `tags`, `resource`, `title`.
4. Follow cross-links to understand relationships.
5. Tolerate gaps — missing index files, broken links, unknown fields are all expected.

---

## Supporting Files

- [spec-reference.md](spec-reference.md) — Complete specification detail when you need the full technical reference.
- [templates/concept.md](templates/concept.md) — Copy-paste template for concept documents.
- [templates/index.md](templates/index.md) — Copy-paste template for index files.
- [templates/log.md](templates/log.md) — Copy-paste template for log files.
