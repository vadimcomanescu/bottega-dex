# The spec template

`docs/specs/<YYYY-MM-DD>-<feature-slug>.md`. Spec prose holds a one-page ceiling. Section order is fixed; a section with nothing true to say is omitted, never padded. Scenario text lives only in `features/*.feature` — the doc points at it, the gate doc shows it verbatim.

```markdown
# <Feature name>

**Status:** draft | gate-open | signed | closed · **Acceptance:** `features/<feature-slug>*.feature` · **Gate:** `.bottega/gates/<feature-slug>/`

## Intent
<Two sentences: what the named actor can do after this ships, and why that matters now.>
<For UI work: the primary scenario's flow strip, right here — the reader's first "I get it" moment, before any prose.>

## Non-goals
- <Cut item — with the why when it isn't obvious.>

## Open questions
- <A call the orchestrator wants eyes on> — **default: <the default, already written into the scenarios>** · or: <the concrete alternative considered>. Overrule by a one-word comment; signing accepts the default.

## Direction
<Domain language only. The CONCEPTS.md delta — each new or sharpened term in one sentence. The guiding bet: where the change lives, what owns what. The hard-to-reverse calls only. Committed voice; every line affirmable without reading code.>

## Glossary
- <term from the Direction's vocabulary delta — one plain sentence each>

## Scenario — <scenario name, exactly as its feature file names it>
<the flow strip, composed per skills/storyboarding; one caption line per image as the comment anchor>
**Acceptance checks** <only for promises the flow cannot show; each binary, on the finished product, carrying its value:>
- <check — e.g. "sign out and back in: 'red sneakers' still listed under Saved searches">
- <check — e.g. "appears on a second signed-in device within 30 seconds of saving">

## Testing
- <scenario name>: <open x, do y, see z — and the evidence: screenshot / recording / output>
- Also probed: <same concreteness, for what the scenarios don't cover — e.g. "save the same query twice: the list shows one entry">
- Not verified: <what deliberately goes unchecked, and why>

## Decisions log
**You said**
- <Decision in the user's words> — <one-line why>

**Our calls — veto by comment**
- <Decision the user never spoke, in their words anyway> — <one-line why. Entries in either list pass three gates: hard to reverse, surprising without context, a real trade-off.>
```

Rules the template can't show:

- Scenario sections appear in feature-file order — files sorted by name, scenarios in file order — so the doc and the gate doc read the same sequence.
- A testing line names its how. "Will be tested" says nothing; "open /search signed in, save 'red sneakers', screenshot Saved searches showing it" is a plan.
- Examples tables carry mutation-bearing values — a value that can flip and fail the suite. A table of placeholders signs nothing.
- Strip slots hold placeholders only until the render brief returns; the doc never reaches the gate with a placeholder in it.
- Mid-run: Decisions log appends (flagged), Direction supersedes with notice on the status block, scenarios never move. After delivery the doc is rewritten into the durable record per `skills/run`, Deliver.
