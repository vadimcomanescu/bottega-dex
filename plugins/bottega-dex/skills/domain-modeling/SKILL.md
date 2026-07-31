---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, or when another skill needs to maintain the domain model.
---

# Domain modeling

Actively build and sharpen the project's domain model as we design: challenge terms, invent edge-case scenarios, and write the glossary and decisions down the moment they settle. Reading `CONTEXT.md` for vocabulary is a habit any skill has. This skill is for changing the model.

## File structure

Most repos have a single context: `CONTEXT.md` at the root and `docs/adr/` for decisions. When a `CONTEXT-MAP.md` exists at the root, the repo has multiple contexts, and the map points to where each one lives, each with its own `CONTEXT.md` and `docs/adr/`.

Create files lazily, when you have something to write: `CONTEXT.md` when the first term resolves, `docs/adr/` when the first record is needed.

## During the session

**Challenge against the glossary.** When I use a term that conflicts with the existing language in `CONTEXT.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y. Which is it?"

**Sharpen fuzzy language.** When I use vague or overloaded terms, propose a precise canonical term. "You're saying 'account'. Do you mean the Customer or the User? Those are different things."

**Discuss concrete scenarios.** When domain relationships are on the table, stress-test them with specific scenarios that probe edge cases and force me to be precise about the boundaries between concepts.

**Cross-reference with code.** When I state how something works, check whether the code agrees, and surface any contradiction. "Your code cancels entire Orders, but you just said partial cancellation is possible. Which is right?"

**Update `CONTEXT.md` inline.** When a term resolves, update `CONTEXT.md` right there, as it happens. `CONTEXT.md` is a glossary and nothing else, free of implementation detail. Use [CONTEXT-FORMAT.md](references/CONTEXT-FORMAT.md).

**Offer ADRs sparingly.** Offer a record only when all three hold: the decision is hard to reverse, a future reader would wonder why, and it came from a real trade-off between genuine alternatives. When one is missing, skip the record. Use [ADR-FORMAT.md](references/ADR-FORMAT.md).
