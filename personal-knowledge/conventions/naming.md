---
type: Convention
title: Naming Conventions
description: How I name classes, functions, and files — follow the language, nouns for classes, verbs for functions, specificity scales with depth.
tags: [conventions, naming, style]
timestamp: 2026-06-19T00:00:00Z
---

# Default Rule

I adhere to the naming conventions of the programming language I'm working in. Every language has its own idioms — I follow them rather than imposing a cross-language standard.

# When the Language is Silent

If the language doesn't prescribe a convention:

| Named thing | Rule | Example |
|-------------|------|---------|
| **Classes** | Noun | `Report`, `Client`, `Handler` |
| **Functions** | Verb | `generate()`, `fetch()`, `parse()` |

# Specificity Scales with Depth

Top-level classes get **shorter, broader names**. Classes closer to the action get **longer, more specific names**:

```
Report           ← top-level, broad abstraction
PdfReport        ← deeper, concrete implementation
MarkdownReport   ← deeper, alternative implementation
```

This creates a natural hierarchy where the name alone tells you where something sits in the abstraction stack — short names near the top, long names near the bottom.
