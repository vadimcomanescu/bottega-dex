---
name: codebase-design
description: Bottega's house design discipline — deep modules behind small interfaces, seams cut where things vary, names drawn from a maintained CONCEPTS.md domain glossary. Loaded by the maestro when designing a spine and by every reviewer judging architectural conformance; dossier interface contracts are written in its vocabulary.
---

# Codebase design

*The house style, on both sides of the dispatch seam: the maestro designs by it, the dossier carries it, the reviewer judges against it.*

## Vocabulary

Use these terms exactly — never "component", "service", "API", or "boundary".

- **Module** — anything with an interface and an implementation: a function, class, package, or slice. Scale-agnostic.
- **Interface** — everything a caller must know to use the module correctly: signature, invariants, ordering constraints, error modes, required configuration, performance traits. Never just the type surface.
- **Depth** — behavior per unit of interface a caller must learn. Deep = much behavior behind a small interface. Shallow = interface nearly as complex as the implementation.
- **Seam** — a place behavior can change without editing in place; where a module's interface lives. Where the seam goes is its own design decision, distinct from what goes behind it.
- **Adapter** — a concrete thing satisfying an interface at a seam: a role, not a substance.

## Principles

- **Design deep modules.** For every interface ask: fewer methods? simpler parameters? more complexity hidden inside? A module that stays shallow — interface as complex as its implementation — gets inlined.
- **Depth is a property of the interface, not the implementation.** A deep module may be built of small swappable parts inside; they just aren't part of the interface.
- **The deletion test.** Delete the module mentally: complexity just vanishes → it was hiding nothing, negative code; complexity reappears across callers → it earns its place. Run it on every new module or wrapper.
- **One adapter is a hypothetical seam; two is a real one.** Never cut a seam where nothing varies.
- **The interface is the test surface.** Callers and tests cross the same seam; wanting to test past it means the module is the wrong shape. Modules accept dependencies rather than creating them, and return results rather than producing side effects.
- **Design it twice.** Before committing to an interface, sketch a second, radically different one; keep whichever is simpler for callers, whatever it costs the implementation.

## Domain model

- Interface names come from the domain's language — the same words the signed scenarios use. A synonym invented in code ("purchase" where the commission says "order") is a conformance finding.
- The glossary lives in `CONCEPTS.md` at the host repo root: one entry per domain term, definitions only, no implementation details. The maestro creates it at spine design when absent and updates it the moment a term crystallizes or sharpens during the run; reviewers judge names against it.
