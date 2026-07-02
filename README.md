# bottega

An autonomous long-running agent system built for Fable to orchestrate.

A bottega is the Renaissance workshop: a maestro runs the shop, apprentices execute, and the patron appears twice — commissioning the work and receiving it. That is the whole operating model. The patron signs a one-page commission; a fleet of agents builds, reviews, and examines the work autonomously; the delivery is a PR with evidence. Nobody watches the workshop.

## Why it holds without supervision

Unsupervised runs fail by satisfying a proxy for the goal, so every gate that can be mechanical is mechanical:

- **The contract is executable.** Commissions are Gherkin feature files. The [Acceptance Pipeline](https://github.com/vadimcomanescu/acceptance-pipeline-kit) parses them to JSON IR and *generates* the test entrypoints — no hand translation between what the patron signed and what runs.
- **The contract is out of reach.** `bottega sign` freezes the feature files into `.bottega/commission.lock`; `bottega verify` fails the delivery gate on any drift (exit 0 clean, 1 drift, 2 unsigned). Builders that edit the spec commit forgery, and forgery is detected, not trusted away.
- **The wiring is proven, not assumed.** Acceptance mutation flips example values in the IR and requires the suite to fail. A surviving mutation means a handler ignores a signed value — that is a finding, killed or justified in `equivalent-mutants.json`. Source mutation covers the unit layer on core domain logic.
- **Fresh eyes are different weights.** Every diff is reviewed cold by the *complement* of whoever built it — a Claude-built slice gets a non-Claude adversary, a Codex-built slice a non-Codex one, never its own family. Same-family review inherits the generator's blind spots and looks like verification without being it.

## The cast

| Actor | Doctrine | Runs on |
| --- | --- | --- |
| **Maestro** | [`skills/bottega/SKILL.md`](skills/bottega/SKILL.md) — commission, decompose, route, arbitrate, deliver | Fable |
| **Builder** | [`agents/bottega-builder.md`](agents/bottega-builder.md) — one slice to green; red first; simplest code that could work; deep modules | sonnet, or codex at medium+ |
| **Adversary** | [`agents/bottega-adversary.md`](agents/bottega-adversary.md) — cold diff, concrete failure scenarios, confirmed breakages only | the family that did NOT build the slice |
| **Simplifier** | [`agents/bottega-simplifier.md`](agents/bottega-simplifier.md) — shrink interfaces, delete speculative structure, never capability | strong |
| **Examiner** | [`agents/bottega-examiner.md`](agents/bottega-examiner.md) — drives the artifact as a user; evidence or it didn't happen | any + agent-browser |

Doctrine is saved; control flow within a phase is authored fresh per run. The phase sequence is the patron's pipeline design (`agents-skills/pipeline-design.html` v3 — seven phases, each deletion-tested, sources quoted there); bottega adds the layer v3 lacks: acceptance criteria as APS-locked feature files, frozen at sign-off, mutation-proven at review.

```
0 Research ─▶ 1 Discover (goal + features signed: bottega sign) ─▶ 2 Spec (writer + opposite-model critic)
  ─▶ 3 Design (screens.html, UI only) ─▶ 4 Plan (atomic tasks, DAG, editor loop ×5)
  ─▶ 5 Build (workers, worktrees, HARD STOP, alternating families)
  ─▶ 6 Review (fresh opposite-model judge ×8, test ratchet; verify + acceptance mutation; evidence wall)
```

Every human gate is a clickable HTML page (approve / request changes), never a wall of markdown.

## The two artifacts a human ever reads

**In:** the commission (`docs/commissions/NNNN-*.md` + `features/*.feature`) — intent in two sentences, non-goals, Given/When/Then with example values, a rendered prototype screenshot for UI work. One page, signed in minutes.

**Out:** the delivery PR — scenario checklist, evidence from `.bottega/verify/<sha>/`, findings fixed, and the decisions log: every call the commission underdetermined, made and flagged, because decisions in an unsupervised run are reviewed after, not asked before.

## This repo

Bottega built through its own loop (commission 0001): the `bottega` CLI.

```
bottega sign      # hash features/**/*.feature into .bottega/commission.lock
bottega verify    # clean → 0 · drift (modified/removed/added) → 1 · unsigned → 2
```

Layout: `src/` + `bin/` the CLI · `tests/` unit · `features/` signed commission · `build/` IR · `acceptance/generated/` generated entrypoints · `handlers/` step handlers · `.bottega/` runtime (pinned toolchain in `aps.lock`, evidence in `verify/<sha>/`, worktrees in `wt/`).

```bash
npm install
npm test                                   # unit + generated acceptance
node bin/bottega.js verify                 # this repo verifies its own commission
```

Requires Node ≥ 22.18 (the bin shim runs TypeScript through native type stripping).

## Install into a host repo

1. Copy `agents/*.md` into the host's `.claude/agents/`, `skills/bottega/` into its skills directory.
2. `install.sh --version v0.1.0 --bin-dir .bottega/bin` from the [acceptance-pipeline-kit](https://github.com/vadimcomanescu/acceptance-pipeline-kit), plus its `@aps-kit/typescript` package; pin hashes in `.bottega/aps.lock`.
3. Wire `bottega verify` into the host's delivery gate.
4. Commission work with `/bottega`.

## Provenance

Primary origin: the patron's own [pipeline design v3](https://github.com/vadimcomanescu/agents-skills/blob/main/pipeline-design.html) and [agents-skills](https://github.com/vadimcomanescu/agents-skills) pack (methodology loaded, never duplicated). Enforcement layer: [Acceptance Pipeline Specification](https://github.com/unclebob/Acceptance-Pipeline-Specification) (Robert C. Martin) via its [multi-language kit](https://github.com/vadimcomanescu/acceptance-pipeline-kit). Vocabulary: Pocock's LANGUAGE.md (module / interface / depth / seam / deletion test). Builder discipline: [ponytail](https://github.com/DietrichGebert/ponytail)'s seven-rung ladder — lazy, not negligent. Run mechanics validated in the June 2026 bottega playgrounds (worktrees, pinned toolchains, per-sha evidence archives).
