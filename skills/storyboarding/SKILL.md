---
name: storyboarding
description: Compose flow strips from a render brief's shot list. A real capture with the change drawn on it where a screen already exists, a plain wireframe where it doesn't; never an image that pretends to be the product.
disable-model-invocation: true
user-invocable: false
---

# Storyboarding

Fidelity follows the information: real pixels only where a real screen changes; a wireframe that looks like a wireframe everywhere else.

The brief carries the shot list: which flows, which steps, which kind each strip is. You produce them. Hard rules, followed to the letter:

- **Two frame kinds, the brief says which.** A **capture frame** shows an existing screen changing: screenshot the launched product on the real route, then draw the change on it (the annotation rule below carries the delta); a before/after pair sits adjacent, labeled. A **wireframe frame** shows a screen that doesn't exist yet: visibly a wireframe (named boxes, rough layout, the product's real screen names, routes, and entry points, real copy where copy is judged), never styled to pass for the product. One strip, one kind, never mixed.
- **The honesty rule.** An image that pretends to be a capture is inadmissible whatever its caption; the mechanism is the requirement, not the wording. A wireframe that looks like a wireframe is honest; a generated "screenshot" never is.
- **States are designed, never blank.** A scenario about an empty, error, or loading state shows a designed state with real copy, in wireframe form on wireframe strips.
- **Variants, when the brief asks for A/B:** structurally different wireframes (layout, hierarchy, primary control), never color swaps.
- **Per-frame bar:** captures at phone width for phone-first flows; a full screen only where placement on the page is the judged thing. An interaction step crops to the acted region, framed and readable, not merely nonblank. The caption names what changed, what the frame is not judging, and its source: the **product** (a named build) or a **wireframe**.
- **Deliver flow strips, not frame piles.** Panels side by side in step order, numbered, an arrow only between neighboring steps (never between independent states), and gutters wide enough that nothing touches.
- **One pointer per panel on capture frames, unmistakably markup.** A single ring or arrow on the acted control, in a color foreign to the product's palette, so it reads as annotation rather than product pixels. It never covers the judged region and never redraws or fakes product content.
- **Archive everything.** Frames, strips, wireframe sources, and the compose script land in `.bottega/gates/<feature-slug>/`. A strip nobody can re-render is not evidence.
- **Tooling is whatever you verify present:** any headless browser you can install or the brief names for captures; any imaging tool on the machine for strips; the compose script archived beside them.

Report back: frame paths, each frame's caption, the archive path, and any shot that could not be honestly produced (reported, never faked).
