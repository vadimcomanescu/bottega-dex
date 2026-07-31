---
name: spec
description: Synthesize a settled discovery into a durable specification artifact. Internal supporting skill; not user-invocable.
user-invocable: false
---

# Spec

Turn what discovery settled into one implementation-facing specification artifact. This is synthesis, not another design phase: the direction, boundaries, and decisions must already be settled in the conversation, a prototype, repository evidence, or an approved architecture pass.

Before writing, name the fewest, highest seams that the build will test through: places where behavior can change without editing callers. Prefer established seams. Add one only for a present variation, external dependency, deployment boundary, or deterministic test need. If a seam or its test surface is not settled, return to discovery or architecture rather than inventing it in the spec.

## The artifact

Use the repository's documented specification or planning location and format. If it has no convention, create `docs/specs/<slug>.md`; create the directory only when writing the first artifact. Do not open, edit, or comment on an issue or other tracker item unless the user explicitly asks.

Write in the domain's vocabulary and follow the decision records that own the area. Include each of these sections only when it has real content:

1. **Problem.** The user problem in the user's language, before any solution.
2. **Finished behavior.** A concise announcement of what people using the product will observe. Keep approved prototype evidence beside the decision it settled.
3. **User stories.** Numbered stories that cover the distinct user or integrator outcomes.
4. **Implementation decisions.** The owning modules, interfaces, schema or API contracts, and decisions that must outlive the current file layout. Include a prototype-derived state machine, schema, or type shape only when it pins a decision better than prose.
5. **Testing direction.** The externally visible behavior to test, the seams those tests cross, and relevant repository precedent.
6. **Acceptance criteria.** Observable conditions for a correct build. A criterion that can be enforced becomes a build test.
7. **Out of scope.** Deliberate exclusions that keep the boundary clear.

The result lets a builder implement without inventing domain meaning or moving ownership, and lets an independent reviewer determine whether the design survived. It is not a line-by-line implementation script.
