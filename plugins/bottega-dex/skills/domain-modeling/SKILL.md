---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, or when another skill needs to maintain the domain model.
---

# Domain modeling

Actively build and sharpen the project's domain model while designing. Challenge terms, test them with edge cases, and record glossary entries and decisions when they settle. Reading `CONTEXT.md` for vocabulary is a habit any skill has. This skill is for changing the model.

## File structure

Most repos have a single context: `CONTEXT.md` at the root and `docs/adr/` for decisions. When a `CONTEXT-MAP.md` exists at the root, the repo has multiple contexts, and the map points to where each one lives, each with its own `CONTEXT.md` and `docs/adr/`.

Create files lazily, when there is something to write: `CONTEXT.md` when the first term resolves and `docs/adr/` when the first record qualifies. Follow the repository's existing format first. For a new entry use [CONTEXT-FORMAT.md](references/CONTEXT-FORMAT.md) or [ADR-FORMAT.md](references/ADR-FORMAT.md).

## Write boundary

During an active Maestro run, write resolved terms and qualifying ADRs immediately in the isolated run worktree. When domain modeling is invoked on its own, it is read-only until the user explicitly authorizes an isolated delivery change: return the exact proposed glossary and ADR text rather than editing the caller's checkout.

## During the session

**Challenge against the glossary.** When I use a term that conflicts with the existing language in `CONTEXT.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y. Which is it?"

**Sharpen fuzzy language.** When I use vague or overloaded terms, propose a precise canonical term. "You're saying 'account'. Do you mean the Customer or the User? Those are different things."

**Discuss concrete scenarios.** When domain relationships are on the table, stress-test them with specific scenarios that probe edge cases and force me to be precise about the boundaries between concepts.

**Cross-reference with code.** When I state how something works, check whether the code agrees, and surface any contradiction. "Your code cancels entire Orders, but you just said partial cancellation is possible. Which is right?"

**Update `CONTEXT.md` inline.** During an active run, update a term as it resolves instead of batching terms at the end. `CONTEXT.md` is a glossary and nothing else, free of implementation detail. Outside a run, propose the same exact entry without writing it.

**Offer ADRs sparingly.** A record qualifies only when all three hold: the decision is hard to reverse, a future reader would wonder why, and it came from a real trade-off between genuine alternatives. When one is missing, skip the record. During an active run write it when it qualifies; outside a run present the proposed record for explicit authorization.
