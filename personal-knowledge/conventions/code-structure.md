---
type: Convention
title: Code Structure and Patterns
description: How I structure code — I/O interfaces with Fakes under tests/, dependency injection, no implicit fallbacks, type discipline, immutability, Result types, functional BDD testing, size limits, and route/service/I/O separation.
tags: [conventions, code-structure, patterns, dependency-injection, interfaces, testing, types, immutability, error-handling, result-type, bdd, functional-testing, no-fallbacks]
timestamp: 2026-07-11T00:00:00Z
---

# I/O Interface Pattern

Whenever a class performs any form of I/O — network, disk, database, HTTP — I create an **interface** for that class and **two concrete implementations**:

| Implementation | Purpose |
|---------------|---------|
| **Production class** | The real implementation — talks to the actual database, filesystem, or external API. |
| **Fake class** | Test-support implementation stored under the top-level `tests/` directory — returns canned responses, records calls, and never touches real I/O. |

```typescript
// Example pattern
interface UserRepository {
  findById(id: string): Promise<User>;
  save(user: User): Promise<void>;
}

class PostgresUserRepository implements UserRepository {
  // Real Postgres queries
}

class FakeUserRepository implements UserRepository {
  // In-memory Map, returns test data
}
```

The Fake is not a mock. Mocking frameworks (Jest mocks, Mockito, unittest.mock, testify/mock, etc.) are **not allowed**. They hide behavior behind auto-generated proxies, make tests brittle by coupling to implementation details, and encourage testing that passes without verifying real behavior.

A Fake is a hand-written class that:
- Implements the same interface as the production class
- Returns deterministic, predictable data
- Records calls so tests can assert on interactions
- Has **zero** dependencies on mocking libraries

```typescript
// NOT ALLOWED — mocking framework
jest.mock("./user-repository");
const mockRepo = new Mock<UserRepository>();
mockRepo.setup("findById").returns(fakeUser);

// ALLOWED — hand-written Fake
class FakeUserRepository implements UserRepository {
  private users = new Map<string, User>();
  findById(id: string) { return this.users.get(id) ?? null; }
  save(user: User) { this.users.set(user.id, user); return user; }
}
```

If a test needs a different behavior from the Fake, extend the Fake class — don't reach for a mocking framework. Every Fake is test-support code and must live under the top-level `tests/` directory, never under `src/` or beside its production implementation. It remains part of the codebase and is maintained with the same discipline as production code.

# Dependency Injection

I use **constructors** to inject dependencies. Every class receives its dependencies through its constructor, never by importing or instantiating them directly:

```typescript
class OrderService {
  constructor(
    private readonly orders: OrderRepository,    // Injected interface
    private readonly customers: CustomerRepository, // Injected interface
  ) {}

  async placeOrder(customerId: string): Promise<Order> {
    const customer = await this.customers.findById(customerId);
    return this.orders.save({ customerId, status: "placed" });
  }
}
```

- **Production:** `new OrderService(new PostgresOrderRepo(...), new PostgresCustomerRepo(...))`
- **Tests:** `new OrderService(new FakeOrderRepo(...), new FakeCustomerRepo(...))`

No DI framework — manual constructor injection is sufficient and keeps the dependency graph explicit and grep-able.

# Literal Requirements and Fallbacks

Implement the logic exactly as specified. Do not add alternate behavior, default values, silent fallback paths, or "helpful" recovery logic unless the requirement explicitly calls for it.

If a requirement says "read the database connection string from the environment variable," the implementation reads that environment variable and reports failure when it is missing. It does not use a hard-coded default, a local config file, a sample value, or a secondary environment variable unless those fallback sources are explicitly named.

When a required input is absent, fail clearly through the project's normal error mechanism rather than guessing. The caller, deployment configuration, or test setup should provide the required value.

# Size and Complexity Limits

| Rule | Limit | Rationale |
|------|-------|-----------|
| **Class size** | Fewer than 700 lines | A file over 700 lines has too many responsibilities. Extract a collaborator. |
| **Function size** | Fewer than 30 lines | A function over 30 lines does too much. It's doing multiple things or handling too many edge cases inline. |
| **Cyclomatic complexity** | No more than 2 indentations | Deep nesting is the primary readability killer. If you're three indents deep, extract a function or use early returns. |

# Route Discipline

Routes and endpoints in `src/routes/` have **one job**: call services in `src/services/`. They never perform I/O directly. Route classes use object names such as `HttpRoute` or `OrderEndpoint`, never `Handler` or `Controller`.

```
Request → Route → Service → Client (I/O interface) → External World
```

| Good (route) | Bad (route) |
|--------------|-------------|
| `orderService.placeOrder(req.body)` | `fetch("https://api.example.com/...")` |
| `userService.getById(req.params.id)` | `db.query("SELECT * FROM users WHERE...")` |

The route translates HTTP concerns (request parsing, response formatting, status codes) into service calls. The service handles business logic. The client (behind an interface) handles I/O.

# Request Flow

```
Route
  │ parses request, validates input
  ▼
Service
  │ orchestrates business logic
  │ calls clients through their interfaces
  ▼
Client (ProductionIoCient or FakeIoCient)
  │ performs actual or fake I/O
  ▼
Returns through the chain back to the route
  │ route formats HTTP response
  ▼
Response to caller
```

# Type Discipline

## Arguments Must Be Strongly Typed

Every function argument must have an explicit type. No `any`, no untyped parameters:

| Good | Bad |
|------|-----|
| `function placeOrder(customerId: CustomerId, items: OrderItem[]): Order` | `function placeOrder(customerId, items)` |
| `def handle(event: OrderPlaced) -> None:` | `def handle(event):` |
| `func Save(ctx context.Context, user User) error` | `func Save(ctx, user) error` |

## Prefer Typed Objects Over Primitives

Avoid bare strings, numbers, or booleans as arguments. Wrap them in typed objects with semantic meaning:

| Good | Bad |
|------|-----|
| `function sendEmail(recipient: EmailAddress, subject: EmailSubject)` | `function sendEmail(recipient: string, subject: string)` |
| `function charge(customer: CustomerId, amount: UsdAmount)` | `function charge(customer: string, amount: number)` |
| `func Connect(addr net.IP, port Port) error` | `func Connect(addr string, port int) error` |

A `string` doesn't tell you what it is. An `EmailAddress` does. Use branded types, newtypes, or value objects to wrap primitives.

## Functions Return Values — Never Mutate Arguments

Functions must return a strongly typed object. Never mutate the incoming argument:

```typescript
// Good — returns new state
function addItem(order: Order, item: OrderItem): Order {
  return { ...order, items: [...order.items, item] };
}

// Bad — mutates the argument
function addItem(order: Order, item: OrderItem): void {
  order.items.push(item);  // mutated incoming object
}
```

Immutability means: callers always receive the result as a return value. No side effects on parameters. Functions that appear to "update" something should return the new state.

# No Static Classes or Properties

Static members couple callers to a global, making testing and refactoring hard. Every dependency must be an instance passed through a constructor:

| Good | Bad |
|------|-----|
| `new OrderService(new StripeClient(config))` | `StripeClient.charge(amount)` |
| Instance method on an injected dependency | Static method on a class |
| Instance property on an injected dependency | `Config.STATIC_FIELD` |

If the language absolutely requires a static entry point (e.g., a `main` function), that's the only exception. Everything else is an instance.

# Error Handling: Result Types, Not Exceptions

## Avoid Throwing Exceptions

Exceptions should not be thrown as part of normal operation. They exist for truly unrecoverable situations (out of memory, stack overflow), not for business logic:

```typescript
// Bad — exception as control flow
function findUser(id: string): User {
  const user = db.query("SELECT * FROM users WHERE id = ?", id);
  if (!user) throw new NotFoundError("User not found");
  return user;
}
```

## Return a Result Type

If the language supports tagged unions, `Result`, `Either`, or similar, use them:

```typescript
// Good — Result type in TypeScript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function findUser(id: string): Result<User, NotFoundError> {
  const user = db.query("SELECT * FROM users WHERE id = ?", id);
  if (!user) return { ok: false, error: new NotFoundError("User not found") };
  return { ok: true, value: user };
}
```

```go
// Good — Go's built-in error return
func FindUser(id string) (User, error) {
    user, err := db.Query(...)
    if err != nil {
        return User{}, fmt.Errorf("user not found: %w", err)
    }
    return user, nil
}
```

```python
# Good — tagged Result value in Python
def find_user(id: str) -> Result[User, NotFoundError]:
    user = db.query("SELECT * FROM users WHERE id = ?", id)
    if not user:
        return Err(NotFoundError("User not found"))
    return Ok(user)
```

## Exceptions Not for Control Flow

Exceptions must not be used as a control flow mechanism:

| Good | Bad |
|------|-----|
| `result = find_user(id); if result.ok: ... else: ...` | `try: user = find_user(id) except NotFoundError: ...` |
| `if err != nil { return err }` | `panic(err)` / `recover()` for expected conditions |
| Return a Result/Either | `throw` / `raise` for business rule violations |

The caller should inspect the Result's explicit success/error tag, not inspect the concrete type of its value and not wrap calls in try/catch for expected outcomes. An uncaught exception means something broke that shouldn't have — not "the user wasn't found."

# Testing Philosophy

## Prove the Behavior, Not Merely Success

Tests must prove **product behavior** and externally observable effects. A success flag alone is insufficient when the feature promises additional outcomes. The assertions must be strong enough that deleting, corrupting, duplicating, or misrouting an important value causes the test to fail.

For each behavior, verify every outcome that is part of its contract:

- the returned `Result`, including the correct success value or error code and message;
- state visible through a public interface, such as a persisted order or updated balance;
- effects at an I/O boundary, such as the complete email handed to an email service;
- absence of prohibited effects, such as sending nothing after validation fails; and
- relevant cardinality or ordering when duplicates or sequence change product behavior.

Use distinct, recognizable input values so accidental field swaps, omissions, and hard-coded values are detected. Do not reproduce the production algorithm in the test to calculate the expected answer; state the expected behavior explicitly.

### Quality Functional Test

A fake email service records messages accepted at its public boundary. That recorded state is an observable effect, not a private implementation detail:

```typescript
it("sends the complete email requested by the user", async () => {
  const email = new FakeEmailService();
  const client = new EmailClient(email);

  const result = await client.send({
    recipient: "user@example.com",
    subject: "Meeting tomorrow",
    body: "Let's sync at 2pm.",
    cc: ["manager@example.com"],
    bcc: ["archive@example.com"],
  });

  expect(result).toEqual(Ok(undefined));
  expect(email.sentMessages()).toEqual([{
    recipient: "user@example.com",
    subject: "Meeting tomorrow",
    body: "Let's sync at 2pm.",
    cc: ["manager@example.com"],
    bcc: ["archive@example.com"],
  }]);
});
```

This test fails if the client reports success without sending, drops a field, changes a value, sends to the wrong recipient, or sends more than once.

### Weak Test

```typescript
it("returns success", async () => {
  const client = new EmailClient(new FakeEmailService());
  const result = await client.send(validEmail);
  expect(result.ok).toBe(true);
});
```

This is inadequate by itself. A fake or production client that always returns success passes even when no email is delivered.

## Required Test Cases

Each feature must cover the cases relevant to its contract:

| Case | What to prove |
|------|---------------|
| Happy path | Correct result, state change, and complete external effect |
| Validation failure | Specific error and no state change or external effect |
| Boundary failure | Dependency error is translated or propagated as the declared `Result` |
| Edge and boundary values | Empty, minimum, maximum, duplicate, and special values behave as specified |
| Authorization | Allowed actions succeed; forbidden actions fail without side effects |
| Idempotency/retry | Repetition does not duplicate effects when the contract promises idempotency |
| Regression | The test fails for the known defect and passes for the corrected behavior |

Do not add irrelevant cases mechanically. Choose cases from requirements, invariants, past defects, and credible failure modes.

## Boundary Contracts and Orchestration

Assertions on serialized requests and collaborator interactions are valid when those details cross a defined boundary or constitute the behavior being tested. Examples include:

- an HTTP adapter emits the required method, path, headers, and body;
- a repository persists the correct entity;
- invalid input causes zero calls to an external service;
- a payment is submitted exactly once; and
- events are published in a required order.

Prefer asserting a Fake's resulting state or recorded domain operations over asserting incidental low-level calls. Call counts and ordering must be asserted only when too many, too few, or reordered operations would change correctness.

Production I/O implementations also require contract or integration tests against the real protocol or a faithful test instance. Tests using a Fake prove the consumer's behavior against the interface; they do not prove that the production implementation authenticates, serializes, queries, or handles the real system correctly. Run real-boundary tests separately when they are slower or require credentials.

## The BDD Litmus Test

Every test must be explainable as a behavior, invariant, boundary contract, or regression. Name it so the scenario and expected outcome are clear.

| Assert | Avoid |
|--------|-------|
| Complete email accepted by the email boundary | A generic `ok` flag alone |
| Order persisted with the requested items and total | Shape of a private intermediate object |
| Invalid request returns the declared error and writes nothing | Direct calls to private validation methods |
| HTTP adapter sends the provider's required payload | Local variable names or helper selection |
| Payment occurs exactly once | Call count when repetition has no behavioral meaning |

A refactor may legitimately require test changes when it changes a public boundary contract. Tests must not depend on private methods, transient intermediate objects, local control flow, or helper-call order when those details have no observable effect.

## Test Quality Checklist

A quality test is:

- **behavioral** — tied to a requirement, invariant, contract, or defect;
- **specific** — checks exact meaningful values, not only truthiness or absence of an exception;
- **sensitive** — fails when any promised output or effect is removed or corrupted;
- **isolated** — controls its own inputs and does not depend on test order or shared mutable state;
- **deterministic** — controls time, randomness, concurrency, and external dependencies where necessary;
- **readable** — makes setup, action, and expected outcome apparent;
- **focused** — diagnoses one behavior or scenario while allowing all assertions needed to prove it; and
- **maintainable** — depends on public behavior and boundary contracts, not irrelevant implementation choices.

## Code Coverage Above 80%

Every project must maintain **code coverage above 80%** . Coverage is measured across the entire codebase, not per-file. The 80% threshold is a floor, not a target — higher is better.

```bash
# TypeScript/Vitest
npx vitest --coverage

# Python/pytest
pytest --cov=src --cov-report=term --cov-fail-under=80

# Go
go test -cover ./...
```

Coverage gates are enforced in CI where CI exists, and checked manually before merging where it doesn't. A PR that drops coverage below 80% must either add tests or explicitly justify why the uncovered code cannot be meaningfully tested.

Fakes make consumer behavior testable without real external dependencies, but they do not cover production adapters. System calls, hardware interfaces, platform-specific paths, and third-party protocols require focused integration or contract tests in an appropriate environment. If such a test cannot run in the normal suite, document where and how it runs rather than claiming Fake coverage as a substitute.

# Related

- [Project Structure](/conventions/project-structure.md) — where things live on disk
- [Configuration Management](/conventions/configuration.md) — how IO clients get their connection strings
- [Dependencies and Libraries](/conventions/dependencies.md) — no DI framework, manual injection
