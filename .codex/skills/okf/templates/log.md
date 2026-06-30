# Log File Template

Copy this template for `log.md` files. A log file may appear at any level of the hierarchy.

```markdown
# Directory Update Log

## {YYYY-MM-DD}
* **{Action}**: {Description of what changed, with [links](/path/to/concept.md) to affected concepts.}
* **{Action}**: {Another change description.}

## {YYYY-MM-DD}
* **Initialization**: Created foundational directory structure.
```

## Rules

- Date headings MUST use ISO 8601 `YYYY-MM-DD` format.
- Newest entries first (most recent date at the top).
- Leading bold word convention: `**Update**`, `**Creation**`, `**Deprecation**`, `**Removal**`, etc.
- Include Markdown links to affected concepts when applicable.
- No YAML frontmatter.
- No required sections — entries are flat prose.

## Example (filled in)

```markdown
# Sales Data Update Log

## 2026-06-15
* **Update**: Added `discount_applied` column to [Orders](/tables/orders.md) schema.
* **Creation**: Added new [Customer Metrics](/tables/customer-metrics.md) concept.

## 2026-06-01
* **Update**: Updated [Sales Dataset](/datasets/sales.md) description to reflect warehouse migration.

## 2026-05-15
* **Initialization**: Created initial structure for sales data catalog.
```
