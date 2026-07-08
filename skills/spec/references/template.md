# The spec template

`docs/specs/<YYYY-MM-DD>-<feature-slug>.md`. Contract prose holds a one-page ceiling. Section order is fixed; a section with nothing true to say is omitted, never padded. Scenario text lives only in `features/*.feature` — the doc points at it, the gate doc shows it verbatim.

```markdown
# <Feature name>

**Status:** draft | gate-open | signed | closed · **Acceptance:** `features/<feature-slug>*.feature` · **Gate:** `.bottega/gates/<feature-slug>/`

## Intent
<Two sentences: what the named actor can do after this ships, and why that matters now.>
<For UI work: the primary scenario's flow strip, right here — the reader's first "I get it" moment, before any prose.>

## Non-goals
- <Cut item — with the why when it isn't obvious.>

## Open questions
- <A call the maestro wants eyes on> — **default: <the default, already written into the scenarios>** · or: <the concrete alternative considered>. Overrule by a one-word comment; signing accepts the default.

## Direction
<Domain language only. The CONCEPTS.md delta — each new or sharpened term in one sentence. The guiding bet: where the change lives, what owns what. The hard-to-reverse calls only. Committed voice; every line affirmable without reading code.>

## Glossary
- <term from the Direction's vocabulary delta — one plain sentence each>

## Scenario — <scenario name, exactly as its feature file names it>
<the flow strip, composed per skills/storyboarding; one caption line per image as the comment anchor>
**Acceptance checks** <only for promises the flow cannot show; each binary, on the finished product, carrying its value:>
- <check — e.g. "sign out and back in: 'red sneakers' still listed under Saved searches">
- <check — e.g. "appears on a second signed-in device within 30 seconds of saving">

## Testing strategy
- **Automated:** <which scenarios run as generated acceptance tests; what unit tests the run adds and where>
- **Load-bearing values:** <the Examples values whose flip must fail the suite — and why these are the ones that matter>
- **Edges to probe:** <the failure shapes this feature actually has, each named — empty, duplicate, boundary, casing, concurrent — never the generic list>
- **Manual (QA):** <what to attack beyond the scripted scenarios — surfaces, devices, the weird paths worth an hour; QA reads this as its starting hunt list>
- **Not tested:** <what deliberately goes unverified, and why that is acceptable>

## Decisions log
**You said**
- <Decision in the user's words> — <one-line why>

**Our calls — veto by comment**
- <Decision the user never spoke, in their words anyway> — <one-line why. Entries in either list pass three gates: hard to reverse, surprising without context, a real trade-off.>
```

Rules the template can't show:

- Scenario sections appear in feature-file order — files sorted by name, scenarios in file order — so the doc and the gate doc read the same sequence.
- A testing-strategy line names its how. "QA will test it" is not a strategy; "drive the save flow signed out, at phone width, against a 300-item list" is.
- Examples tables carry mutation-bearing values — a value that can flip and fail the suite. A table of placeholders signs nothing.
- Strip slots hold placeholders only until the render brief returns; the doc never reaches the gate with a placeholder in it.
- Mid-run: Decisions log appends (flagged), Direction supersedes with notice on the status block, scenarios never move. At Close the doc is rewritten into the durable record per `skills/execute`.
