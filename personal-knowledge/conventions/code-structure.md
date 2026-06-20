---
type: Convention
title: Code Structure and Patterns
description: How I structure code inside the project directories — I/O interfaces + Fakes (no mocks), dependency injection, type discipline, immutability, Result types over exceptions, functional BDD testing over technical tests, size limits, and the strict separation between routes, services, and I/O.
tags: [conventions, code-structure, patterns, dependency-injection, interfaces, testing, types, immutability, error-handling, result-type, bdd, functional-testing]
timestamp: 2026-06-19T00:00:00Z
---

# I/O Interface Pattern

Whenever a class performs any form of I/O — network, disk, database, HTTP — I create an **interface** for that class and **two concrete implementations**:

| Implementation | Purpose |
|---------------|---------|
| **Production class** | The real implementation — talks to the actual database, filesystem, or external API. |
| **Fake class** | Wired in only during **unit testing** — returns canned responses, records calls, never touches real I/O. |

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

If a test needs a different behavior from the Fake, extend the Fake class — don't reach for a mocking framework. The Fake is part of the codebase, lives alongside production code, and is maintained with the same discipline.

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

# Size and Complexity Limits

| Rule | Limit | Rationale |
|------|-------|-----------|
| **Class size** | Fewer than 700 lines | A file over 700 lines has too many responsibilities. Extract a collaborator. |
| **Function size** | Fewer than 30 lines | A function over 30 lines does too much. It's doing multiple things or handling too many edge cases inline. |
| **Cyclomatic complexity** | No more than 2 indentations | Deep nesting is the primary readability killer. If you're three indents deep, extract a function or use early returns. |

# Route Handler Discipline

Handlers in `src/routes/` have **one job**: call services in `src/services/`. They never perform I/O directly.

```
Request → Route Handler → Service → Client (I/O interface) → External World
```

| Good (handler) | Bad (handler) |
|----------------|---------------|
| `orderService.placeOrder(req.body)` | `fetch("https://api.example.com/...")` |
| `userService.getById(req.params.id)` | `db.query("SELECT * FROM users WHERE...")` |

The handler translates HTTP concerns (request parsing, response formatting, status codes) into service calls. The service handles business logic. The client (behind an interface) handles I/O.

# Request Flow

```
Route Handler
  │ parses request, validates input
  ▼
Service
  │ orchestrates business logic
  │ calls clients through their interfaces
  ▼
Client (ProductionIoCient or FakeIoCient)
  │ performs actual or fake I/O
  ▼
Returns through the chain back to the handler
  │ handler formats HTTP response
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
# Good — Union type in Python 3.10+
def find_user(id: str) -> User | NotFoundError:
    user = db.query("SELECT * FROM users WHERE id = ?", id)
    if not user:
        return NotFoundError("User not found")
    return user
```

## Exceptions Not for Control Flow

Exceptions must not be used as a control flow mechanism:

| Good | Bad |
|------|-----|
| `result = find_user(id); if isinstance(result, NotFoundError): ...` | `try: user = find_user(id) except NotFoundError: ...` |
| `if err != nil { return err }` | `panic(err)` / `recover()` for expected conditions |
| Return a Result/Either | `throw` / `raise` for business rule violations |

The caller should always check the return value, not wrap calls in try/catch for expected outcomes. An uncaught exception means something broke that shouldn't have — not "the user wasn't found."

# Testing Philosophy

## Functional, Not Technical

Tests must assert **product functional features** — what the user can do — not technical implementation details. A test should verify an outcome the user cares about, not the internal wiring that produced it.

### Valid Test (Functional)

A test for an email client should verify the user can **send an email** and receive a success response:

```typescript
// ✅ Tests the feature the user cares about
it("allows the user to send an email with recipient, subject, body, and optional CC and BCC", async () => {
  const client = new EmailClient(new FakeEmailService());

  const result = await client.send({
    recipient: "user@example.com",
    subject: "Meeting tomorrow",
    body: "Let's sync at 2pm.",
    cc: ["manager@example.com"],
    bcc: ["archive@example.com"],
  });

  expect(result.ok).toBe(true);
  // The user achieved their goal: the email was sent successfully.
});
```

This test asserts the **intent** — the user wanted to send an email, and it worked. The test passes or fails based on whether the feature functions for the user, not based on internal implementation details.

### Invalid Test (Technical)

A test that asserts individual fields were included in the request is testing **implementation**, not behavior:

```typescript
// ❌ Tests internal structure, not user outcome
it("includes recipient, subject, and body in the email", async () => {
  const client = new EmailClient(new FakeEmailService());

  await client.send({
    recipient: "user@example.com",
    subject: "Meeting tomorrow",
    body: "Let's sync at 2pm.",
  });

  // These assertions test how the email was constructed internally.
  // The user doesn't care that fields were "included."
  // The user cares that the email was sent successfully.
  expect(client.lastRequest.recipient).toBe("user@example.com");
  expect(client.lastRequest.subject).toBe("Meeting tomorrow");
  expect(client.lastRequest.body).toBe("Let's sync at 2pm.");
});
```

Asserting that `recipient`, `subject`, and `body` are present tests internal structure. It doesn't test whether the user can send an email. If the implementation changes to use a different internal representation, this test breaks even though the feature still works — the test is coupled to the implementation, not the behavior.

## The BDD Litmus Test

Every test should answer: **"What can the user do?"** — not **"What does the code look like inside?"**

| Test should assert | Test should NOT assert |
|--------------------|------------------------|
| The user received a confirmation | A specific field was populated |
| The order was placed successfully | The order object has 7 properties |
| The user sees their data on the page | The view model contains specific keys |
| The system rejected invalid input with a clear message | The validator called `checkFoo()` before `checkBar()` |
| The user can log in with valid credentials | The auth token is 256 bytes |

If you change the internal implementation and the test still passes because the **user-facing behavior is unchanged**, that's a good test. If you refactor internals and the test breaks even though the feature works, the test is testing the wrong thing.

## Implementation Detail Tests Are Banned

Tests that assert on:
- The order of internal method calls
- The presence of specific fields in intermediate objects
- The exact structure of a database query
- The number of times a collaborator was called
- Private method behavior

...are not allowed. They freeze the implementation in place and make refactoring painful. The only valid assertion is on the **user-visible outcome** of the feature.

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

Untestable code (system calls, hardware interfaces, platform-specific paths) is still covered indirectly through the Fake implementations in integration tests. The Fake exists precisely to make I/O-bound code testable without real external dependencies.

# Related

- [Project Structure](/conventions/project-structure.md) — where things live on disk
- [Configuration Management](/conventions/configuration.md) — how IO clients get their connection strings
- [Dependencies and Libraries](/conventions/dependencies.md) — no DI framework, manual injection
