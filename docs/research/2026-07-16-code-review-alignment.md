# Code review alignment with Bottega 0.49

Date: 2026-07-16

Scope: compare how Bottega Dex reviews an integrated diff today against Bottega at 0.49.0 (commit [`48f08cd`](https://github.com/vadimcomanescu/bottega/commit/48f08cd)), and record the alignment. Bottega Dex forked Bottega's review doctrine around 0.46 (2026-07-14). Bottega releases 0.47 to 0.49 changed the review gate afterward.

## Decision

Adopt four changes now, in order: the schema 2 report contract with the independent architecture verdict, scoped opposite-family delta rounds instead of a full both-family rerun after every fix, the reviewer method upgrades, and a fail-fast guard on empty briefs in `claude-exec`. Raise the panel routes as a fifth, smaller change. Defer the invocable review gate and the land loop: they conflict with the one-skill rule and Bottega Dex has no PR-only review entry point yet, so they are a scope decision, not an alignment fix.

## What Bottega changed since the fork

- **0.47** restored worker doctrine. The review report moved to schema version 2 with a required `architecture` verdict (`conforms`, `finding`, `blocked`, plus evidence) that each reviewer returns independently, judged against the codebase-design doctrine and the brief's fixed decisions. Rechecks are keyed by `check_id`. Fixes are rechecked in scoped delta rounds by a fresh reviewer from the family opposite the fixer, not by a full both-family rerun; a full both-family integrated review reruns only when the spec, domain model, or architecture brief changed.
- **0.48** extracted the review gate into `skills/review`, one home with two callers: a run at its Review phase and the new `skills/land`, which takes an open PR through review-fix rounds to mergeable. The gate gained an intent-input contract for targets without a frozen run brief (self-reported intent, doctrine-only architecture verdict) and a trivial-diff exception for PR targets only (under 150 changed lines, no risk path, single reviewer from the family opposite the head's author).
- **0.49** replaced the opus panelist with the orchestrator-tier model, on the rule that the panel exists for the decisions with the highest demand so it gets the strongest model. It also added boundary guards after a live run passed workflow args as a JSON-encoded string and both panelists received the literal task "undefined": the dispatch scripts now normalize their input and fail fast when a required field is missing.

## Gaps

| # | Bottega 0.49 | Bottega Dex today |
| --- | --- | --- |
| 1 | Report schema version 2: required `architecture` verdict, rechecks keyed by `check_id` | Schema version 1: no architecture verdict, rechecks keyed by `finding_id` |
| 2 | A fix gets a scoped delta round from the family opposite the fixer (check IDs plus fix range); a changed brief gets a fresh both-family integrated review | Any head change reruns the full blind Codex-and-Claude pair |
| 3 | Reviewer method: scope by reachability (report a pre-existing defect only when the change newly exposes it), changed-test justifications arrive in the brief, architecture evidence per fixed decision, flag behavior the requirement did not ask for | Reviewer prompt predates these; it checks behavior and architecture generally |
| 4 | Dispatch scripts fail fast on a missing or empty task input | `claude-exec` rejects a missing brief file but dispatches an empty one; the schema then forces a fabricated-shape report |
| 5 | Panel drafts come from the strongest models (Sol at max, orchestrator-tier Claude) | Codex panelist at Sol high, Claude panelist at opus |
| 6 | Review gate invocable on a PR or ref range, with intent tiers, a trivial-diff exception, and a land loop that owns the GitHub thread surface | One `run` skill; review exists only as a run phase |

The review caps already match: round 3 stops the review, and the same finding open after two failed fixes stops that repair.

## Alignment

**1. Report contract, schema version 2.** Copy Bottega's `skills/reviewing/references/report.schema.json` over `references/report.schema.json`: bump `schema_version` to 2, add the required `architecture` object, rename `rechecks[].finding_id` to `check_id`. Update `references/agents/reviewer.md` to require the independent architecture verdict with concrete evidence covering every fixed decision, and update `tests/review-report.test.ts` to pin the new shape. In the run skill's review step, the orchestrator reconciles both architecture verdicts against the brief's fixed decisions; missing coverage or unresolved disagreement blocks acceptance.

**2. Delta rounds.** In `skills/run/SKILL.md` step 5, replace "any head change invalidates both reviews" with Bottega's rule: each confirmed fix is rechecked by a fresh cold reviewer from the family opposite the fixer, scoped to the check IDs and the fix range, against the new frozen SHAs. A changed spec, domain model, or architecture decision still gets a fresh both-family integrated review of the complete diff. Keep both caps as they are. Update the README paragraph that promises a both-family rerun after every fix. This cuts the cost of a fix round roughly in half while keeping every fix checked by the family that did not write it.

**3. Reviewer method.** Add to `references/agents/reviewer.md`: report a pre-existing defect only when this change newly exposes it; a reproduced failure is stronger evidence than a plausible concern; inspect every changed test against the brief's changed-test justifications; flag behavior or abstractions the requirement did not ask for; not tested is not passed, record every blocked probe. Have the orchestrator include changed-test justifications in each reviewer brief.

**4. Brief guard.** `scripts/claude-exec` fails fast when the brief file is empty, before spawning Claude. One check, one test in `tests/claude-exec.test.ts`. This is the Bottega Dex analog of the 0.49 args guards: the boundary that assembles a dispatch validates its own inputs.

**5. Panel routes.** Raise the Codex panelist from Sol high to Sol at the highest exposed effort in `references/panel.md`. For the Claude side, route the panelist to the strongest Claude model `claude-exec` can prove usage of, and keep opus as the pinned fallback; the judge stays a compare-only role and does not need the raise.

**Deferred: the invocable review gate and land.** Porting `skills/review` and `skills/land` would give Bottega Dex a PR-only review entry point, intent tiers, the trivial-diff exception, and the thread-resolution loop. It also means a second and third skill, a `pr-threads` analog, and a size gate, against the standing rule that the plugin exposes one skill. Nothing in the run flow degrades without it. Take it as a separate decision when a PR-only review is actually wanted; until then the trivial-diff exception does not apply anywhere in Bottega Dex, because a run's integrated review always takes both families.

## Not ported

- The route guard and entry guard hooks. Bottega Dex ships no hooks by design; routing enforcement lives in `claude-exec` and the orchestrator's routing table.
- The panel workflow script and `review-dispatch.js`. Bottega dispatches Claude through the harness Workflow tool; Bottega Dex's equivalent boundary is `claude-exec`, which already owns model, effort, schema, and identity checks.
- `scripts/pr-threads`. Only needed with land.
