---
type: Reference
title: Elegant Objects (Yegor Bugayenko)
description: The 23 practical OOP recommendations from Yegor Bugayenko's "Elegant Objects" (Volume 1, 2017) — covering construction, encapsulation, immutability, method design, error handling, and class design.
resource: https://www.yegor256.com/elegant-objects.html
tags: [reference, book, oop, object-oriented, design, immutability, encapsulation, java]
timestamp: 2026-07-11T00:00:00Z
---

*Elegant Objects* (Volume 1, version 1.5, April 28, 2017) by Yegor Bugayenko is a book of 23 practical recommendations for object-oriented programmers. Most run against mainstream advice — it argues that static methods, NULL references, getters, setters, and mutable classes are harmful. The summary below captures the book's top-level recommendations; examples in the book are in Java.

I treat these as **applied conventions**, except where an explicit project convention overrides the book. Agents writing code in my projects should follow the local adaptations identified below (wired into the Key Rules in [USAGE.md](/USAGE.md)). Several recommendations align with [my code conventions](/conventions/code-structure.md) — immutability, no static members, constructor injection, fakes over mocks, and avoiding NULL.

# The 23 Recommendations

## Chapter 1 — Birth (constructing objects)

| # | Recommendation | Gist |
|---|----------------|------|
| 1.1 | **Never use action or role names ending in -er/-or** | Name classes after *what they are*, not what they do. Avoid `Handler`, `Manager`, `Controller`, `Helper`, `Validator`, and `Parser` — they describe procedures or roles, not objects. Use object names such as `HttpRoute` or `OrderEndpoint`; verbs such as `handle()` belong on methods. |
| 1.2 | **Make one constructor primary** | Have a single "primary" constructor that initializes all fields; all "secondary" constructors delegate to it. Place the primary one last. |
| 1.3 | **Keep constructors code-free** | Constructors should only assign arguments to fields — no computation, parsing, or I/O. Do real work lazily, when the object is used. |

## Chapter 2 — Education (educating objects)

| # | Recommendation | Gist |
|---|----------------|------|
| 2.1 | **Encapsulate as little as possible** | Aim for four or fewer encapsulated properties. More state means a class doing too much. |
| 2.2 | **Encapsulate something at the very least** | An object with no state is a collection of procedures, not an object. Encapsulate at least one thing. |
| 2.3 | **Always use interfaces** | Every public method of every class should implement an interface, so objects can be decoupled and substituted. |
| 2.4 | **Choose method names carefully** | Builders are nouns (`content()`), manipulators are verbs (`save()`). Don't mix the two. Boolean methods read as adjectives (`empty()`, not `isEmpty()`). |
| 2.5 | **Don't use public constants** | Shared `public static final` constants introduce coupling and destroy cohesion. Encapsulate the constant behind behavior instead. |
| 2.6 | **Be immutable** | Immutable objects are simpler, thread-safe, fail atomically, are side-effect-free, and avoid temporal coupling. Mutability is the source of most bugs. |
| 2.7 | **Write tests instead of documentation** | Tests are the best documentation — executable, always current, and unambiguous. |
| 2.8 | **Don't mock; use fakes** | Mocking frameworks couple tests to implementation. Ship hand-written fake classes that implement the same interface. |
| 2.9 | **Keep interfaces short; use smarts** | Keep interfaces minimal (five methods or fewer). Put convenience methods in a "smart" companion class that decorates the interface. |

## Chapter 3 — Employment (working with objects)

| # | Recommendation | Gist |
|---|----------------|------|
| 3.1 | **Expose fewer than five public methods** | Small public surface area keeps classes focused and maintainable. |
| 3.2 | **Don't use static methods** | Static methods are procedural, untestable, and uncomposable. Prefer objects: no utility classes, no Singletons. |
| 3.3 | **Never accept NULL arguments** | Methods must reject NULL. A NULL argument is a hidden, undocumented mode of operation. |
| 3.4 | **Be loyal and immutable, or constant** | Objects should either be immutable representatives of a real-world entity, or true constants — never mutable and "loyal" to changing data. |
| 3.5 | **Never use getters and setters** | Getters/setters turn objects into data structures and break encapsulation. Objects should expose behavior, not their internals. |
| 3.6 | **Don't use `new` outside of secondary ctors** | Hard-coded `new` couples a class to its dependencies. Only secondary constructors should instantiate dependencies; otherwise inject them. |
| 3.7 | **Avoid type introspection and casting** | `instanceof`, reflection, and downcasting break polymorphism and couple code to concrete types. |

## Chapter 4 — Retirement (destructing objects & errors)

| # | Recommendation | Gist |
|---|----------------|------|
| 4.1 | **Never return NULL** | Returning NULL forces callers into defensive checks. Return an object, an empty collection, or a null-object instead. |
| 4.2 | **Use Result values instead of exceptions for control flow (local override)** | The book recommends checked exceptions. This bundle intentionally overrides that advice: return a tagged `Result`/`Either` value for expected failures and business outcomes. Callers inspect the Result's success/error tag, never a concrete error type. Exceptions are reserved for truly unrecoverable failures and must not drive control flow. |
| 4.3 | **Be either final or abstract** | A class should be `final` (no inheritance) or `abstract` (only inheritance) — never something in between. Composition over implementation inheritance. |
| 4.4 | **Use RAII** | Resource Acquisition Is Initialization — tie resource lifecycle to object lifecycle so resources are released deterministically (e.g. `try-with-resources` / `Closeable`). |

# Related

- [Code Structure and Patterns](/conventions/code-structure.md) — my conventions overlap with 2.6 (immutable), 2.8 (fakes not mocks), 3.2 (no static), 3.6 (constructor injection), and 4.1 (no NULL via Result types), and explicitly override 4.2 by requiring Result values for expected failures.
- [Naming Conventions](/conventions/naming.md) — applies 1.1 (never action or role class names ending in -er/-or) and 2.4 (method naming).

# Citations

[1] Yegor Bugayenko, *Elegant Objects*, Volume 1, version 1.5 (April 28, 2017). https://www.yegor256.com/elegant-objects.html
[2] Recommendations and section structure extracted via OCR from a scanned copy (`tmp/elegant-objects-v1.pdf`); chapter/section numbering preserved from the book's table of contents.
