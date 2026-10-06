---
type: Convention
title: Code Structure and Patterns
description: How I structure code — I/O interfaces with Fakes under tests/, manual constructor injection, no implicit fallbacks, type discipline, immutability, Result types, no null, no getters or setters, Elegant Objects class limits, functional BDD testing, size limits, and middleware/route/service/I/O separation with middleware-owned responses and helper-free route files.
tags: [conventions, code-structure, patterns, dependency-injection, interfaces, testing, types, immutability, error-handling, result-type, bdd, functional-testing, no-fallbacks, routes, middleware, rest, elegant-objects, no-null, no-getters, object-design]
timestamp: 2026-10-05T00:00:00Z
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
  findById(id: UserId): Promise<Result<User, UserNotFound>>;
  save(user: User): Promise<Result<void, UserSaveFailed>>;
}

class PostgresUserRepository implements UserRepository {
  // Real Postgres queries
}

class FakeUserRepository implements UserRepository {
  // In-memory Map, returns test data
}
```

The Fake is not a mock. Mocking frameworks (Jest mocks, Mockito, unittest.mock, testify/mock, etc.) are **not allowed**. They hide behavior behind auto-generated proxies, make tests brittle by coupling to implementation details, and encourage testing that passes without verifying real behavior.

## Purpose of the Interface and Fake

The interface is an abstraction layer between application code and a real boundary such as a filesystem, database, device, or external API. Application code depends on the project-owned interface, not on the boundary's SDK, wire format, driver, or vendor contract.

This provides two benefits:

1. **Boundary changes stay in one place.** When the real boundary changes its contract, SDK, authentication scheme, serialization format, or protocol, update the production implementation that translates between that boundary and the stable project-owned interface. The services and routes that consume the interface do not change unless the application's own required behavior changes.
2. **Tests use explicit behavior instead of generated mocks.** A hand-written Fake provides a reusable, inspectable implementation of the same interface. This removes the need to configure mock return values and interaction expectations separately in each test. Mock expectations can merely repeat the current implementation and still produce false positives when important behavior is omitted or incorrectly wired. Tests using Fakes must instead assert the returned values, resulting Fake state, recorded boundary operations, and other promised effects.

A Fake does **not** emulate or verify the real boundary. It deliberately avoids the filesystem, database, device, network, or vendor API. Tests using a Fake prove how consumer code behaves against the project-owned interface; they do not prove that the production implementation authenticates, serializes, queries, handles permissions, or follows the real protocol correctly. Neither Fakes nor mocks guarantee correctness. The production implementation requires separate contract or integration tests when its behavior against the real boundary must be verified.

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
  private readonly users: Map<UserId, User>;
  constructor(seed: ReadonlyMap<UserId, User>) { this.users = new Map(seed); }
  async findById(id: UserId): Promise<Result<User, UserNotFound>> {
    const user = this.users.get(id);
    return user === undefined ? Err(new UserNotFound(id)) : Ok(user);
  }
  async save(user: User): Promise<Result<void, UserSaveFailed>> {
    this.users.set(user.id(), user);
    return Ok(undefined);
  }
  saved(): ReadonlyArray<User> { return [...this.users.values()]; }
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

## No DI Framework

Dependency injection is done by hand. Do not add a DI container, injector, or service locator — that rules out Spring's `@Autowired`, NestJS's `@Injectable()` graph, Angular's injector, Guice, Dagger, `tsyringe`, `inversify`, `dependency-injector`, `wire`, `fx`, and their equivalents. Manual constructor injection is sufficient and keeps the dependency graph explicit and grep-able.

Every project has exactly one place where production objects are wired together: the composition root (`main`, the application bootstrap, or a single `src/app.ts`-style file). That file is the only place that calls `new` on production classes outside of secondary constructors. Everything else receives its collaborators as constructor arguments.

| Good | Bad |
|------|-----|
| `new OrderService(new PostgresOrderRepo(pool))` in `main` | `@Injectable() class OrderService` resolved by a container |
| Tests build the graph by hand with Fakes | `container.resolve(OrderService)` in a test |
| A 40-line composition root that reads top to bottom | Decorators and module metadata scattered across files |

Framework-mandated decorators on route classes (for example, a router's `@Get()` annotation) are acceptable because they describe HTTP wiring, not dependency resolution. The dependencies of that route class are still passed through its constructor by the composition root.

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
| **Fields per class** | Four or fewer | More encapsulated state means the class has more than one reason to change. Split it, or compose smaller objects. (Elegant Objects 2.1) |
| **Public methods per class** | Fewer than five | A small public surface keeps a class focused and keeps its Fake small. Convenience methods go in a "smart" decorator, not the core class. (Elegant Objects 3.1) |
| **Methods per interface** | Five or fewer | A short interface is easy to implement, easy to Fake, and hard to misuse. Split a wide interface by the role each consumer needs. (Elegant Objects 2.9) |

The field and method caps are per class, not per file. A class that cannot fit within them is doing several jobs; extract a collaborator and inject it through the constructor. Do not evade the caps by packing several values into a single bag field or by exposing one method that takes a mode flag.

# Route Discipline

Routes and endpoints in `src/routes/` have **one job**: call services in `src/services/`. They never perform I/O directly. Everything HTTP-shaped around the route lives in `src/middleware/`. Route classes use object names such as `HttpRoute` or `OrderEndpoint`, never `Handler` or `Controller`.

```
Request → Middleware → Route → Service → Client (I/O interface) → External World
```

| Good (route) | Bad (route) |
|--------------|-------------|
| `orderService.placeOrder(req.body)` | `fetch("https://api.example.com/...")` |
| `userService.getById(req.params.id)` | `db.query("SELECT * FROM users WHERE...")` |

The route turns an already-parsed request into a single service call and returns the service's `Result`. Middleware owns the HTTP concerns around it: parsing and validating input on the way in, mapping the `Result` to a status code and payload on the way out. The service handles business logic. The client (behind an interface) handles I/O.

## No try/catch as a Response Path

A route must not contain `try`/`catch` (or `except`, `recover`) blocks that decide which HTTP response to send. That is exception-driven control flow, which this convention already forbids for services, and it bloats every route with the same boilerplate. Two rules follow:

1. **Services return `Result` values.** The route returns that `Result` as-is. It never catches a domain error and never branches on the tag to pick a status code.
2. **Middleware owns the unexpected.** A single error middleware, registered once at the application edge, converts anything that actually throws (a bug, a dropped connection, an exhausted pool) into the standard 500 payload and logs it. Routes do not duplicate that job.

```typescript
// Bad — try/catch chooses the response
class OrderEndpoint {
  constructor(private readonly orders: OrderService) {}

  async post(req: Request, res: Response): Promise<void> {
    try {
      const order = await this.orders.placeOrder(req.body);
      res.status(201).json(order);
    } catch (e) {
      if (e instanceof ValidationError) { res.status(400).json({ error: e.message }); return; }
      if (e instanceof NotFoundError)   { res.status(404).json({ error: e.message }); return; }
      res.status(500).json({ error: "internal" });
    }
  }
}
```

```typescript
// Good — service returns Result; middleware renders it
class OrderEndpoint {
  constructor(private readonly orders: OrderService) {}

  async post(req: Request): Promise<Result<Order, OrderError>> {
    return this.orders.placeOrder(req.body);
  }
}
```

The `Result` → HTTP mapping (`ValidationError` → 400, `NotFoundError` → 404, `Ok` → 200/201) lives in **one** response middleware, not in each route. Adding a new error kind means editing the mapping once. The route body shrinks to the service call and, at most, the request-to-input translation.

## Services Never Return HTTP Status Codes

A service knows nothing about HTTP. It must not return, embed, or accept a status code, and its signatures must not mention HTTP at all:

| Prohibited in `src/services/` | Instead |
|-------------------------------|---------|
| `return { status: 404, body: ... }` | `return Err(new OrderNotFound(id))` |
| `Result<Order, { code: 400 }>` | `Result<Order, OrderError>` with domain-named error kinds |
| `placeOrder(req: Request): Response` | `placeOrder(input: OrderInput): Result<Order, OrderError>` |
| An error class carrying `httpStatus` | An error class carrying the domain fact that failed |

```typescript
// Bad — the service has picked a status code
class OrderService {
  async placeOrder(input: OrderInput): Promise<Result<Order, { status: number; message: string }>> {
    const stock = await this.inventory.reserve(input.sku, input.quantity);
    if (!stock.ok) return Err({ status: 409, message: "out of stock" });
    return Ok(await this.orders.save(input));
  }
}
```

```typescript
// Good — the service returns a domain error; middleware decides the status
type OrderError =
  | { kind: "OutOfStock"; sku: Sku }
  | { kind: "PaymentDeclined"; reason: DeclineReason };

class OrderService {
  async placeOrder(input: OrderInput): Promise<Result<Order, OrderError>> {
    const stock = await this.inventory.reserve(input.sku, input.quantity);
    if (!stock.ok) return Err({ kind: "OutOfStock", sku: input.sku });
    return Ok(await this.orders.save(input));
  }
}
```

Two reasons. First, the same service is called from places where a status code is meaningless — a CLI command, a queue consumer, a scheduled job, another service, a test. `409` tells those callers nothing; `OutOfStock` tells them what happened. Second, a status code chosen inside a service is a second copy of the `Result` → HTTP mapping, so the mapping is no longer in one place, and changing `OutOfStock` from `409` to `422` means auditing every service instead of editing one middleware.

The same rule applies in reverse: a service accepts domain input types, never the framework's request object, and never sets headers, cookies, or response bodies. Everything HTTP-shaped enters and leaves through `src/routes/` and its middleware.

## Middleware Handles Cross-Cutting Concerns

Anything that applies to more than one route belongs in middleware, never in the route body:

| Concern | Where it lives | Not in the route |
|---------|----------------|------------------|
| Auth / session lookup | auth middleware | `if (!req.headers.authorization) ...` |
| Request body validation and parsing | validation middleware or a typed schema | manual field-by-field checks |
| `Result` → status code + payload | response middleware | `res.status(...)` branching |
| Thrown exceptions → 500 | error middleware | `try/catch` |
| Logging, tracing, request IDs | logging middleware | `logger.info(...)` calls |
| Rate limiting, CORS, compression | dedicated middleware | anything |

Middleware lives in `src/middleware/`, one class per file (see [Project Structure](/conventions/project-structure.md)). It is still code and follows every other rule here: it is a class with constructor-injected dependencies, it implements an interface, it has a Fake under `tests/` where it does I/O, and it is tested through its public contract.

## Route Files Contain Only Routes

A file under `src/routes/` contains **route classes and nothing else**. No private helper functions, no module-level utilities, no inline data shaping, no formatters, no constants beyond the route's own path.

| Belongs in a route file | Does not belong — move it |
|-------------------------|---------------------------|
| The route class | A `toDto(order)` helper → `src/services/` |
| Its constructor with injected services | A `parseDateRange(query)` function → `src/services/` |
| One method per HTTP verb it serves | Any `fetch`, SDK, or DB call → `src/clients/` |
| | A `buildPaginationLinks(...)` function → `src/services/` |
| | Retry, caching, or backoff logic → `src/clients/` |

The test for whether something belongs: **if you deleted the framework, would this code still be needed?** If yes, it is business logic or I/O and lives in `src/services/` or `src/clients/`. If no, it is an HTTP concern and lives in middleware. Either way, it is not in the route file.

```typescript
// Bad — helper living beside the route
function toSummary(order: Order): OrderSummary { /* ... */ }

class OrderEndpoint {
  constructor(private readonly orders: OrderService) {}
  async get(req: Request): Promise<Result<OrderSummary, OrderError>> {
    const result = await this.orders.findById(req.params.id);
    return result.ok ? Ok(toSummary(result.value)) : result;
  }
}
```

```typescript
// Good — the service returns the shape the route needs
class OrderEndpoint {
  constructor(private readonly orders: OrderService) {}
  async get(req: Request): Promise<Result<OrderSummary, OrderError>> {
    return this.orders.summaryById(req.params.id);
  }
}
```

A route class that needs a helper is a signal the service's interface is wrong, not a reason to add a private function. Fix the service.

## Why This Matters

Routes are the layer most likely to sprawl because every new requirement seems to "just need a small check here." Keeping them to a single service call with no branching, no helpers, and no exception handling means:

- a route is read in seconds and rarely needs its own tests beyond wiring;
- a bug in a response mapping is fixed in one middleware, not in forty routes;
- services stay fully testable with Fakes because HTTP never leaks into them;
- the route file's size stays flat as the API grows.

# Request Flow

```
Middleware
  │ authenticates, validates and parses input
  ▼
Route
  │ calls exactly one service method
  ▼
Service
  │ orchestrates business logic
  │ calls clients through their interfaces
  ▼
Client (ProductionIoClient or FakeIoClient)
  │ performs actual or fake I/O
  ▼
Returns through the chain back to the route as a Result
  │ response middleware maps Result → status code and payload
  │ error middleware maps anything thrown → 500
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

This is a rule, not a preference. Every argument of a public method on a service, client, or route is a typed object, never a bare `string`, `number`, `int`, `bool`, or `float`. The wrapper is where the validation lives: an `EmailAddress` is constructed once at the edge (middleware or the composition root), it rejects malformed input there, and every function downstream can trust it without re-checking. Call sites get longer, and that is accepted: combined with [no default arguments](/conventions/configuration.md#function-arguments-never-have-defaults) and the 30-line function limit, long call sites are a signal to introduce a record type that groups the values that travel together, not a reason to fall back to primitives.

| Primitive | Wrap as |
|-----------|---------|
| `string` holding an identifier | `CustomerId`, `OrderId`, `Sku` |
| `string` holding an address or URL | `EmailAddress`, `HttpUrl`, `FilePath` |
| `number` or `int` with a unit | `Port`, `UsdAmount`, `Milliseconds`, `ByteCount` |
| `boolean` as a mode switch | A tagged union or enum naming each mode (see [Choosing Data Structures](/conventions/data-structures.md)) |

The exceptions are the inside of the wrapper itself, the single mapping layer that converts to and from a wire or storage format, and loop indices or arithmetic that never cross a function boundary.

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

This applies in every language, including the ones whose idioms push the other way:

| Language | Do | Don't |
|----------|----|-------|
| TypeScript | `readonly` fields, spread into a new object, `ReadonlyArray<T>` | `order.items.push(item)`, reassigning a parameter's fields |
| Python | `@dataclass(frozen=True)`, `dataclasses.replace(...)`, return a new tuple | `order.items.append(item)`, `list.sort()` on an argument, mutating a passed dict |
| Go | Value receivers that return a new value, `func (o Order) WithItem(i Item) Order` | Pointer receivers that mutate, `func AddItem(o *Order, i Item)` |

The one place a pointer receiver or in-place mutation is acceptable in Go is the internals of a production I/O client that must satisfy a standard-library interface (`io.Writer`, `sql.Scanner`, `http.Handler`) that is defined with a pointer or mutating contract. Even then, the mutation does not escape that type's own fields.

# No Static Classes or Properties

Static members couple callers to a global, making testing and refactoring hard. Every dependency must be an instance passed through a constructor:

| Good | Bad |
|------|-----|
| `new OrderService(new StripeClient(config))` | `StripeClient.charge(amount)` |
| Instance method on an injected dependency | Static method on a class |
| Instance property on an injected dependency | `Config.STATIC_FIELD` |

If the language absolutely requires a static entry point (e.g., a `main` function), that's the only exception. Everything else is an instance.

# Object Design

These rules come from [Elegant Objects](/references/elegant-objects.md) and apply to every class in `src/`. Where a rule conflicts with a framework idiom, the rule wins; pick a thinner framework or confine the idiom to the single production adapter that talks to it.

## Never Accept or Return Null

No function accepts `null`, `undefined`, `None`, or `nil` as an argument, and no function returns one (Elegant Objects 3.3 and 4.1). A null is a hidden, undocumented mode of operation that every caller has to remember to check.

| Situation | Instead of null |
|-----------|-----------------|
| Lookup that may find nothing | `Result<User, UserNotFound>` |
| Optional input | A tagged union with an explicit absent case, or a separate method without that parameter |
| "No value yet" | A null object (`NoCustomer`, `EmptyCart`) that implements the same interface |
| Empty list of things | An empty collection, never null |

```typescript
// Bad — null leaks across a boundary
findById(id: CustomerId): Customer | null

// Good — the absence is a named outcome
findById(id: CustomerId): Result<Customer, CustomerNotFound>
```

Language specifics:

- **TypeScript:** `strictNullChecks` is on. `null` and `undefined` never appear in a public signature in `src/`. Optional parameters (`?`) are prohibited, which also follows from [no default arguments](/conventions/configuration.md#function-arguments-never-have-defaults).
- **Python:** `Optional[T]` and `T | None` never appear in a public signature in `src/`. Return a `Result` or a null object.
- **Go:** Never return a nil pointer or nil interface as a "not found" signal; return `(T, error)` with a domain error. Nil slices and maps are initialised before they are returned.

The one exception is the single production adapter that talks to a library which itself returns null; it translates the null into a `Result` or null object before anything else sees it.

## No Getters or Setters

Objects expose behavior, not their internals (Elegant Objects 3.5). A class in `src/services/`, `src/clients/`, `src/routes/`, or `src/middleware/` has no `getX()`/`setX()` pairs, no public fields, no `@property` that merely returns a field, and no builder-style mutators.

| Bad | Good |
|-----|------|
| `order.getTotal()` then compute tax in the caller | `order.taxed(rate)` returns a new `Order` |
| `user.setEmail(e)` | `user.withEmail(e)` returns a new `User` |
| `report.getData()` then format it elsewhere | `report.asPdf()` / `report.asMarkdown()` |

Ask the object to do the work, or ask it to render itself into the shape the caller needs (a DTO, a wire payload, a database row). The object decides what to reveal; the caller does not reach in.

**Boundary with `src/models/`.** The [`src/models/`](/conventions/project-structure.md) directory holds immutable data records: TypeScript `type`/`interface` declarations, frozen Python dataclasses, Go structs, and the schema types that ORMs, validators, and serializers require. Those records are *data*, not objects: they have public, read-only fields and no behavior beyond construction and equality. The no-getters rule governs *objects*, the classes outside `src/models/` that encapsulate a record and act on it. An object may accept a record in its constructor and may return one from a rendering method such as `asRow()` or `asDto()`; it never exposes a getter for the record it holds. ORM entity classes with generated accessors live only inside the production adapter in `src/clients/` and never cross its interface.

## Final or Abstract, Never Both

Every class is either `final` (cannot be extended) or `abstract` (cannot be instantiated). Nothing in between (Elegant Objects 4.3). Behavior is shared by composition and decoration, not by overriding a concrete parent.

- **TypeScript / Python:** Treat every class as final by convention. Do not `extends` or subclass a concrete class in `src/`. A Fake implements the interface; it does not subclass the production class.
- **Go:** Struct embedding of a concrete type to inherit methods is prohibited for the same reason. Embed interfaces or compose explicitly.
- **Java / Kotlin:** Mark classes `final` and abstract classes `abstract`.

## Constructors Contain No Logic

A constructor only assigns its arguments to fields (Elegant Objects 1.3). No parsing, no validation beyond rejecting an obviously impossible argument, no I/O, no computation, no `new`. Work happens lazily in methods, when the object is used. A constructor that needs to compute something should take the computed value as an argument instead and let a secondary constructor or the composition root supply it.

```typescript
// Bad — constructor does work
constructor(url: string) { this.parsed = new URL(url); this.client = new HttpClient(this.parsed); }

// Good — constructor stores; collaborators are injected
constructor(private readonly endpoint: HttpUrl, private readonly http: HttpClient) {}
```

When a class has several constructors, exactly one is primary and assigns every field; the others delegate to it (Elegant Objects 1.2). In languages without constructor overloading (TypeScript, Python, Go), use named factory functions that return a new instance and do nothing else.

## No `new` Outside Secondary Constructors

Production classes do not instantiate their own collaborators (Elegant Objects 3.6). The `new` keyword, Python class calls that construct a collaborator, and Go `&Foo{}` of a dependency appear in exactly three places:

1. the composition root that wires the application;
2. a secondary constructor or named factory that supplies a default collaborator to the primary constructor; and
3. value objects, records, and `Result` wrappers, which are data and may be created anywhere.

If a method needs a fresh collaborator per call, inject a factory object through the constructor and ask it for one.

## No Public Constants

No `public static final`, exported `const` bags, or module-level constant tables that are shared across classes (Elegant Objects 2.5). A shared constant is a hidden coupling: every user depends on its value and its meaning, and neither is encapsulated.

| Bad | Good |
|-----|------|
| `export const DEFAULT_TIMEOUT_MS = 30000` imported in five files | A `Timeout` value object constructed once in the composition root and injected |
| `Headers.CONTENT_TYPE_JSON` | A `JsonBody` object that knows how to write its own headers |
| `MAX_RETRIES = 3` consulted in a loop | A `RetryPolicy` object that owns the loop |

Private constants inside a single class are fine; a route's own path string is fine. Configuration values arrive through the constructor from the configuration layer described in [Configuration Management](/conventions/configuration.md), never from a constants module.

## No Type Introspection or Casting

No `instanceof`, `isinstance`, type switches, reflection, or downcasts in `src/` (Elegant Objects 3.7). If code needs to know the concrete type behind an interface, the interface is missing a method; add the method and let polymorphism do the branching.

The caller of a `Result` inspects the explicit `ok`/`kind` tag, not the error's class. Tagged unions are discriminated on their tag field, never on the runtime type of a payload.

The two permitted exceptions are the single error middleware at the application edge, which may inspect a thrown value to log it before returning a 500, and the production adapter that decodes an untyped wire or storage payload into a typed record, where a narrowing check is the decoding.

## Every Public Method Implements an Interface

Every class whose public methods are called by another class in `src/` implements an interface declaring those methods (Elegant Objects 2.3). This extends the [I/O Interface Pattern](#io-interface-pattern) from clients to services and middleware:

| Class | Interface required | Fake required |
|-------|--------------------|---------------|
| Client (performs I/O) | Yes | Yes, under `tests/` |
| Middleware that performs I/O (auth lookup, rate-limit store) | Yes | Yes, under `tests/` |
| Middleware with no I/O (response mapping, parsing) | Yes | No, tested directly |
| Service | Yes | Optional; write a Fake only when a consumer test genuinely needs one |
| Route | Yes, when the framework allows it | No |
| Value object or record | No | No |

Services are injected into routes by interface so a route test can be wired with a Fake service if needed and so the dependency graph reads as contracts, not concrete classes.

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

Error values are named after the domain fact that failed (`OutOfStock`, `PaymentDeclined`), never after a transport outcome (`Conflict`, `BadRequest`, `status: 400`). See [Services Never Return HTTP Status Codes](#services-never-return-http-status-codes).

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

There is [no CI pipeline](/deployment/ci-cd.md), so the coverage gate runs locally: `make test` runs the suite with coverage and fails below 80%, and it is run before every push. A PR that drops coverage below 80% must either add tests or explicitly justify why the uncovered code cannot be meaningfully tested.

Fakes make consumer behavior testable without real external dependencies, but they do not cover production adapters. System calls, hardware interfaces, platform-specific paths, and third-party protocols require focused integration or contract tests in an appropriate environment. If such a test cannot run in the normal suite, document where and how it runs rather than claiming Fake coverage as a substitute.

# Related

- [Project Structure](/conventions/project-structure.md) — where things live on disk
- [Configuration Management](/conventions/configuration.md) — how IO clients get their connection strings
- [Dependencies and Libraries](/conventions/dependencies.md) — no DI framework, manual injection
- [Code Hygiene](/conventions/code-hygiene.md) — linting, formatting, logging, comments, migrations, API versioning, frontend state and styling
- [Elegant Objects](/references/elegant-objects.md) — source of the Object Design rules above
