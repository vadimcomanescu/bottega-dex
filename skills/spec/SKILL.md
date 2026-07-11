---
name: spec
description: Write and sign the spec. Spec doc, Gherkin scenarios, storyboards, gate. Reached by pointer from skills/run when the orchestrator's plan includes a signed spec.
disable-model-invocation: true
---

# Spec

The user signs product behavior, never implementation detail. Everything here is written for a reader who leaves. Discovery already happened in `skills/run`; you arrive with the interview settled. Judgment stays in your turns: every scenario's final text, the Direction, the shot list, arbitration, every reply in the gate's comment loop.

## The doc

1. Name it `docs/specs/<YYYY-MM-DD>-<feature-slug>.md`. The bare feature slug is the run's identity everywhere. Pre-flight the collisions: the spec path, `bottega/<feature-slug>`, `bottega/evidence-<feature-slug>`, `.bottega/gates/<feature-slug>/`. A collision means the name was under-specific: sharpen it, never number it.
2. Draft it per [references/template.md](references/template.md): Intent, Non-goals, Open questions, Direction, one section per scenario, Decisions log. Spec prose holds one page. A task hard enough that coverage and framing decide quality is drafted by the panel (`skills/panel`); anything smaller you draft in your own turns and cross-read (step 7). Every Open-Question default is already written into the scenarios; the doc never publishes with holes. A decision the user never spoke lands under **Our calls: veto by comment**, in their words. Every user-facing sentence is plain product English.
3. **Direction: shared understanding, never a plan.** In domain language: the `CONCEPTS.md` delta (terms the user co-signs; they land in `CONCEPTS.md` at sign), the guiding bet (one or two sentences: where the change lives, what owns what), and only the hard-to-reverse calls. Two tests bound it: every line affirmable without reading code, and expensive to undo once data or callers depend on it. A build-phase discovery that bends it is superseded in the Decisions log and surfaced to the user, never silently.
4. **Scenarios: the definition of done.** Authored directly in `features/*.feature`, the single home of the scenario text; the doc points, never copies. Steps in the domain's own words, second person; Scenario Outlines with Examples wherever values matter. **Altitude guard:** a scenario the named actor cannot perform or watch is not acceptance; it moves down to a brief, a reviewer criterion, or the test suite. Schema shapes, enforcement layers, and forged-request probes never appear in signed features. The delivery reads the scenarios back as a checklist with evidence; there is no separate done.
5. **Acceptance checks and testing lines.** A scenario section adds an **Acceptance checks** list only for promises the flow cannot show (persistence, sync, absence, timing), each binary on the finished product and carrying its value ("appears on a second signed-in device within 30 seconds", not "syncs"). Each scenario section carries one Testing line in plain terms: what gets opened, done, seen, and the evidence that comes back. Concrete or rejected. Storyboards, when the plan includes them, follow `skills/storyboarding` (placement per [references/template.md](references/template.md)), and every listed flow returns at delivery as a QA recording.
6. **Size guard:** more than about 3 independently buildable surfaces is several deliverables; propose the split at the gate.

## Gate

7. **Cross-read**, only for a spec drafted in your own turns (a panel-drafted one already crossed independent minds). Dispatch codex (xhigh, read-only) with the draft, the feature files, and the repo. Its hunt: a Then no actor can observe, a Given QA cannot build, Examples with no values a mutation can flip, HOW past the altitude guard, a non-goal contradicting a scenario, an our-call one question would have retired, a zero, a many, or a failure no scenario visits. Findings are unverified input: arbitrate each; overrules land in the Decisions log.
8. Hand to `skills/signoff`: one collaborative doc, comments answered where made, `SIGNED <feature-slug>` as the go signal. The phase's durable state is entirely on disk (`docs/specs/`, `features/`, `.bottega/gates/<feature-slug>/`); any later session picks up cold.

## Run start: the acceptance toolchain

After the sign and before the first builder brief, never earlier: read [references/run-start.md](references/run-start.md) and dispatch it as one mechanic brief (or run it in your own turns on a small run). It ends with the toolchain pinned into `.bottega/aps.lock`, entrypoints generated from `features/*.feature`, the suite verified RED, and the wiring committed. A host outside the kit's languages (TypeScript, Python, Go, Rust) cannot make the spec executable; say so before the gate, not at run start.

## Verifying the spec

The pipeline a signed spec brings with it, run whole at the end of the build. Nothing on it is optional once the spec was decided:

1. The acceptance suite runs green against the integrated artifact.
2. QA drives every signed scenario with recordings (`skills/qa`).
3. The feature file is mutation-tested: run on a copy, never the signed file (the tool writes into the file it reads), with the kit's `aps-adapter <test-command>` worker as the runner. Exit 1 means surviving mutants, not a broken tool: kill them.

Archive the runs under `.bottega/verify/<feature-slug>/`, gitignored.

## Unattended: the sign delegated

Only on the user's explicit word, usually an issue handed over; never inferred. The delegation covers the interview and the gate, nothing else. With no user reading the spec, the panel and the cross-read are the only independent eyes it gets. The interview already closed in discovery (`skills/run`, Discover: the issue is the interview); every question it would have asked lands as an our-call with its default written into the scenarios. There is no gate: make the sign commit yourself (the spec doc's status flips to signed and lands in one commit with `features/*.feature`) and open the Decisions log with the delegation, quoted and linked. From sign onward the issue thread does the gate doc's duties (status, escalations), and the delivery PR discloses the unattended sign in its first line. What delegation never buys: the real-users safety rule, the fable routing rule, and the `features/` freeze all stand.

**Done when** the feature files run as acceptance without a follow-up question, and a non-engineer reading the gate doc could say what will change for them.
