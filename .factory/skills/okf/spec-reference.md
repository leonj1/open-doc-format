# OKF v0.1 Specification Reference

> Condensed from the official spec:
> https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
> Load this file when you need full technical details beyond the skill overview.

## Terminology

- **Knowledge Bundle** — Self-contained, hierarchical collection of knowledge documents. The unit of distribution.
- **Concept** — Single unit of knowledge within a bundle. One markdown document.
- **Concept ID** — File path within the bundle, `.md` suffix removed: `tables/users.md` → `tables/users`.
- **Frontmatter** — YAML metadata block delimited by `---` at the top of a markdown file.
- **Body** — Everything after the frontmatter.
- **Link** — Standard markdown link from one concept to another.
- **Citation** — Link from a concept to an external source.

## Conformance (Section 9)

A bundle is **conformant** with OKF v0.1 if:

1. Every non-reserved `.md` file has a parseable YAML frontmatter block.
2. Every frontmatter block has a non-empty `type` field.
3. Reserved filenames (`index.md`, `log.md`) follow §6 and §7 when present.

Consumers MUST NOT reject for: missing optional fields, unknown `type` values, unknown extension keys, broken cross-links, missing `index.md` files.

## Frontmatter Fields (Section 4.1)

| Field | Status | Description |
|-------|--------|-------------|
| `type` | **Required** | Short descriptive string. No central registry. Examples: `BigQuery Table`, `API Endpoint`, `Metric`, `Playbook`. |
| `title` | Recommended | Display name. May derive from filename if omitted. |
| `description` | Recommended | One sentence. Used by index generators, search, previews. |
| `resource` | Recommended | Canonical URI for the underlying asset. Omit for abstract concepts. |
| `tags` | Recommended | YAML list of short strings. |
| `timestamp` | Recommended | ISO 8601 datetime of last meaningful change. |
| `okf_version` | Optional | Only in bundle-root `index.md` frontmatter. |

Producers MAY add any extension keys. Consumers SHOULD preserve unknown keys on round-trip.

## Type Values

No central registry. Pick descriptive, self-explanatory values. Consumers must tolerate unknown types (treat as generic concepts).

Common patterns: `<Platform> <Resource>` (`BigQuery Table`), simple domain terms (`API Endpoint`, `Metric`, `Playbook`, `Reference`, `Dashboard`, `Pipeline`).

## Body Conventions (Section 4.2)

Favor structural Markdown (headings, lists, tables, code blocks) over freeform prose.

| Heading | Purpose |
|---------|---------|
| `# Schema` | Columns, fields, or properties of the described asset. |
| `# Examples` | Concrete usage examples, often as fenced code blocks. |
| `# Citations` | Numbered external sources. |

## Cross-Linking (Section 5)

**Absolute (bundle-relative) — RECOMMENDED:**
```markdown
See the [customers table](/tables/customers.md).
```

**Relative:**
```markdown
See the [neighboring concept](./other.md).
```

Links assert relationships; meaning is in surrounding prose. Consumers treat links as directed edges. Broken links are tolerated.

## Index Files (Section 6)

- May appear at any level. No frontmatter (except `okf_version` at bundle root).
- Group entries under `# Headings`. Include descriptions from concept frontmatter.
- May be auto-generated or synthesized when absent.

## Log Files (Section 7)

- May appear at any level. No frontmatter.
- Date headings: ISO 8601 `YYYY-MM-DD`. Newest first.
- Conventional bold action words: `**Update**`, `**Creation**`, `**Deprecation**`, etc.

## Citations (Section 8)

Numbered list under `# Citations`. May be absolute URLs, bundle-relative paths, or `references/` paths.

## Versioning (Section 11)

- Minor bump: backward-compatible (new optional fields, new conventional headings).
- Major bump: breaking (renaming required fields, changing reserved filenames).
- Declare version via `okf_version: "0.1"` in root `index.md`.

## Relationship to Other Formats (Section 10)

OKF is close to: LLM wiki repos, personal knowledge tools (Obsidian, Notion), and "metadata as code" approaches. It differs by being **specified** — pinning down the minimum rules for interoperability.

## Goals vs Non-Goals

**Goals:** Universal format that agents can write into; guide consumption and exchange; standardize minimal required fields.

**Non-goals:** Fixed taxonomy of types; prescribing storage/serving/query infrastructure; replacing domain schemas (Avro, Protobuf, OpenAPI).
