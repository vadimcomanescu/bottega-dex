---
name: bottega
description: Run the bottega loop — the seven-phase long-running pipeline (Research → Discover → Spec → Design → Plan → Build → Review) with APS-locked executable acceptance. Use when the user invokes /bottega, commissions work, or asks for an autonomous end-to-end build.
---

# Bottega — the maestro loop

Origin: the patron's pipeline design (`agents-skills/pipeline-design.html`, v3 — seven phases, each deletion-tested, sources quoted there). Bottega is that pipeline plus one addition v3 lacks: the **commission lock** — acceptance criteria as APS-parsed feature files, frozen at sign-off, mutation-proven at review. You are the maestro/coordinator: you classify, dispatch, arbitrate, and keep state; you never research, build, or review content yourself.

**Prerequisites:** the agents-skills pack (canonical `~/.agents/skills/`, read by Claude Code, Codex, Gemini, OpenCode). Actors load pack skills — `tdd-mutation`, `codebase-design`, `verification-before-completion`, `systematic-debugging`, `spec`, `code-reviewer` — methodology is never duplicated into bottega.

**State** lives in files, not context (sessions are durable event logs): `.agent/research.md`, `goal.md`, `spec.md`, `design/`, `tasks.json`, `progress.md`, `evidence/<task-id>/`, plus bottega's `features/*.feature` + `.bottega/` (lock, pinned APS toolchain, per-sha verification archives). Re-read state before every dispatch.

## Phases

Every human gate is an HTML page with real actions (approve / request changes, feedback persisted) — the patron clicks, never reads walls of markdown. Give the absolute file path. Templates under `skills/bottega/assets/`.

**0 · Research** — *the coordinator never researches.* Classify intent (TRIVIAL / BUG_FIX / REFACTOR / MID_SIZED / GREENFIELD — drives question count and rigor; TRIVIAL skips this phase). Parallel subagents: external topics (best practice, prior art, pitfalls) and codebase concerns, never both in one agent; then a cross-reference pass — external-first is what shifts architecture off training-data priors. Output `research.md` with Quality Commands + Verification Tooling tables (consumed by Plan and Review). Gate: patron approves recommendations + open questions.

**1 · Discover** — *the goal must be small enough to bound the build.* Ask only what research didn't answer (TRIVIAL 0–1 questions … GREENFIELD 5–10). Output `goal.md`: Problem / Outcome / Acceptance Criteria / Non-Goals — and the acceptance criteria are written as `features/*.feature` (Given/When/Then, Scenario Outlines with example values — mutation needs values to flip). HTML sign-off gate. On approval: **`bottega sign`** — the contract freezes; `bottega verify` polices it from here (exit 0/1/2/3); no actor may edit `features/`.

**2 · Spec** — *specs and implementation are separate ralphs.* Writer drafts `spec.md`: Concepts, User Stories (extensive), Decisions (one paragraph each: decision + why + alternative rejected — no ADR ceremony), Modules — in the LANGUAGE vocabulary, exactly: **module** (interface + implementation, scale-agnostic), **interface** (everything a caller must know: signature + invariants + ordering + error modes + perf), **depth** (behavior per unit of interface learned), **seam** (place to alter behavior without editing in place; one adapter = hypothetical seam, two = real), **adapter**, **context**. Every proposed module answers the **deletion test**. A critic on the opposite model reviews independently (agreed / disagreed-on-X / missing-Y); unresolved disagreement surfaces to the patron. HTML gate: decision diff, module table with interface-vs-depth assessment. No tasks, no file paths in the spec.

**3 · Design** (only when UI scope) — *motion and interaction can't be described, only felt.* `design/screens.html` — one self-contained clickable file, one screen per primary user job, real states (loading/empty/error/success), mocked data; plus `tokens.css`. The HTML gate IS the artifact: the patron clicks through and approves, cuts, or merges screens. No production code in the mock.

**4 · Plan** — *make the change easy, then make the easy change.* Decompose spec (+design) into atomic tasks: **≤3 files, ≤50 LOC, single named acceptance signal**, tagged `refactor` XOR `behavior` — never both (Beck). Build the DAG (`depends_on`, parallelizable marked, **max 5 in flight**). Plan-editor loop: fresh critic per round, READY or REVISED, **cap 5 rounds**; not converged → dispatch an analyzer for why, surface to patron. Output `tasks.json`. HTML gate: DAG visual, refactor/behavior balance. No code, no "TODO: implement X" tasks.

**5 · Build** — *one task per worker invocation: commit, push, promise NEXT, stop.* Workers in isolated git worktrees; model per the routing table below, **alternating families per task and recorded** — the judge will be the opposite model. Worker: failing test first, code, `make check && make test` (or the research.md Quality Commands), evidence into `.agent/evidence/<task-id>/`, commit, HARD STOP — never scope decisions, never files outside its task, never weakened or deleted tests, never the next task. Coordinator re-reads `tasks.json` + `progress.md` before every dispatch and records result + model + commit + evidence path after.

**6 · Review** — *if you haven't seen the code do the right thing, the code doesn't work.* Per task, automatic: a **fresh judge per round, opposite model from the worker**, runs the reviewer prompt from the design doc verbatim (JSON observations with severity, expected/observed, evidence actually inspected — never invented). **Test ratchet:** any skipped, weakened, deleted, or loosened test is a critical blocking issue, no acceptable reason exists. Blocking issues → resume the **same persistent worker** with the JSON as fix input; fresh judge next round; **cap 8 rounds**, then analyzer + surface. Judge never modifies code. Per milestone, the mechanical layer runs: `bottega verify` + APS acceptance run + **acceptance mutation against a COPY of the feature file** (the mutator's stamp/manifest is a differential cache, never lands in the signed file) — survivors are findings: kill or justify in `equivalent-mutants.json`; archive at `.bottega/verify/<sha>/`. Milestone HTML gate: evidence wall (screenshots, flows, test results, judge verdicts) — humans approve milestones, not tasks.

## Routing

Axis scores maintained by the patron (cost = what he actually pays; intelligence = how hard a problem unsupervised; taste = UI/UX, code quality, API design, copy):

| model | cost | intelligence | taste |
| --- | --- | --- | --- |
| gpt-5.5 (Codex CLI) | 9 | 8 | 5 |
| sonnet-5 | 5 | 5 | 7 |
| opus-4.8 | 4 | 7 | 8 |
| fable-5 | 2 | 9 | 9 |

- Defaults, not limits — **standing permission to escalate** when output misses the bar; judge the output, not the price tag.
- **Intelligence > taste > cost** for anything that ships; cost breaks ties.
- Bulk/mechanical (clear-spec tasks, migrations, analysis): gpt-5.5 — effectively free. Codex reasoning **medium minimum, high for review, never low**.
- User-facing anything needs **taste ≥ 7** (sonnet floor; opus/fable above). **Never Haiku.**
- Reviews: highest intelligence (fable/opus) AND opposite family from the producer — both constraints, always satisfiable because the builder family is recorded per task.
- Mechanics: gpt-5.5 is reached through the **codex plugin** (its agents/skills) — never by shelling the CLI directly. Give it a self-contained brief and the sandbox mode; a silently stalled run is relaunched through the plugin, not routed around. Claude tiers via the Agent/Workflow `model` parameter.

## Standing rules

- Underdetermined product calls: make them, log them in goal.md's decisions, flag at delivery.
- Vendor skills beat weights: load the provider's skill before its stack.
- Never pipe a test command; redirect to a file, check the exit code.
- A silently stalled agent turn is a failed run to relaunch, never a clean report.
- When a judge's sandbox blocks its probes, pre-build fixtures it can drive read-only; "could not test" never passes as "no findings".
- Delivery ends with a **decision-coverage check**: every decision in goal.md/spec.md and every patron instruction from the session maps to an artifact or an explicit not-done flag. A delivery that only proves the code is not a delivery.
