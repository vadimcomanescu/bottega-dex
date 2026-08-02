---
name: codebase-design
description: Shared vocabulary for designing deep modules. Use when designing or improving a module interface, deciding where a seam belongs, making code easier to test, or when another skill needs the deep-module vocabulary.
---

# Codebase design

Design deep modules: substantial behavior behind a small interface, placed at a clean seam and tested through that interface. Use this language wherever code is designed or restructured so callers gain leverage and maintainers gain locality.

## Glossary

**Module**: anything with an interface and an implementation, from a function to a package or tier-spanning slice. _Avoid_: component, service, unit.

**Interface**: everything a caller must know to use a module correctly, including operations, inputs, outputs, invariants, ordering, failures, configuration, side effects, and relevant performance limits. _Avoid_: API or signature when they name only the type-level surface.

**Implementation**: the code inside a module. Use **adapter** instead when the role at a seam is the subject.

**Depth**: the behavior available per unit of interface a caller or test must learn. A deep module hides substantial behavior behind a small interface. A shallow module exposes an interface nearly as complex as its implementation.

**Seam**: a place where behavior can change without editing callers. Its location is a separate decision from what goes behind it. _Avoid_: boundary when it could mean a bounded context.

**Adapter**: a concrete implementation satisfying an interface at a seam. The term describes its role, not its internal size or technology.

**Leverage**: what callers gain from depth. One implementation supplies more behavior across many call sites and tests.

**Locality**: what maintainers gain from depth. Change, bugs, knowledge, and verification concentrate in one place.

## Principles

- Put behavior with the state and rules it protects. Split modules by what each knows, not by when it runs.
- Draw an interface around the invariant: what must change together stays inside, one entry point guards it, and callers hold only what they need.
- Point dependencies toward the module that owns the domain rule. Adapters translate at the edge and do not redefine the domain.
- Bounded contexts do not share domain types. Translate between them at a seam.
- Hide decisions likely to change, such as a format, vendor, or algorithm, so callers do not change with them.
- Pull complexity downward. A configuration option that makes every caller decide what the module can decide is interface cost.
- Keep domain rules pure where that is their natural shape; let the shell perform I/O.
- Apply the deletion test. If deleting a module removes complexity, it was pass-through work. If the complexity returns to callers, the module earned its place.
- Treat the interface as the test surface. Callers and tests should cross the same seam.
- One adapter is a hypothetical seam; two independent adapters demonstrate real variation. Add a seam only for a present reason.
- Prefer few operations and parameters. A testable interface accepts the dependencies it genuinely owns and returns observable results.

Use [architect](../architect/SKILL.md) for the consequential methods: selecting a test strategy from the dependency category, designing an important interface in multiple ways, controlling dependencies and effects, and writing the run Plan.
