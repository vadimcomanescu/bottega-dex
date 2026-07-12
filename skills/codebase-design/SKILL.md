---
name: codebase-design
description: House design rules. Deep modules behind small interfaces, seams cut where things vary, names from CONCEPTS.md. Loaded by the orchestrator designing a change and every reviewer judging conformance.
disable-model-invocation: true
user-invocable: false
---

# Codebase design

## Vocabulary

Use these terms exactly; never "component", "service", "API", or "boundary".

- **Module**: anything with an interface and an implementation (a function, class, package, or slice). Scale-agnostic.
- **Interface**: everything a caller must know to use the module correctly: signature, invariants, ordering constraints, error modes, required configuration, performance traits. Never just the type surface.
- **Depth**: behavior per unit of interface a caller must learn. Deep = much behavior behind a small interface. Shallow = interface nearly as complex as the implementation.
- **Seam**: a place behavior can change without editing in place; where a module's interface lives. Where the seam goes is its own design decision, distinct from what goes behind it.
- **Adapter**: a concrete thing satisfying an interface at a seam. A role, not a substance.

## Principles

- **Design deep modules.** For every interface ask: fewer methods? simpler parameters? more complexity hidden inside? A module that stays shallow (interface as complex as its implementation) gets inlined.
- **Depth is a property of the interface, not the implementation.** A deep module may be built of small swappable parts inside; they just aren't part of the interface.
- **The deletion test.** Delete the module mentally. If complexity just vanishes, it was hiding nothing: negative code. If complexity reappears across callers, it earns its place. Run it on every new module or wrapper.
- **One adapter is a hypothetical seam; two is a real one.** Never cut a seam where nothing varies.
- **The interface is the test surface.** Callers and tests cross the same seam; wanting to test past it means the module is the wrong shape. Modules accept dependencies rather than creating them, and return results rather than producing side effects. Tests describe behavior and survive internal refactors; a test that must change when the implementation does was testing past the seam. Deepening replaces tests, never layers them: the old shallow modules' suites are deleted and the behavior asserted once, at the new interface.
- **The dependency picks the test strategy.** Pure computation: no seam, test it directly. A dependency with a local stand-in (embedded database, in-memory filesystem): the stand-in runs in the suite; no port appears at the interface. Your own service across a network: a port at the seam, with an in-memory adapter in tests and a transport adapter in production. A third party you don't control: an injected port, mocked in tests. Never cut a port where a stand-in exists.
- **Validate at system edges only** (user input, external responses, configuration). Inside a seam, modules trust their callers' contracts; internal re-validation is speculative structure.
- **Design it twice.** Before committing to an interface, sketch a second, radically different one; keep whichever is simpler for callers, whatever it costs the implementation.
- **A bridge that must remain is tiny, named as compatibility, and carries a removal condition.** Anything less is the compatibility sediment reviewers flag. There is no third kind.

## Smells

Sweep every pass for the classic smells (duplication, data clumps, primitive obsession, repeated switches, feature envy, message chains); each is a judgment call, the brief's contract overrides, and anything tooling already enforces is skipped. Three house-specific ones by name:

- **Re-derived oracle**: a test or second consumer recomputes a value the code already owns, and the two drift. Export the owner's computed value; have the check consume that.
- **Shotgun surgery / divergent change**: one logical change forcing scattered edits, or one module edited for unrelated reasons. The seam is misplaced; report it as evidence for a re-cut, not as the builder's defect.
- **Extraction for testability**: pure fragments split out so units are easy to test while the bugs live in how they're called, and the composition itself has no test. Deepen instead: assert the behavior through the module's interface.

## Domain model

- Interface names come from the domain's language, the same words the agreed spec uses. A synonym invented in code ("purchase" where the spec says "order") is a conformance finding.
- The glossary lives in `CONCEPTS.md` at the host repo root: one entry per domain term, definitions only, no implementation details. New terms enter with the spec the user OKs, so the user sees the words the code will use, and the glossary is updated the moment a term crystallizes or sharpens during the run; reviewers judge names against it.
