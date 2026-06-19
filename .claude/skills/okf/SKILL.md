---
name: okf
description: Create, validate, and consume Open Knowledge Format (OKF v0.1) bundles — portable knowledge represented as Markdown with YAML frontmatter. Use when building, auditing, or navigating OKF bundles.
when_to_use: Creating or editing .md files with YAML frontmatter representing knowledge concepts, building OKF bundles, validating OKF conformance, generating index.md or log.md files, or navigating an existing OKF bundle structure.
allowed-tools: Bash(git *) Read Glob Grep WebSearch
paths: ["**/*.md", "**/index.md", "**/log.md", "**/okf/**"]
---

# Open Knowledge Format (OKF) Skill

You are an expert in the **Open Knowledge Format (OKF) v0.1** — an open, vendor-neutral specification for representing knowledge as plain Markdown files with YAML frontmatter. OKF bundles are directories of `.md` files that live in git, render anywhere, and feed AI agents natively.

Use this skill when any of these tasks come up:
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
type: <Type name>                  # REQUIRED — short, descriptive string (e.g. "BigQuery Table", "API Endpoint", "Playbook", "Metric")
title: <Display name>              # Recommended — human-readable display name
description: <One-line summary>    # Recommended — single sentence; used by index generators and search
resource: <canonical URI>          # Recommended — URI for the underlying asset; omit for abstract concepts
tags: [tag1, tag2]                 # Recommended — YAML list for cross-cutting categorization
timestamp: <ISO 8601 datetime>     # Recommended — last meaningful change
# Extensions: any additional keys allowed
---
```

**Rules for frontmatter:**
- `type` is the only required field. Pick descriptive, self-explanatory values. There is no central registry.
- `title`, `description`, `resource`, `tags`, and `timestamp` are recommended (in that priority order).
- Producers may add arbitrary extension keys. Consumers must preserve them on round-trip.
- The YAML block starts with `---` on its own line and ends with `---` on its own line.

### Body

Use structural Markdown. The following section headings have **conventional** meaning and SHOULD be used when applicable:

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
Begin with `/`, interpreted relative to the bundle root:
```markdown
See the [customers table](/tables/customers.md) for the join key.
```
This form is stable when documents move within their subdirectory.

### Relative links
Standard Markdown relative paths:
```markdown
See the [neighboring concept](./other.md).
```

### Link semantics
A link from concept A to concept B asserts a *relationship*. The meaning is conveyed by surrounding prose, not the link itself. Consumers treat all links as directed edges. Broken links are tolerated — they may represent not-yet-written knowledge. When creating links, always use paths relative to the bundle root (preferred) or relative to the current file.

---

## Index Files (`index.md`)

Index files enable **progressive disclosure** — letting readers see what's available before opening individual documents. They contain no frontmatter (except optional `okf_version` at the root level).

### Format

```markdown
# Section / Group Heading

* [Title 1](relative-url-1) — short description
* [Title 2](relative-url-2) — short description

# Another Section

* [Subdirectory](subdir/) — short description
```

### Rules for index files
- Group concepts under descriptive headings.
- Include the `description` from each concept's frontmatter when available.
- Link to subdirectories with trailing `/`.
- Do NOT use YAML frontmatter (except `okf_version: "0.1"` at the bundle root only).
- May be auto-generated or hand-written.

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

Optional. Records the history of changes at any directory level. Newest entries first.

### Format

```markdown
# Directory Update Log

## YYYY-MM-DD
* **Update**: Description of change with [links](/path/to/concept.md).
* **Creation**: Created new concept for [Thing](/path/to/thing.md).

## YYYY-MM-DD
* **Initialization**: Created foundational directory structure.
```

### Rules for log files
- Date headings MUST use ISO 8601 `YYYY-MM-DD` format.
- Leading bold word (`**Update**`, `**Creation**`, `**Deprecation**`, etc.) is a convention, not a requirement.
- Include Markdown links to the affected concepts.
- Newest entries first.
- No YAML frontmatter.

---

## Citations

When a concept's body references external sources, list them under a `# Citations` heading at the bottom, numbered:

```markdown
# Citations

[1] [BigQuery public dataset announcement](https://cloud.google.com/blog/...)
[2] [Internal data quality runbook](https://wiki.acme.internal/data/quality)
```

Citation links may be absolute URLs, bundle-relative paths, or paths into a `references/` subdirectory.

---

## Creating a Bundle: Step-by-Step Checklist

### When asked to create a new OKF bundle

1. **Plan the structure**: Determine the domain (e.g., data catalog, API docs, company knowledge). Decide on the hierarchy (datasets/, tables/, playbooks/, references/, etc.).

2. **Create the root index.md**:
   - Include `okf_version: "0.1"` in frontmatter.
   - List top-level groups with brief descriptions.
   - Link to subdirectories and root-level concepts.

3. **Create concept documents**: For each concept:
   - Create the `.md` file at the appropriate path.
   - Add YAML frontmatter with at minimum `type` (required), plus `title`, `description`, `resource`, `tags`, `timestamp` as applicable.
   - Write the body using structural Markdown.
   - Add `# Schema` section if describing structured data.
   - Add `# Citations` section if referencing external sources.
   - Cross-link to related concepts using absolute bundle-relative links.

4. **Create subdirectory index files**: For each subdirectory:
   - Create `index.md` (no frontmatter).
   - Group and list all concepts in that directory with descriptions.

5. **Create log.md** (optional): If the user wants a change history:
   - Create at whatever level(s) make sense.
   - Use today's date, describe the initialization.

6. **Validate**: Check all 3 conformance rules before declaring done.

### When asked to add concepts to an existing bundle

1. Read the relevant `index.md` files to understand current structure.
2. Place new concepts in the appropriate directory.
3. Follow the same concept document rules as above.
4. Update the corresponding `index.md` to include the new concept.
5. Optionally add a `log.md` entry.

---

## Validation Checklist

Run this when asked to validate a bundle:

1. **Rule 1 — Frontmatter presence**: Scan all non-reserved `.md` files. Each must have a `---` opening and `---` closing delimiter with YAML between them. Report any files missing frontmatter.

2. **Rule 2 — `type` field**: Check every frontmatter block. The `type` field must be present and non-empty. Report any concepts with missing or blank `type`.

3. **Rule 3 — Reserved files**: Check any `index.md` files — no YAML frontmatter (except root-level `okf_version`). Check any `log.md` files — ISO 8601 date headings. Report structural violations.

4. **Soft checks** (warnings only, not failures):
   - Broken cross-links (target `.md` does not exist).
   - Concept documents without `description` (affects index quality).
   - Frontmatter YAML parse errors.
   - `index.md` files referencing concepts that don't exist.

Format validation output clearly:
```
## OKF Validation Report for `bundle/`

### ✅ Conformance Checks
- Rule 1 (frontmatter): PASS — 12/12 concept documents have valid frontmatter
- Rule 2 (type field): PASS — all concepts have non-empty `type`
- Rule 3 (reserved files): PASS — 3 index.md files follow spec

### ⚠️ Warnings
- Broken link: `/tables/archived.md` referenced from `/index.md` (target not found)
- Missing description: `references/schema-v2.md`
```

---

## Consuming / Reading a Bundle

When asked to read or navigate a bundle:

1. **Start at `index.md`** at the desired level (root or subdirectory).
2. **Explore progressively**: Follow links to subdirectories or individual concepts as needed.
3. **Extract frontmatter** for structured queries: `type`, `tags`, `resource`, `title`.
4. **Follow cross-links** to understand the relationship graph.
5. **Tolerate gaps**: Missing index files, broken links, and unknown frontmatter fields are all expected and must not cause errors.

---

## Additional Resources

- For the complete specification text, see [spec-reference.md](spec-reference.md).
- For copy-paste templates, see the `templates/` directory:
  - [Concept document template](templates/concept.md)
  - [Index file template](templates/index.md)
  - [Log file template](templates/log.md)
