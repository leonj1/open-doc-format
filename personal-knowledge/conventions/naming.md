---
type: Convention
title: Naming Conventions
description: How I name classes, functions, and files — Elegant Objects names for classes, verbs for manipulators and nouns for builders, adjectives for booleans, and specificity that scales with depth.
tags: [conventions, naming, style, elegant-objects]
timestamp: 2026-10-05T00:00:00Z
---

# Default Rule

I follow the programming language's syntactic naming conventions, such as capitalization and file naming. For the meaning of class names, the Elegant Objects convention below takes precedence over language or framework idioms.

# Class and Function Names

| Named thing | Rule | Example |
|-------------|------|---------|
| **Classes** | Name what the object **is**. Use a noun and never an action or role name ending in `-er` or `-or`. | `Report`, `HttpRoute`, `OrderEndpoint` |
| **Functions and methods** | Name what the operation **does**. Use a verb for anything that performs an action or causes an effect. | `generate()`, `fetch()`, `parse()`, `handle()`, `save()` |

Names such as `Handler`, `Controller`, `Manager`, `Helper`, `Validator`, and `Parser` are prohibited for classes. They describe an action or role instead of the object itself. Name the object after the domain concept it represents; for example, use `OrderEndpoint` or `HttpRoute`, with a verb such as `handle()` for its behavior.

# Method Names: Verbs, Nouns, and Adjectives

The verb rule above is the default and covers most methods. Elegant Objects 2.4 refines it for two method kinds, and that refinement is applied here:

| Method kind | Name as | Examples | Not |
|-------------|---------|----------|-----|
| **Manipulator** — performs an action, causes an effect, returns nothing meaningful or a `Result` | Verb | `save()`, `send()`, `placeOrder()`, `handle()` | `saver()`, `sending()` |
| **Builder** — computes and returns a new value without side effects | Noun describing what is returned | `content()`, `total()`, `asPdf()`, `withEmail(e)` | `getContent()`, `calculateTotal()`, `buildPdf()` |
| **Boolean query** — answers yes or no | Adjective, read after the object's name | `empty()`, `expired()`, `valid()` | `isEmpty()`, `hasExpired()`, `checkValid()` |

Do not mix kinds in one method: a builder never mutates, and a manipulator never returns the thing it changed as its primary result. Where a language or framework idiom forces a prefix (Python's `__len__`, Go's `String()`, a framework lifecycle hook), follow the language; this table governs the names I choose freely.

Together with the [no getters or setters](/conventions/code-structure.md#no-getters-or-setters) rule this means `get`/`set` prefixes never appear on a method in `src/`.

# Specificity Scales with Depth

Top-level classes get **shorter, broader names**. Classes closer to the action get **longer, more specific names**:

```
Report           ← top-level, broad abstraction
PdfReport        ← deeper, concrete implementation
MarkdownReport   ← deeper, alternative implementation
```

This creates a natural hierarchy where the name alone tells you where something sits in the abstraction stack — short names near the top, long names near the bottom.
