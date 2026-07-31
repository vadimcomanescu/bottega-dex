# UI Prototype

Generate several radically different UI variations on one route, switchable from a floating bottom bar. The user compares them in the surrounding product, chooses a direction or combines elements, and the variants are then discarded.

## Shape

Prefer adjusting an existing page: keep its data, parameters, and authorization, and swap only the rendered subtree through `?variant=`. Mount a new throwaway route only when the proposed surface has no plausible existing host. Follow the project's routing convention and include `prototype` in a new route or filename.

## Process

1. **State the question and pick the count.** Default to three variants and cap at five. Put a one-line plan beside the code, for example: "Three settings-page variants, switchable through `?variant=`, on `/settings`."
2. **Make the variants structurally different.** They must disagree on layout, hierarchy, or primary affordance, not colour or copy. Use the project's component and styling system, current data, and applicable design guidance. Name each component clearly.
3. **Wire a route-level switcher.** Keep data loading above the switched subtree. Read the search parameter, render one variant, and render one shared `PrototypeSwitcher` below it.
4. **Build the floating switcher.** It has previous and next controls that wrap, a current variant label, shareable and reload-stable URL updates through the framework router, and left/right keyboard controls that do not intercept text editing. Make it visually distinct from the design being judged and disable it in production builds.
5. **Hand it over.** Give the user the route and variant keys. Treat feedback that combines parts of variants as the decision to capture.
6. **Capture and clean up.** Record the winner and why in the governing specification or decision record. Rewrite the winning production surface properly, then remove the other variants and switcher. Preserve prototype code only when the user or an agreed repository archive requires it.

## Anti-patterns

- Variants that differ only in colour or copy.
- A shared layout that prevents variants from disagreeing.
- Real mutations instead of a read-only or stubbed exploration.
- Promoting prototype code directly to production.
