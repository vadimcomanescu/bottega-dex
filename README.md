# bottega

An autonomous long-running agent system built for Fable to orchestrate.

A bottega is the Renaissance workshop: a maestro runs the shop, apprentices execute, and the patron appears twice — commissioning the work and receiving it. That is the whole operating model. The patron signs a one-page commission; a fleet of agents builds, reviews, and examines the work autonomously; the delivery is a PR with evidence. Nobody watches the workshop.

## Why it holds without supervision

Unsupervised runs fail by satisfying a proxy for the goal, so every gate that can be mechanical is mechanical:

- **The contract is executable.** Commissions are Gherkin feature files. The [Acceptance Pipeline](https://github.com/vadimcomanescu/acceptance-pipeline-kit) parses them to JSON IR and *generates* the test entrypoints — no hand translation between what the patron signed and what runs.
- **The contract is out of reach.** `bottega sign` freezes the feature files into `.bottega/commission.lock` (the lock keeps the older "commission" name deliberately — it names the signed thing); `bottega verify` fails the delivery gate on any drift (exit 0 clean, 1 drift, 2 unsigned, 3 corrupt). Builders that edit the spec commit forgery, and forgery is detected, not trusted away.
- **The wiring is proven, not assumed.** Acceptance mutation flips example values in the IR and requires the suite to fail. A surviving mutation means a handler ignores a signed value — that is a finding, killed or justified in `equivalent-mutants.json`. Source mutation covers the unit layer on core domain logic. Honest ceiling: mutation proves the tests read the signed values, not that the scenarios cover intent — that judgment stays human, made once, at sign-off.
- **Fresh eyes are different weights.** Every diff is reviewed cold by the *complement* of whoever built it — a Claude-built slice gets a non-Claude adversary, a Codex-built slice a non-Codex one, never its own family. Same-family review inherits the generator's blind spots and looks like verification without being it.

The standing objection: the maestro is smart — why not let it simply read the work and judge it? Because it is both orchestrator and arbiter; its reading as ground truth would be the same mind approving its own decisions. And better builders make the gates more load-bearing, not less — a weak builder games a test vacuously and gets caught in review; a strong builder under gate pressure writes tests that survive review while checking nothing, which only execution catches (flip a signed value; the suite must fail). The gates are the substitute for ceremony, not an addition to it: three mechanical checks carry what judge panels, checklists, and a watching human would otherwise have to — which is what lets the doctrine stay thin and the patron actually leave. Trust here is structural, not reputational. The one place the maestro's own weights do judge — the final cold read before the PR — strips what actually biases self-judgment: not the weights but the authorship. A fresh fable instance reads commission against artifact with none of the run's context, and an overruled cold-read finding lands in the PR for the patron to see.

## The cast

Agents say who; skills say how. Both ship in this repo — bottega assumes nothing about the host except the codex plugin (checked before any run; absent → fail loudly).

| Actor | Identity | Methodology |
| --- | --- | --- |
| **Maestro** (Fable) | architect, planner, router, arbiter — all design authority | [`skills/bottega/SKILL.md`](skills/bottega/SKILL.md) |
| **Implementor** | one dossier to green, deliberately simple | [`agents/bottega-builder.md`](agents/bottega-builder.md) → [`skills/implementing/SKILL.md`](skills/implementing/SKILL.md) — test-first loop, the ladder, the fences |
| **Reviewer** | the sophisticated one; opposite family from the builder, fresh per round | [`agents/bottega-reviewer.md`](agents/bottega-reviewer.md) → [`skills/reviewing/SKILL.md`](skills/reviewing/SKILL.md) — break it, test ratchet, architectural conformance |
|  **QA** | drives the artifact as a user; evidence or it didn't happen | [`agents/bottega-qa.md`](agents/bottega-qa.md) → [`skills/qa/SKILL.md`](skills/qa/SKILL.md) |

Models are never pinned in agent files — the maestro routes per dispatch from the axis table in its skill (intelligence > taste > cost; implementation defaults to codex at xhigh; the Claude worker seat is opus-4.8 at high; user-facing needs taste ≥ 7; review always the opposite family; never Haiku; standing permission to escalate).

One design discipline spans the dispatch seam: [`skills/codebase-design`](skills/codebase-design/SKILL.md) — a shared vocabulary (module, interface, depth, seam, adapter), deep-module principles, and a `CONCEPTS.md` domain glossary maintained in the host repo. The maestro designs by it, the dossier carries it, the reviewer judges conformance against it. Defined once, so the two sides of the seam cannot drift apart. That is also the constraint budget made visible: workers get fences and ratchets to follow to the letter; the maestro gets gates, decisions, and this discipline — inside the gates, its judgment is deliberately unconstrained. The discipline is a house-style decision, not a leash: which design school this shop follows is exactly the kind of call doctrine exists to pin.

Doctrine is saved; control flow is authored fresh per run — a stored pipeline is a plan document wearing a costume. The maestro orchestrates each run as a workflow it writes on the spot, dispatching the fleet through the gates below. That workflow is disposable: its resume cache is scoped to the maestro's own session and dies with it. A run outlives any session, so the durable state is never the workflow — it is the run branch itself, always re-derivable from the last commit's grammar (`RED` → `green` → `integrate`), the lock, and the per-sha evidence dir. Re-entering a dropped run means reading that state and authoring fresh control flow, never replaying a dead workflow. The invariant gates:

```
commission signed (HTML gate → bottega sign) ─▶ acceptance RED
  ─▶ maestro designs the architecture ─▶ slices built in worktrees (one task per invocation)
  ─▶ reviewer rounds: fresh opposite-family reviewer ×≤8, persistent worker, maestro arbitrates
  ─▶ QA drives it ─▶ verify: lock + acceptance + mutation, evidence archived
  ─▶ cold read: fresh fable judge, commission-only context ─▶ delivery PR
```

Human gates are clickable HTML pages (approve / request changes), never walls of markdown. The entire run is isolated: branch `bottega/<spec-id>` in its own worktree, every commit lands there, and the PR is the only path to trunk — the patron's merge click is the only act that lands it. After delivery, the spec is rewritten into a closed, durable record pointing at code and evidence.

## The two artifacts a human ever reads

**In:** the commission (`docs/specs/NNNN-*.md` + `features/*.feature`) — intent in two sentences, non-goals, Given/When/Then with example values, a rendered prototype screenshot for UI work. One page, signed in minutes.

**Out:** the delivery PR — scenario checklist, evidence from `.bottega/verify/<sha>/`, findings fixed, and the decisions log: every call the commission underdetermined, made and flagged, because decisions in an unsupervised run are reviewed after, not asked before.

## This repo

Bottega built through its own loop (commission 0001): the `bottega` CLI.

```
bottega sign      # hash features/**/*.feature into .bottega/commission.lock
bottega verify    # clean → 0 · drift (modified/removed/added) → 1 · unsigned → 2 · corrupt → 3
```

Layout: `src/` + `bin/` the CLI · `tests/` unit · `features/` signed commission · `build/` IR · `acceptance/generated/` generated entrypoints · `handlers/` step handlers · `.bottega/` runtime (pinned toolchain in `aps.lock`, evidence in `verify/<sha>/`, worktrees in `wt/`).

```bash
npm install
npm test                                   # unit + generated acceptance
node bin/bottega.js verify                 # this repo verifies its own commission
```

Requires Node ≥ 22.18 (the bin shim runs TypeScript through native type stripping).

## Install

```
/plugin marketplace add vadimcomanescu/bottega
/plugin install bottega@bottega
```

That is the whole install. The plugin carries everything: the maestro skill, the three actor skills, the agents, the sign/verify CLI (dependency-free — it runs straight from the plugin root, no npm install), and the sign-off template. Two requirements the run checks itself and fails loudly without: Node ≥ 22.18 and the codex plugin (cross-family dispatch). On a host's first run the maestro bootstraps the [acceptance-pipeline-kit](https://github.com/vadimcomanescu/acceptance-pipeline-kit) toolchain into `.bottega/` and pins its hashes in `aps.lock` — never a manual step. Wiring `bottega verify` into the host's delivery gate is part of the first delivery, not setup.

Then commission work with `/bottega <task>`. The maestro seat is fable-tier: run the session on the strongest model available — loaded on a lower tier, the skill says so instead of proceeding silently.

## Provenance

The doctrine in `skills/` is extracted and owned, not pointed at — a doctrine file that says "follow X" is a reference an agent must dereference every run and can never be held accountable to; owned sentences are a contract. Read from the sources once, then self-contained; bottega never loads methodology from a host. Credits: the [Acceptance Pipeline Specification](https://github.com/unclebob/Acceptance-Pipeline-Specification) (Robert C. Martin) via its [multi-language kit](https://github.com/vadimcomanescu/acceptance-pipeline-kit) for the executable-acceptance layer · Pocock's LANGUAGE vocabulary (module / interface / depth / seam / deletion test) and skill-writing craft · [ponytail](https://github.com/DietrichGebert/ponytail)'s ladder — lazy, not negligent · Osmani's long-running-agents learnings (separate generation from evaluation; the test ratchet) · Ousterhout's deep modules · run mechanics validated in the June 2026 bottega playgrounds (worktrees, pinned toolchains, per-sha evidence archives).
