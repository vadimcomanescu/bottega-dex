---
name: prototype
description: Build a throwaway prototype to answer a design question. Use when the user wants to sanity-check whether a state model or logic feels right, or explore what a UI should look like.
---

# Prototype

A prototype is **throwaway code that answers a question**. The question decides the shape.

## Pick a branch

Identify which question is being answered from the user's prompt, the surrounding code, or by asking:

- **"Does this logic or state model feel right?"** → [LOGIC.md](LOGIC.md). Build a tiny interactive terminal app that pushes the state model through cases that are hard to reason about on paper.
- **"What should this look like?"** → [UI.md](UI.md). Generate several radically different UI variations on a single route, switchable through a URL search parameter and a floating bottom bar.

The two branches produce different artifacts. If the question is genuinely ambiguous and the user is unavailable, default to the shape that matches the surrounding code and state that assumption at the top of the prototype.

## Rules that apply to both

1. **Throwaway from day one, and clearly marked as such.** Place the prototype next to the code or page it explores, using the project's routing convention. Name it so it cannot be mistaken for production code.
2. **One command to run.** Use the existing task runner or runtime. The user should not have to remember a path or install a new tool.
3. **No persistence by default.** Keep state in memory. When persistence is the question, use an explicitly disposable scratch store.
4. **Skip the polish.** No tests, production-grade error handling, or abstractions beyond what is required to run and answer the question.
5. **Surface the state.** After every logic action or UI variant switch, render the relevant state so the user can see what changed.
6. **Capture the answer when done.** Fold a validated decision into its specification or decision record. Record the question, verdict, and prototype location there. Remove the throwaway code when it is no longer needed, unless the repository has an agreed experiment archive or the user asks to preserve it.
