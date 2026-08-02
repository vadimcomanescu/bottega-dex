---
name: architect
description: Consequential architecture methods for ownership, interfaces, dependencies, test strategy, effects, and documentation authority. Contributes settled design to the run Plan when architecture is needed.
---

# Architect

Use [codebase-design](../codebase-design/SKILL.md) for the shared vocabulary and deep-module principles. This skill owns the methods for consequential design decisions. Maestro and the root task own the Plan and use this skill's output when its condition holds.

Work out the domain model, its states and rules before designing the modules and interfaces that implement it. Resolve domain language through [domain-modeling](../domain-modeling/SKILL.md). Put behavior with the state it protects, point dependencies toward the owner of the domain rule, and treat a conflicting file or class boundary as evidence about the current code rather than a reason to preserve the wrong model.

## Documentation and domain authority

- `CONTEXT.md` is the glossary of domain meaning, never a specification or implementation map. During an active run, update a term when it resolves. Use an `_Avoid_` line only when a synonym caused real ambiguity.
- `CONTEXT-MAP.md` exists only for a multi-context repository and routes to each context. `docs/adr/` holds decisions only when they are hard to reverse, surprising without context, and the result of a real trade-off.
- Existing repository formats win. For a new entry use [CONTEXT-FORMAT.md](../domain-modeling/references/CONTEXT-FORMAT.md) and [ADR-FORMAT.md](../domain-modeling/references/ADR-FORMAT.md).
- Every normative fact has one authoritative home. Agent files are maps that route to those homes rather than duplicate them. Update the owning living document in the same change as the behavior it describes.
- Outside reading is evidence, not a committed findings artifact. Put the source URL in the decision sentence it changed.

## Design the consequential interfaces

Before inventing a mechanism, inspect the platform, framework, established dependency, and current repository precedent. The standard solution is the default; a custom path needs a concrete reason a reviewer can inspect.

Classify a dependency before deciding how its seam is tested:

- Pure in-process behavior needs no adapter.
- A dependency with a standard local stand-in, such as an embedded database or in-memory filesystem, uses that stand-in behind an internal seam.
- A remote service the project owns gets a port, an injected transport adapter, and an in-memory adapter for tests.
- A truly external service gets a mock adapter at that external boundary.

When a consequential interface has no strong repository precedent or standard solution and reversal would be costly, design it more than once. Dispatch two or three independent native Codex readers with the same brief and different pressures, such as the smallest surface, the most common caller, or the dependency category. They do not delegate. The root task compares depth, locality, seam placement, failure behavior, and testability, chooses with a stated reason, and retains every user approval. Use [panel](../panel/SKILL.md) instead when the decision meets its three conditions.

Keep trust boundaries and irreversible effects explicit. State allowed dependency, data, and control flow. A new check, gate, or validator carries one threat-model sentence naming what input or actor class it covers and what it deliberately excludes.

## Evolve the architecture

Fix architectural drift the change touches when that keeps the diff one coherent unit: one bounded context and primary owner, one architectural rule or interface change, one Plan, one integrated review and QA story, one truthful pull-request title, and one safe release and rollback unit. Drift outside that unit becomes a separate improvement.

Look for friction where change concentrates: one concept spread across many modules, an interface nearly as complex as its implementation, duplicated rules, behavior that cannot be tested through the caller's interface, or documentation that has drifted from its authority.

## Contribute to the Plan

Return the consequential decisions Maestro must put in the Plan before builders start. Architect does not run merely because every run needs a Plan; trivial or already-settled work skips this skill and Maestro writes the shortest sufficient Plan. Use the repository's authorized planning location. When no repository location is authorized, keep the Plan in the isolated run state or the conversation. Never create, edit, or comment on a tracker item merely to publish the Plan.

Keep the Plan separate from the specification or verbatim request. The specification says what behavior is promised; the Plan says how responsibility is divided. Include:

- what builders must not decide: domain meaning, ownership, invariants, and consequential interfaces;
- the complete interfaces and failure behavior;
- allowed dependency, data, and control flow;
- trust boundaries, irreversible effects, and any threat-model sentence;
- the named test interfaces, meaning the fewest and highest interfaces the tests cross;
- vertical slices, each a complete path through the layers it needs, with exact file ownership and dependencies;
- what each builder may change freely behind its interface; and
- evidence an independent reviewer can inspect for conformance.

The Plan is complete when builders can implement without inventing domain meaning or moving responsibility, and an independent reviewer can determine whether the design survived. It is not a line-by-line implementation script.

## Review questions

- Does the code express the approved domain model using its canonical terms?
- Is each rule next to the state it protects, with dependencies crossing only approved interfaces?
- Did the implementation preserve caller-visible behavior, failures, and invariants without adding ambiguous states?
- Is each abstraction earning its interface cost for the current requirement?
- Does the change use the standard solution where one exists?
- Do tests cross the named interfaces and survive internal refactoring?
- Would the next change to the same rule remain local?
- Does every normative fact remain in its one authoritative home?
