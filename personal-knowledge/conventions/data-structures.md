---
type: Convention
title: Choosing Data Structures
description: Choose the most constrained data structure whose operations match the problem — lists and maps are permissive last resorts, not defaults, because they let invalid states be constructed and saved.
tags: [conventions, data-structures, invariants, type-safety, illegal-states, priority-queue, stack, queue, set, ai-agents]
timestamp: 2026-08-25T00:00:00Z
---

# The Rule

Choose a data structure by answering two questions, in this order:

1. **What operations does the problem actually need?** (the access pattern)
2. **What states must never exist?** (the invariants)

Then pick the **most constrained structure whose API only permits valid operations**. A structure earns its place by making invalid states unrepresentable — not by being familiar.

Lists and maps are the *least* constrained structures available. They are the correct choice only when the problem genuinely is "an ordered collection with no invariants" or "arbitrary key lookup with no invariants." Everything else deserves something stronger. Reaching for `[]` or `{}` first is a smell, not a default.

# Why Lists and Maps Are Risky Defaults

AI coding tools (and rushed humans) default to lists and maps because they can represent *anything*. That universality is exactly the problem: a structure that can represent anything can represent every invalid state too.

When a list or map holds data that has rules, every rule becomes **runtime discipline scattered across the codebase** — a comment, a convention, a `sort()` call someone must remember, a validation check someone must not forget. The compiler enforces none of it. Any code path that touches the structure can silently violate the invariant and persist the broken state.

| Invariant the problem has | What a list/map allows anyway |
|---------------------------|-------------------------------|
| "Process items in priority order" | Items appended in arbitrary order; every consumer must remember to sort |
| "Only the most recent element is accessible" | Any index readable and writable; mid-list removal corrupts nesting |
| "No duplicates" | Duplicates insert silently; dedup logic copy-pasted at each call site |
| "Status is one of: pending, active, done" | `"PENDING"`, `"Pending "`, `"actve"` all store fine |
| "Never empty" | `[]` constructs fine, crashes later at the read site |
| "These two collections stay in sync" | Parallel list/map drift apart with no error at the write site |

The failure mode is always the same: **the invalid state is saved now and detonates later**, far from the code that created it. The fix is always the same: move the invariant out of runtime discipline and into the structure itself.

# Selection Table

Match the problem signal to the structure. The third column is the payoff — the invalid state that becomes impossible to construct.

| Problem signal | Reach for | Invalid state it eliminates |
|----------------|-----------|------------------------------|
| "Take the next item by priority / earliest deadline / cheapest cost" | **Priority queue / heap** | Consuming items out of priority order; forgotten re-sorts |
| "Most recently added is handled first" (undo, parsing, nesting, backtracking) | **Stack** | Reading or removing from the middle; corrupted nesting |
| "First in, first out" (job processing, message passing, BFS) | **Queue / deque** | Starvation and reordering; index-juggling on a list |
| "Each element appears at most once" / "have I seen this?" | **Set** | Duplicates; O(n) `contains` scans over a list |
| "Unique elements, iterated in sorted order / range queries" | **Sorted set / tree map** | Unsorted iteration; sort-on-every-read |
| "How many of each?" | **Counter / multiset** | Hand-rolled `map[key] = (map[key] ?? 0) + 1` with missing-key bugs |
| "Value is one of a fixed set of options" | **Enum / tagged union** | Typos and casing drift in magic strings |
| "The object is in exactly one of N modes, each with its own data" | **Tagged union / sealed types** | Impossible flag combinations (`isLoading && isError`); fields that are `null` in half the modes |
| "This can never be empty" | **Non-empty collection type** | Empty-collection crashes at the read site instead of the construction site |
| "Fixed capacity, oldest evicted" (recent history, sliding window) | **Ring buffer** | Unbounded growth; manual `shift()` bookkeeping |
| "Two values always travel together" | **A struct/record in one collection** | Parallel lists/maps drifting out of sync |
| "Things reference each other" | **Explicit graph/adjacency structure** | Ad-hoc maps-of-lists with orphaned references |
| "Lookup by prefix" | **Trie** | Linear scans with `startsWith` over a list |

If no row matches and the data truly is "some items, in order, no rules" — then a list is correct. That conclusion should be reached by elimination, not by default.

# Make Invalid States Unrepresentable

The selection table is one instance of a broader principle: **design the type so the invalid state cannot even be constructed.** This extends [type discipline](/conventions/code-structure.md) from function signatures into data modeling.

## Boolean flags → tagged union

```typescript
// Bad — 2^3 = 8 representable states, only 3 are valid
interface FetchState {
  isLoading: boolean;
  data: Report | null;
  error: FetchError | null;
}
// Nothing stops { isLoading: true, data: report, error: err }

// Good — exactly 3 representable states, all valid
type FetchState =
  | { kind: "loading" }
  | { kind: "loaded"; data: Report }
  | { kind: "failed"; error: FetchError };
```

## Magic strings → enum

```go
// Bad — any string stores fine, including "actve"
type Order struct{ Status string }

// Good — the type system rejects unknown states
type OrderStatus int

const (
    OrderPending OrderStatus = iota
    OrderActive
    OrderDone
)

type Order struct{ Status OrderStatus }
```

## Parallel collections → one collection of records

```python
# Bad — nothing keeps these aligned
names: list[str] = []
scores: list[int] = []

# Good — a name and its score cannot separate
@dataclass(frozen=True)
class PlayerScore:
    name: PlayerName
    score: Score

scores: list[PlayerScore] = []
```

## List with an ordering rule → structure that owns the ordering

```typescript
// Bad — the invariant lives in a comment and in everyone's memory
const pendingJobs: Job[] = [];   // NOTE: keep sorted by deadline!
pendingJobs.push(job);           // invariant silently broken
pendingJobs.sort(byDeadline);    // every consumer must remember this

// Good — the structure cannot yield jobs out of deadline order
const pendingJobs = new PriorityQueue<Job>(byDeadline);
pendingJobs.enqueue(job);
const next = pendingJobs.dequeue();  // always the earliest deadline
```

# Wrap When the Language Lacks the Structure

Not every language ships a heap, ring buffer, or non-empty list. The answer is **not** to fall back to a raw list — it is to wrap the raw structure in a domain type that exposes only the valid operations. The invariant then lives in exactly one class instead of at every call site.

This is the data-structure form of [prefer typed objects over primitives](/conventions/code-structure.md): a `Job[]` doesn't tell you the rules; a `PendingJobs` does.

```typescript
// The raw array is a private implementation detail.
// The public API makes out-of-order consumption unrepresentable.
class PendingJobs {
  private readonly heap: Job[] = [];

  enqueue(job: Job): void { /* sift up by deadline */ }
  dequeue(): Result<Job, EmptyQueueError> { /* sift down */ }
  size(): JobCount { /* ... */ }
  // Deliberately absent: get(i), sort(), splice(), map() —
  // no caller can touch the middle or break the ordering.
}
```

Rules for wrappers:

- The raw list/map/array is **private**. Never expose it, and never return it by reference — return copies or immutable views.
- Expose **only the operations the problem needs**. Every method you leave off is an invalid state a caller can't create.
- Name the wrapper after the domain concept (`PendingJobs`, `UndoHistory`, `SeenEventIds`), per [naming conventions](/conventions/naming.md) — not `JobHeap` or `EventIdSet`, which name the implementation.
- Failure cases (dequeue from empty) return a [Result type](/conventions/code-structure.md), not an exception and not `null`.
- The wrapper is a real class with its own tests proving the invariant holds — including the operations it must *refuse*.

# Standard Library First

Prefer the language's built-in or standard-library structure over hand-rolling, and hand-rolling over a new dependency (per [dependencies](/conventions/dependencies.md) — a heap is ~40 lines, not a package):

| Need | TypeScript | Python | Go |
|------|-----------|--------|-----|
| Set | `Set` | `set` / `frozenset` | `map[T]struct{}` (wrap it) |
| Ordered map | `Map` (insertion order) | `dict` (insertion order) | wrap a slice + map |
| Priority queue | wrap an array as a heap | `heapq` (wrap it — module API is list-based) | `container/heap` (wrap it) |
| Queue / deque | wrap an array | `collections.deque` | wrap a slice or use `container/list` |
| Counter | wrap a `Map` | `collections.Counter` | wrap a `map[T]int` |
| Enum | union of literals / `enum` | `enum.Enum` / `StrEnum` | typed constants with `iota` |
| Tagged union | discriminated union | `Union` of frozen dataclasses + `match` | sealed interface + type switch |

`heapq` and `container/heap` operate on raw lists/slices — always wrap them so the raw structure never leaks into consumer code.

# Instructions for AI Coding Agents

When writing code for me, do not default to a list, array, map, or dict. Before introducing any collection or state-holding field:

1. **Enumerate the operations** the surrounding code performs on it (insert-then-take-min? push/pop? membership test? key lookup?).
2. **Enumerate the invariants** — complete this sentence: *"This structure is corrupt if ever ..."* (unsorted, duplicated, empty, out of sync, in two modes at once).
3. **Consult the selection table above.** If a row matches, use that structure or a domain wrapper around it.
4. A plain list or map is acceptable **only when step 2 produces no invariants**. If you keep a list anyway, state why in the PR/commit description — one sentence is enough.
5. Never model a fixed set of states as strings or booleans — use enums and tagged unions.
6. If you catch yourself writing `sort()` before every read, `contains()` before every insert, a "keep these in sync" comment, or a validity check for a state that shouldn't exist — stop. That is the signal you picked a structure too permissive for the problem. Replace the structure instead of adding the discipline.

# Performance Is the Tiebreaker, Not the Driver

The primary reason to choose the right structure is **correctness** — invalid states become unconstructible. Better complexity is the free byproduct: a heap's O(log n) insert beats re-sorting a list at O(n log n) per read; a set's O(1) membership beats a list's O(n) scan. When two structures both uphold the invariants, then let expected size and access frequency decide. Never accept a structure that permits invalid states because it micro-benchmarks faster.

# Related

- [Code Structure and Patterns](/conventions/code-structure.md) — type discipline, typed objects over primitives, Result types, immutability
- [Naming Conventions](/conventions/naming.md) — wrappers named for the domain concept, not the implementation
- [Dependencies and Libraries](/conventions/dependencies.md) — standard library before new dependencies
- [Elegant Objects](/references/elegant-objects.md) — small immutable objects that encapsulate their own rules
