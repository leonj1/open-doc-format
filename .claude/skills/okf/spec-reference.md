# OKF v0.1 Specification Reference

> This is a condensed reference extracted from the official spec at
> https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
> Load this file when you need the full technical details not covered in the skill overview.

## Terminology

- **Knowledge Bundle** — A self-contained, hierarchical collection of knowledge documents. The unit of distribution.
- **Concept** — A single unit of knowledge within a bundle. Represented as one markdown document.
- **Concept ID** — The path of the concept's file within the bundle, with `.md` suffix removed: `tables/users.md` → `tables/users`.
- **Frontmatter** — YAML metadata block delimited by `---` at the top of a markdown file.
- **Body** — Everything in the file after the frontmatter.
- **Link** — A standard markdown link from one concept to another.
- **Citation** — A link from a concept to an external source that supports a claim in the body.

## Conformance (Section 9)

A bundle is conformant with OKF v0.1 if:

1. Every non-reserved `.md` file in the tree contains a parseable YAML frontmatter block.
2. Every frontmatter block contains a non-empty `type` field.
3. Every reserved filename (`index.md`, `log.md`) follows the structure described in §6 and §7 respectively when present.

Consumers MUST NOT reject a bundle because of: missing optional frontmatter fields, unknown `type` values, unknown additional frontmatter keys, broken cross-links, missing `index.md` files.

## Bundle Distribution (Section 3)

A bundle MAY be distributed as:
- A git repository (recommended)
- A tarball or zip archive of the directory
- A subdirectory within a larger repository

## Frontmatter Fields (Section 4.1)

| Field | Status | Description |
|-------|--------|-------------|
| `type` | **Required** | Short string identifying the kind of concept. No central registry — pick descriptive values. Examples: `BigQuery Table`, `API Endpoint`, `Metric`, `Playbook`, `Reference`. |
| `title` | Recommended | Human-readable display name. If omitted, consumers MAY derive from filename. |
| `description` | Recommended | A single sentence summarizing the concept. Used by index.md generators, search snippets, and previews. |
| `resource` | Recommended | A URI that uniquely identifies the underlying asset. Absent for abstract concepts. |
| `tags` | Recommended | A YAML list of short strings for cross-cutting categorization. |
| `timestamp` | Recommended | ISO 8601 datetime of last meaningful change. |
| `okf_version` | Optional | Declare the spec version in a bundle-root `index.md` frontmatter block only. |

**Extensions:** Producers MAY include any additional keys. Consumers SHOULD preserve unknown keys when round-tripping and SHOULD NOT reject documents with unrecognized fields.

## Type Values

Type values are **not** registered centrally. Producers SHOULD pick values that are descriptive and self-explanatory. Consumers MUST tolerate unknown types gracefully (typically by treating them as generic concepts).

Common patterns:
- `<Platform> <Resource>`: `BigQuery Table`, `BigQuery Dataset`, `Dataplex Entry`
- `<Domain>`: `API Endpoint`, `Metric`, `Playbook`, `Reference`, `Dashboard`
- Simple: `Table`, `Dataset`, `View`, `Function`, `Pipeline`

## Body Conventions (Section 4.2)

Producers SHOULD favor structural markdown — headings, lists, tables, fenced code blocks — over freeform prose.

Conventional section headings:

| Heading | Purpose |
|---------|---------|
| `# Schema` | Structured description of an asset's columns/fields. |
| `# Examples` | Concrete usage examples, often as fenced code blocks. |
| `# Citations` | External sources backing claims in the body. |

## Cross-Linking (Section 5)

### Absolute (bundle-relative) links — RECOMMENDED
```markdown
See the [customers table](/tables/customers.md) for the join key.
```
Begin with `/`, interpreted relative to the bundle root. Stable when documents are moved within their subdirectory.

### Relative links
```markdown
See the [neighboring concept](./other.md).
```
Standard markdown relative paths.

### Link semantics
A link from concept A to concept B asserts a *relationship*. The specific kind of relationship is conveyed by surrounding prose, not the link itself. Consumers treat all links as directed edges of an untyped relationship. Consumers MUST tolerate broken links.

## Index Files (Section 6)

`index.md` MAY appear in any directory, including the bundle root. It supports **progressive disclosure**.

- No frontmatter (except optional `okf_version` at bundle root).
- Entries SHOULD include the description from the linked concept's frontmatter.
- Producers MAY generate `index.md` automatically; consumers MAY synthesize one when none is present.

## Log Files (Section 7)

`log.md` MAY appear at any level of the hierarchy.

- Date headings MUST use ISO 8601 `YYYY-MM-DD`.
- Newest first.
- Leading bold word convention: `**Update**`, `**Creation**`, `**Deprecation**`, etc.
- No frontmatter.

## Citations (Section 8)

Listed under `# Citations` at the bottom of a concept document, numbered:

```markdown
# Citations

[1] [Title of source](https://example.com)
[2] [Another source](https://example.org)
```

May be absolute URLs, bundle-relative paths, or paths into `references/`.

## Versioning (Section 11)

- Minor bump: backward-compatible additions (new optional fields, new conventional section headings).
- Major bump: breaking changes (renaming required fields, changing reserved filenames).
- Bundles MAY declare the spec version via `okf_version: "0.1"` in root `index.md`.

## Relationship to Other Formats (Section 10)

OKF is intentionally close to: LLM "wiki" repositories, personal knowledge tools (Obsidian, Notion), and "metadata as code" approaches. OKF differs primarily in being **specified** — pinning down the small set of rules needed for interoperability.

## Design Goals

1. Define a universal format that enrichment agents can write into.
2. Inform how consumption agents should read and traverse it.
3. Facilitate exchange of knowledge across systems and organizations.
4. Standardize the small number of required fields.

## Non-Goals

- Defining a fixed taxonomy of concept types.
- Prescribing storage, serving, or query infrastructure.
- Replacing domain-specific schemas (Avro, Protobuf, OpenAPI, etc.) — OKF *references* them, it does not subsume them.
