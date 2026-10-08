---
type: Convention
title: Before Coding
description: Decide whether new code is needed, reuse existing solutions, and choose the smallest sufficient change before implementation.
tags: [conventions, agents, planning, reuse, simplicity, yagni]
timestamp: 2026-10-08T00:00:00Z
---

# Before Coding

Apply while exploring a request, before choosing an implementation. Read the affected code and trace its callers first; for bugs, identify the shared root cause.

Evaluate these options in order, stopping when the requirement is satisfied:

1. Is the behavior needed now? Omit speculative work.
2. Search the codebase for reusable helpers, types, and patterns before adding equivalents.
3. Prefer a standard-library capability over custom logic.
4. Prefer a native platform capability over another dependency.
5. Reuse an installed dependency when it covers the need.
6. Choose a single clear expression when sufficient.
7. Otherwise, implement only the custom code necessary for the requirement.

Avoid scaffolding and abstractions for hypothetical future uses. Preserve explicit requirements, boundary validation, security, accessibility, and protection against data loss.

Once implementation is necessary, follow [Code Structure and Patterns](/conventions/code-structure.md) and the other conventions. Required interfaces, Fakes, typed objects, and tests still apply.

# Citations

[1] Adapted from [Ponytail's decision ladder and safeguards](https://github.com/DietrichGebert/ponytail/blob/main/skills/ponytail/SKILL.md).
