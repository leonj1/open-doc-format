# Log File Template

Copy this template for `log.md` files at any hierarchy level.

```markdown
# Directory Update Log

## {YYYY-MM-DD}
* **{Action}**: {Description with [links](/path/to/concept.md) to affected concepts.}
* **{Action}**: {Another change description.}

## {YYYY-MM-DD}
* **Initialization**: Created foundational directory structure.
```

## Rules

- Date headings: ISO 8601 `YYYY-MM-DD`.
- Newest entries first.
- Conventional bold action words: `**Update**`, `**Creation**`, `**Deprecation**`, `**Removal**`.
- Include Markdown links to affected concepts.
- No YAML frontmatter.
- No required sections — flat prose entries.

## Example

```markdown
# Sales Data Update Log

## 2026-06-15
* **Update**: Added `discount_applied` column to [Orders](/tables/orders.md) schema.
* **Creation**: New [Customer Metrics](/tables/customer-metrics.md) concept.

## 2026-06-01
* **Update**: Updated [Sales Dataset](/datasets/sales.md) description for warehouse migration.

## 2026-05-15
* **Initialization**: Created initial structure for sales data catalog.
```
