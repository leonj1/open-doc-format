# Concept Document Template

Copy this template when creating a new OKF concept document. Replace all placeholders in `{braces}`.

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

{Optional overview section — describe what this concept is and why it matters.}

# Schema

{If this concept describes structured data, include a table of columns/fields/properties.}

| Name | Type | Description |
|------|------|-------------|
| `{column_name}` | {TYPE} | {Description of the column.} |

# Examples

{Optional — concrete usage examples.}

```sql
{Example query or code snippet}
```

# Joins / Relationships

{Optional — describe how this concept relates to others. Cross-link generously.}

- Joined with [{related concept}](/path/to/concept.md) on `{key}`.

# Citations

{Optional — external sources supporting claims in this document. Numbered.}

[1] [{Source title}]({https://...})
```

## Field Reference

| Field | Required? | Notes |
|-------|-----------|-------|
| `type` | **Yes** | Short, descriptive string. No central registry — pick what makes sense. Examples: `Table`, `API Endpoint`, `Metric`, `Playbook`, `Reference`, `Dashboard`, `Pipeline`. |
| `title` | Recommended | Display name. If omitted, consumers may derive from filename. |
| `description` | Recommended | One sentence. Used by index generators and search. |
| `resource` | Recommended | Canonical URI for the asset. Omit for abstract concepts (playbooks, metrics, etc.). |
| `tags` | Recommended | YAML list. Keep tags short and consistent across the bundle. |
| `timestamp` | Recommended | ISO 8601. Use current UTC time for new documents. |
| Extension keys | Optional | Any additional YAML key/value pairs are allowed and preserved by consumers. |
