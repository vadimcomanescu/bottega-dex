---
name: codebase-design
description: Internal Bottega Dex design vocabulary and deep-module rules.
---

# Codebase design

## Vocabulary

- **Module:** Anything with an interface and an implementation, at any scale.
- **Interface:** Everything a caller must know: signature, invariants, ordering, error modes, required configuration, and performance traits.
- **Depth:** Behavior per unit of interface a caller must learn. A deep module hides substantial behavior behind a small interface.
- **Seam:** A place behavior can change without editing in place, where a module's interface lives.
- **Adapter:** A concrete implementation satisfying an interface at a seam.

## Principles

- Design deep modules. Ask whether methods, parameters, and caller knowledge can shrink while more complexity stays hidden.
- Run the deletion test. If deleting a module makes complexity disappear, it hid nothing and should be inlined. If the complexity spreads across callers, the module earns its place.
- One adapter is a hypothetical seam. Two adapters are a real seam. Do not cut a seam where nothing varies.
- The interface is the test surface. Callers and tests cross the same seam. Modules accept dependencies and return results rather than hiding side effects.
- Let the dependency choose the test strategy. Test pure computation directly. Use local stand-ins where available. Put a port at the seam for a service across a network. Inject and mock a third party you do not control.
- Validate only at system edges: user input, external responses, and configuration. Inside a seam, trust caller contracts.
- Design every important interface twice. Keep the version that is simpler for callers, even when its implementation is harder.
- A compatibility bridge is small, named as compatibility, and has a removal condition.

## Review smells

Sweep for duplication, data clumps, primitive obsession, repeated switches, feature envy, and message chains. Also name these house-specific failures:

- **Re-derived oracle:** A test or second consumer recomputes a value the code already owns. Export and consume the owner's value.
- **Shotgun surgery or divergent change:** One logical change forces scattered edits, or one module changes for unrelated reasons. Move the seam.
- **Extraction for testability:** Pure fragments are split out while the bugs remain in their composition and the composition has no test. Deepen the module and test through its interface.

Use the host domain language. Prefer `CONCEPTS.md` at the host root for definitions. New domain terms enter the user-facing specification before they enter code. Reviewers judge names against that agreed vocabulary.
