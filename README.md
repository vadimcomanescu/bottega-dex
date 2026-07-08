# bottega

An autonomous long-running agent system built for Fable to orchestrate.

The operating model: the user signs a one-page commission, a fleet of agents builds, reviews, and examines the work autonomously, and the delivery is a PR with evidence. The maestro (Fable) holds all design and routing authority; worker agents execute. The user interacts exactly twice — signing the commission and receiving the delivery — and the run is otherwise unsupervised.

## Why it holds without supervision

Unsupervised runs fail by satisfying a proxy for the goal, so every gate that can be mechanical is mechanical:

- **The contract is executable.** Commissions are Gherkin feature files. The [Acceptance Pipeline](https://github.com/vadimcomanescu/acceptance-pipeline-kit) parses them to JSON IR and *generates* the test entrypoints — no hand translation between what the user signed and what runs.
- **The contract is in plain sight.** The `SIGNED` cascade lands the spec doc and the feature files in one sign commit — the contract's last legitimate write — after `gate-diff` proves the page the user signed is `gate-render`'s reading of those files, block for block — the user reads plain-English walkthroughs, the repo keeps the Gherkin, and a shipped deterministic renderer is the only thing between them, so nothing hand-translated can drift. From there the delivery PR's diff is the drift detector: any later touch of a signed feature file shows up as a contract change beside the code, where the user reviews it. A dedicated lock file once held this guarantee, but the lock was itself a committed file an actor could edit, so it never held more than git and PR review already hold — it was ceremony, and it's gone. An anti-forgery layer briefly policed lookalike walkthroughs on the gate page too; adversarial tooling against your own agents is a treadmill that model progress obsoletes, and it's gone the same way — `gate-diff` detects drift, and a page that lies has no durable cover: a promise that never entered the feature files conspicuously never comes back proven at delivery.
- **The wiring is proven, not assumed.** Acceptance mutation flips example values in the IR and requires the suite to fail. A surviving mutation means a handler ignores a signed value — that is a finding, killed or justified in the delivery PR where the user can veto the justification. Honest ceiling: mutation proves the tests read the signed values, not that the scenarios cover intent — that judgment stays human, made once, at sign-off.
- **Fresh eyes are different weights.** Every diff is reviewed cold by the *complement* of whoever built it — a Claude-built slice gets a non-Claude adversary, a Codex-built slice a non-Codex one, never its own family. Same-family review inherits the generator's blind spots and looks like verification without being it.

The standing objection: the maestro is smart — why not let it simply read the work and judge it? Because it is both orchestrator and arbiter; its reading as ground truth would be the same mind approving its own decisions. And better builders make the gates more load-bearing, not less — a weak builder games a test vacuously and gets caught in review; a strong builder under gate pressure writes tests that survive review while checking nothing, which only execution catches (flip a signed value; the suite must fail). The gates are the substitute for ceremony, not an addition to it: three mechanical checks carry what judge panels, checklists, and a watching human would otherwise have to — which is what lets the doctrine stay thin and the user actually leave. Trust here is structural, not reputational. The one place the maestro's own weights do judge — the final cold read before the PR — strips what actually biases self-judgment: not the weights but the authorship. A fresh fable instance reads commission against artifact with none of the run's context, and an overruled cold-read finding lands in the PR for the user to see.

## The cast

Agents say who; skills say how. Both ship in this repo — bottega assumes nothing about the host except the codex CLI (checked before any run; absent → fail loudly).

| Actor | Identity | Methodology |
| --- | --- | --- |
| **Maestro** (Fable) | architect, planner, router, arbiter — all design authority | [`skills/spec/SKILL.md`](skills/spec/SKILL.md) + [`skills/execute/SKILL.md`](skills/execute/SKILL.md), sequenced by [`skills/run/SKILL.md`](skills/run/SKILL.md) |
| **Implementor** | one dossier to green, deliberately simple | [`agents/bottega-builder.md`](agents/bottega-builder.md) → [`skills/implementing/SKILL.md`](skills/implementing/SKILL.md) — test-first loop, the ladder, the fences |
| **Reviewer** | the sophisticated one; opposite family from the builder, fresh per round | [`agents/bottega-reviewer.md`](agents/bottega-reviewer.md) → [`skills/reviewing/SKILL.md`](skills/reviewing/SKILL.md) — break it, test ratchet, architectural conformance |
|  **QA** | drives the artifact as a user; evidence or it didn't happen | [`agents/bottega-qa.md`](agents/bottega-qa.md) → [`skills/qa/SKILL.md`](skills/qa/SKILL.md) |
| **Documenter** | one dispatch after the last integrate; makes the host's agent-facing docs true of what shipped | [`agents/bottega-documenter.md`](agents/bottega-documenter.md) → [`skills/documenting/SKILL.md`](skills/documenting/SKILL.md) — diff-warranted edits only, docs match code, reviewed like code |

Models are never pinned in agent files — the maestro routes per dispatch from the axis table in its skill (intelligence > taste > cost; implementation defaults to codex at xhigh; the Claude worker seat is opus-4.8 at high; user-facing needs taste ≥ 7; review always the opposite family — opus-4.8 or codex at xhigh, while fable is dispatched exactly twice a run: the maestro seat and the cold read; never Haiku; standing permission to escalate).

One design discipline spans the dispatch seam: [`skills/codebase-design`](skills/codebase-design/SKILL.md) — a shared vocabulary (module, interface, depth, seam, adapter), deep-module principles, and a `CONCEPTS.md` domain glossary maintained in the host repo. The maestro designs by it, the dossier carries it, the reviewer judges conformance against it. Defined once, so the two sides of the seam cannot drift apart. That is also the constraint budget made visible: workers get fences and ratchets to follow to the letter; the maestro gets gates, decisions, and this discipline — inside the gates, its judgment is deliberately unconstrained. The discipline is a house-style decision, not a leash: which design school this shop follows is exactly the kind of call doctrine exists to pin.

Doctrine is saved; control flow is authored fresh per run — a stored pipeline is a plan document wearing a costume. The maestro orchestrates each run as a workflow it writes on the spot, dispatching the fleet through the gates below. That workflow is disposable: its resume cache is scoped to the maestro's own session and dies with it. A run outlives any session, so the durable state is never the workflow — it is what git holds: the run branch plus the slice worktrees and clones under `.bottega/wt/`, re-derivable from the last commit's grammar (`RED` → `green` → `integrate`), the signed spec doc, and the evidence dir under `.bottega/verify/<feature-slug>/`. Re-entering a dropped run means sweeping that state for finished-but-uncommitted work, then authoring fresh control flow — never replaying a dead workflow. The invariant gates:

```
commission signed (hosted gate → sign commit) ─▶ acceptance RED
  ─▶ maestro designs the architecture ─▶ slices built in worktrees (one task per invocation)
  ─▶ reviewer rounds: fresh opposite-family reviewer ×≤8, persistent worker, maestro arbitrates
  ─▶ host docs synced to what shipped (reviewed like code) ─▶ QA drives it
  ─▶ verify: acceptance + mutation, evidence archived
  ─▶ cold read: fresh fable judge, commission-only context ─▶ delivery PR
```

Human gates are clickable HTML pages (approve / request changes), never walls of markdown. The entire run is isolated: branch `bottega/<feature-slug>` in its own worktree, every commit lands there, and the PR is the only path to trunk — the user's merge click is the only act that lands it. After delivery, the spec is rewritten into a closed, durable record pointing at code and evidence.

## The two artifacts a human ever reads

**In:** the commission — `docs/specs/<YYYY-MM-DD>-<feature-slug>.md` plus the `features/*.feature` files it points at: intent in two sentences, non-goals, a Direction (the domain-model delta and the hard-to-reverse calls, in plain words), each scenario as a plain numbered walkthrough carrying its example values (the Gherkin itself stays in the repo; a shipped renderer proves the two identical at sign), and a storyboard of rendered screens per signed flow for UI work. One page of contract prose, signed in minutes.

**Out:** the delivery PR — scenario checklist, the evidence in the PR body, per-slice provenance (who built, who reviewed, families and models), findings fixed, and the decisions log: every call the commission underdetermined, made and flagged, because decisions in an unsupervised run are reviewed after, not asked before.

## This repo

Prompts, two guards, one renderer, one check — no engine. Layout: `skills/` the doctrine · `agents/` actor identity · `hooks/` the route and entry guards · `skills/signoff/assets/gate-render.mjs` the feature-file→walkthrough renderer · `skills/signoff/assets/gate-diff.mjs` the sign-blocking check that the signed page carries its output verbatim · `tests/` unit tests for the guards, the renderer, and the check · `docs/specs/` closed records of delivered commissions.

```bash
npm install
npm test          # guard + gate-render + gate-diff unit tests
```

## Install

```
/plugin marketplace add vadimcomanescu/bottega
/plugin install bottega@bottega
```

That is the whole install. The plugin carries everything: the maestro skill, the actor skills, the agents, the guards, and the sign-off machinery. One requirement the run checks itself and fails loudly without: the codex CLI (cross-family dispatch). On a host's first run a dispatched clerk bootstraps the [acceptance-pipeline-kit](https://github.com/vadimcomanescu/acceptance-pipeline-kit) toolchain into `.bottega/` (gitignored) and pins its hashes in `aps.lock` — never a manual step, and never maestro tokens.

Then commission work with `/bottega:run <task>` — the whole loop in one sitting — or split it: `/bottega:spec <task>` signs a commission without running it, and `/bottega:execute <feature-slug>` later runs a signed one (it refuses anything unsigned or already run). The maestro seat is fable-tier: run the session on the strongest model available — loaded on a lower tier, the skill says so instead of proceeding silently.

## Provenance

The doctrine in `skills/` is extracted and owned, not pointed at — a doctrine file that says "follow X" is a reference an agent must dereference every run and can never be held accountable to; owned sentences are a contract. Read from the sources once, then self-contained; bottega never loads methodology from a host. Credits: the [Acceptance Pipeline Specification](https://github.com/unclebob/Acceptance-Pipeline-Specification) (Robert C. Martin) via its [multi-language kit](https://github.com/vadimcomanescu/acceptance-pipeline-kit) for the executable-acceptance layer · Pocock's LANGUAGE vocabulary (module / interface / depth / seam / deletion test) and skill-writing craft · [ponytail](https://github.com/DietrichGebert/ponytail)'s ladder — lazy, not negligent · Osmani's long-running-agents learnings (separate generation from evaluation; the test ratchet) · Ousterhout's deep modules · run mechanics validated in the June 2026 bottega playgrounds (worktrees, pinned toolchains, per-sha evidence archives).
