---
name: spec
description: Synthesize a settled discovery into a durable specification artifact. Internal supporting skill; not user-invocable.
user-invocable: false
---

# Spec

Turn what discovery settled into one implementation-facing specification artifact. This is synthesis, not another design phase: the direction, boundaries, and decisions must already be settled in the conversation, a prototype, repository evidence, or an approved architecture pass.

Before writing, name the fewest, highest seams that the build will test through: places where behavior can change without editing callers. Prefer established seams. Add one only for a present variation, external dependency, deployment boundary, or deterministic test need. If a seam or its test surface is not settled, return to discovery or architecture rather than inventing it in the spec. Keep the Plan separate from the spec: the later Plan owns module responsibility, builder non-decisions, and vertical slices; do not make the spec a second copy of that artifact.

## The artifact

Use the repository's documented specification location and format. If it has no convention, keep the artifact in isolated run state or the conversation unless the repository authorizes `docs/specs/<slug>.md`; create that directory only when writing the first repository-owned artifact. Do not open, edit, or comment on an issue or other tracker item unless the user explicitly asks.

Write in the domain's vocabulary and follow the decision records that own the area. Include each of these sections only when it has real content:

1. **Problem.** The user problem in the user's language, before any solution.
2. **How We Measure Success.** Product signals after delivery, only when the work has meaningful outcome measures beyond a correct build. Keep these distinct from acceptance criteria.
3. **Finished behavior.** A concise announcement of what people using the product will observe. Keep approved prototype evidence beside the decision it settled.
4. **User stories.** Numbered stories that cover the distinct user or integrator outcomes.
5. **Implementation decisions.** Stable schema or API contracts and decisions that must outlive the current file layout. Include a prototype-derived state machine, schema, or type shape only when it pins a decision better than prose. Leave slice ownership and builder freedom to the Plan.
6. **Testing direction.** The externally visible behavior to test, the seams those tests cross, and relevant repository precedent.
7. **Acceptance criteria.** Observable conditions for a correct build. A criterion that can be enforced becomes a build test.
8. **Out of scope.** Deliberate exclusions that keep the boundary clear.
9. **Further Notes.** Context that materially helps the build or review and belongs nowhere above. Omit this section when it would be empty or repeat another section.

The result pins the promised behavior without becoming a line-by-line implementation script. The Plan then assigns ownership and slices without changing that promise.
