# Concept Document Template

Copy this template when creating a new OKF concept document. Replace all `{placeholders}`.

```markdown
---
type: {TypeName}
title: {Display Title}
description: {One-sentence summary of what this concept represents.}
resource: {Canonical URI for the underlying asset — omit for abstract concepts}
tags: [{tag1}, {tag2}]
timestamp: {YYYY-MM-DDTHH:MM:SSZ}
---

# Overview

{Optional — describe what this concept is and why it matters.}

# Schema

{If this describes structured data, include a table of columns/fields/properties.}

| Name | Type | Description |
|------|------|-------------|
| `{column_name}` | {TYPE} | {Description.} |

# Examples

{Optional — concrete usage examples.}

```sql
{Example query or code snippet}
```

# Joins / Relationships

{Optional — describe relationships. Cross-link generously.}

- Joined with [{related concept}](/path/to/concept.md) on `{key}`.

# Citations

{Optional — external sources. Numbered.}

[1] [{Source title}]({https://...})
```

## Field Reference

| Field | Required? | Notes |
|-------|-----------|-------|
| `type` | **Yes** | Short, descriptive string. No registry. Examples: `Table`, `API Endpoint`, `Metric`, `Playbook`, `Reference`, `Dashboard`. |
| `title` | Recommended | Display name. Derivable from filename if omitted. |
| `description` | Recommended | One sentence for index generators and search. |
| `resource` | Recommended | Canonical URI. Omit for abstract concepts. |
| `tags` | Recommended | YAML list. Keep consistent across the bundle. |
| `timestamp` | Recommended | ISO 8601. Use current UTC time for new documents. |
| Extension keys | Optional | Any additional YAML key/value pairs allowed and preserved. |
