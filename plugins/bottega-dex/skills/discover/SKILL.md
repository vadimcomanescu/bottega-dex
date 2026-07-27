---
name: discover
description: Find and settle the unknowns in a Bottega Dex run before orchestration. Used by maestro after start to establish the direction, boundaries, and decisions that guide the work.
---

# Discover

Find what the request does not settle before implementation makes it expensive. Return a clear direction, its boundaries, and each material decision to `maestro`.

## 1. Explore

Read the request, repository instructions, affected code, tests, history, product precedent, and installed dependency versions. Use narrow native read-only subagents only for independent exploration that benefits from separate context. Give each one a distinct question, `fork_turns: "none"`, no write ownership, and no permission to delegate. A scout returns evidence and uncertainty, never a decision.

Verify current provider behavior against the applicable installed version and official documentation before relying on it. Complete when repository and source evidence have answered everything they can and the remaining unknowns are explicit.

## 2. Find blind spots

Check for missing constraints, affected callers, data and permission boundaries, compatibility expectations, migration needs, user-visible states, failure behavior, and proof the repository will require. Explain any material blind spot to the user in plain language.

## 3. Settle the direction

When more than one viable direction remains, present the smallest useful options and recommend one. Prototype only when the choice depends on seeing or driving behavior. Ask one consequential question at a time, with the recommended answer, until the work's direction and boundaries are predictable.

When the user cannot describe a desired behavior, ask for an existing product or source example and inspect it directly. A pointer is evidence and travels with the settled findings.

## 4. Hand off to orchestration

Return directly to `maestro`:

- the intended outcome;
- what is in and out;
- repository and external precedents that constrain the work;
- each decision and its reason;
- acceptance signals and known limits;
- any unresolved blocker that prevents implementation.

An autonomous run resolves user-answerable questions from repository precedent and the standard provider pattern, recording each assumption and reason. If a material choice cannot be resolved safely, stop for the user instead of hiding it in implementation.
