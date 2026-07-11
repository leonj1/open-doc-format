---
type: Convention
title: Naming Conventions
description: How I name classes, functions, and files — Elegant Objects names for classes, verbs for functions, and specificity that scales with depth.
tags: [conventions, naming, style, elegant-objects]
timestamp: 2026-07-11T00:00:00Z
---

# Default Rule

I follow the programming language's syntactic naming conventions, such as capitalization and file naming. For the meaning of class names, the Elegant Objects convention below takes precedence over language or framework idioms.

# Class and Function Names

| Named thing | Rule | Example |
|-------------|------|---------|
| **Classes** | Name what the object **is**. Use a noun and never an action or role name ending in `-er` or `-or`. | `Report`, `HttpRoute`, `OrderEndpoint` |
| **Functions and methods** | Name what the operation **does**. Use a verb. | `generate()`, `fetch()`, `parse()`, `handle()` |

Names such as `Handler`, `Controller`, `Manager`, `Helper`, `Validator`, and `Parser` are prohibited for classes. They describe an action or role instead of the object itself. Name the object after the domain concept it represents; for example, use `OrderEndpoint` or `HttpRoute`, with a verb such as `handle()` for its behavior.

# Specificity Scales with Depth

Top-level classes get **shorter, broader names**. Classes closer to the action get **longer, more specific names**:

```
Report           ← top-level, broad abstraction
PdfReport        ← deeper, concrete implementation
MarkdownReport   ← deeper, alternative implementation
```

This creates a natural hierarchy where the name alone tells you where something sits in the abstraction stack — short names near the top, long names near the bottom.
