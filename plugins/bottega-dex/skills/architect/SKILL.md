---
name: architect
description: Shared architecture doctrine for defining or checking a Bottega Dex domain model, ownership, interfaces, dependencies, change scope, how the architecture evolves, and the documentation architecture (one home per fact, maps route to it).
---

# Architect

Work out the domain model, the concepts, their states, and the rules, before you design the modules and interfaces that implement it.

## Domain model

- Define the concepts, states, relationships, and invariants that the change depends on. Resolve overloaded or conflicting terms with concrete scenarios and current code.
- Use one term for one concept across the design, glossary, interfaces, implementation, errors, and tests.
- `CONTEXT.md` is the per-context glossary of the ubiquitous language: domain meaning only, never implementation. Update it the moment a term resolves, never as a batch at the end. Add an `_Avoid_` synonym line only for a synonym that caused real ambiguity. `CONTEXT-MAP.md` at the root exists only for a multi-context repo, naming each bounded context and its relationships. `docs/adr/` holds append-only dated decisions, written only when the decision is hard to reverse, surprising without context, and the result of a real trade-off. Outside reading is not an artifact of its own. Put what a source said in the sentence of the decision it changed, and name the source's URL there. A decision that meets the bar then becomes one ADR stating plainly what was decided and why. Commit no research, findings, or reading note as a file. Create each lazily, only when you have something to write.
- Writing any of these files, let an existing file's format win. For a new file or a new entry, follow the vendored format references: [CONTEXT-FORMAT.md](references/CONTEXT-FORMAT.md) and [ADR-FORMAT.md](references/ADR-FORMAT.md).
- Put behavior with the state and rules it protects. Where a file boundary or an existing class conflicts with the model, treat it as information about the current code, never as a reason to keep the model wrong.

## Documentation architecture

- Every normative fact has exactly one authoritative home. `CLAUDE.md` and `AGENTS.md` are maps that route to those homes and never restate their contents. The rule crosses repository boundaries. Where a sibling repository already owns a fact, link that owner's stable home by full URL and restate nothing of it. Delete a second copy you find in the change's scope rather than keeping it in sync.
- A document's path shows its authority: living truth, decisions under `docs/adr/`, open plans, and archive. Living docs never cite archived docs.
- Read the smallest map that routes the task, then only the contexts and ADRs the task touches.
- Changing covered behavior, update the owning living doc in the same change.

## Design the current change

- An interface is everything a caller must know: operations, inputs, outputs, invariants, ordering, failure modes, side effects, configuration, and relevant performance limits. Keep it smaller than the behavior it hides.
- A seam is a place where behavior can change without editing the callers. Where the seam goes is its own decision, separate from what goes behind it. Add a seam only for a present reason such as real variation, external ownership, deployment isolation, or deterministic test control. One adapter satisfying an interface means a hypothetical seam, two mean a real one. A module may keep internal seams for its own tests. Those stay out of the interface.
- Prefer deep, cohesive modules: substantial behavior behind a small interface, with changeable decisions hidden from callers. If removing a wrapper makes complexity disappear instead of returning to callers, the wrapper was not useful. Depth gives you two things: leverage for callers (more behavior per unit of interface a caller or test must learn, one implementation paying back across many call sites and tests) and locality for maintainers (change, bugs, knowledge, and verification concentrating in one place). When you extract pure functions to make them testable but the bugs live in how those functions are called, the tests cover the easy part and the bugs stay untested.
- Keep dependencies pointed toward the code that owns the domain rule. Adapters translate at the edge. They do not redefine the domain.
- Before designing a mechanism, find how the problem is already solved: the platform, the framework, an established dependency, or current best practice. The standard solution is the default. A custom mechanism for a solved problem carries the bugs the standard path already fixed, and it is unfamiliar to every future reader. Building one is a consequential choice that needs a reason a reviewer can inspect.
- Test across a seam by what the dependency is. Pure in-process code needs no adapter. A dependency with a standard local stand-in (an embedded database, an in-memory filesystem) runs the stand-in in tests behind an internal seam. A remote service you own gets a port, with the transport injected as an adapter and an in-memory adapter in tests. A true external service is the one case for a mock adapter. When a deepened interface's tests cover the behavior, delete the superseded tests on the old shallow modules.
- Apply YAGNI to presumptive capabilities and flexibility. Do not use it to avoid refactoring, tests, clear names, validation, security, accessibility, or data safety. Those keep evolutionary design viable.
- A coherent unit is what one run can deliver: one bounded context and primary owner, one architectural rule or interface change, one plan, one integrated review and QA story, one truthful PR title, one safe release and rollback unit. A change that fails this test is more than one unit.
- When a consequential interface has no strong repository precedent or standard solution deciding it, design it twice before committing. Dispatch two or three native Codex subagents. Give each a fresh context, the same brief, and one design pressure, chosen so the drafts come out genuinely different: the smallest possible surface, the shape the most common caller wants, the shape the seam's dependency category suggests, or whatever axis this interface actually varies on. Give each worker distinct ownership and no permission to delegate. Use `fork_turns: "none"` and low reasoning only for narrow read-only scouts, medium reasoning for routine work, and high reasoning for difficult design work. The root task compares the drafts on depth, locality, and seam placement, chooses with a stated reason, and retains all user approvals. The first design is rarely the best, and a doctrine that favors deep modules makes it easy to stop at the first deep-looking one.

## Evolve the architecture

- The architecture is redesigned a little with every change, never preserved as found. When the code you touch no longer matches the model (a rule duplicated, ownership drifted, the required behavior obscured), the change includes moving it back. A structure that no longer fits is never the template for the next addition: every change squeezed into it makes the next change costlier, and that is how a repo rots.
- Look for drift where change concentrates. Weigh the paths the recent history keeps touching, because deepening pays off where the next change will land. The signs of friction: understanding one concept requires reading many small modules, an interface nearly as complex as its implementation, the same rule enforced in two places, behavior that cannot be tested through the interface its callers use.
- Fix the drift your change touches in the same diff, and keep the diff a coherent unit. Drift beyond that scope becomes its own filed improvement, never a widening of this change.

## The plan

Write the shortest plan that fixes what a builder must not decide:

- domain terms, states, and invariants
- which module owns each behavior and piece of state
- the complete interfaces and failure behavior
- allowed dependency, data, and control flow
- trust boundaries and irreversible effects
- what the builder may change freely behind each interface
- the evidence a reviewer can inspect for conformance

The plan is complete when a builder can implement without inventing domain meaning or moving responsibility, and an independent reviewer can tell whether the design survived. It is not a line-by-line implementation script.

## Review questions

- Does the code express the approved domain model, or translate it into primitives and synonyms?
- Is each rule next to the state it protects, with dependencies crossing only the approved interfaces?
- Did the implementation preserve caller-visible behavior, failures, and invariants without adding ambiguous states?
- Is every new abstraction earning its cost for the current requirement?
- Does the change follow the standard solution where one exists, or does it reimplement what the platform or a dependency already provides?
- Do tests cross the same interfaces as callers and survive internal refactoring?
- Would the next change to the same rule be local, or would it require scattered edits?
- Does the change keep every normative fact in its one home, and do the living docs it touches stay true?
