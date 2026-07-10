# bottega

An autonomous long-running agent system built for Fable to orchestrate. Read `README.md` for the model; this file is the working agreement for agents inside this repo.

## Map

| Path | What it is |
| --- | --- |
| `.claude-plugin/` | Plugin + marketplace manifests — one-command install (`/plugin marketplace add vadimcomanescu/bottega`) |
| `skills/run/SKILL.md` | The whole loop in one command (`/bottega:run`) — a thin sequencer: triage (patch-shaped work exits to `skills/patch`), `skills/spec`, then on SIGNED `skills/execute`; owns nothing but the seams |
| `skills/patch/SKILL.md` | The small job (`/bottega:patch`) — a fix or small improvement with no contract to sign; skips spec doc, `features/`, gate, QA reel, and mutation; keeps isolation, opposite-family review, and the PR |
| `skills/execute/SKILL.md` | Maestro run doctrine (`/bottega:execute`) — expects a signed, unexecuted spec and refuses anything else; architecture authority, routing, the review loop, delivery, the spec close-out |
| `skills/spec` | The commission — blindspot pass, interview, panel-drafted contract (`docs/specs/<YYYY-MM-DD>-<feature-slug>.md`), Direction, shot list; the cross-read guards the solo-drafted path; scenario text lives only in `features/`, authored directly — the doc points, never copies; standalone via `/bottega:spec` (the gate is then the finish line); unattended (`--unattended`, or the user's explicit word) — the pointed issue is the interview, the sign cascades without the gate, the issue thread becomes the status surface. Template in `references/` |
| `skills/panel` | Drafting instrument for hard one-shot artifacts — same prompt to independent frontier panelists, blinded; a judge that only compares (five questions); the maestro writes the final from the comparison. The spec contract is drafted this way by default; seats authored in its bundled workflow script |
| `skills/implementing`, `skills/reviewing`, `skills/qa`, `skills/documenting`, `skills/storyboarding` | Self-contained actor methodology (nothing loaded from any host pack); storyboarding is the render seat — fidelity follows the information: captures where a screen exists and changes, wireframes where it doesn't; documenting is the end-of-run doc-sync seat — host agent docs made true of what shipped, reviewed like code |
| `skills/codebase-design` | House design discipline — vocabulary, deep-module principles, `CONCEPTS.md` domain glossary; defined once, used on both sides of the dispatch seam: maestro designs by it, dossiers carry it, reviewers judge against it |
| `skills/signoff` | User gate — the collaborative spec doc (storyboards inline, comment loop, `SIGNED` as a comment); the standing header and doc skeleton in `references/`, the local canvas (full parity, for refused hosting) in `assets/` |
| `agents/` | Actor identity: builder, reviewer, qa, documenter, storyboarder, mechanic, panelist, panel-judge — agent files point at methodology, never copy it, and never pin model or effort; routing lives in the maestro's table (the panel's, in its bundled workflow script), enforced by the route guard |
| `hooks/` | Route guard (PreToolUse) — named worker seats always, and while a run is live (`.bottega/wt/` entry) **any** dispatch: rejected when it omits `model`, names fable (cold read passes by naming itself), or misroutes a named seat off its table model; entry guard (UserPromptSubmit) points run-intent prose at the entry commands. The fable fence, harness-enforced |
| `docs/specs/` | Spec contracts (intent, non-goals, decisions log) — closed records of delivered commissions |
| `tests/` | Unit tests for the hooks |

In host repos, a run's working state (toolchain, evidence, worktrees, gate records) lives under `.bottega/`, gitignored; the committed artifacts are the spec doc, `features/*.feature`, and the step handlers in the host's test tree. Evidence the user sees lives in the delivery PR, never in committed archives — the one exception is the never-merged proof-reel evidence branch (`bottega/evidence-<feature-slug>`), reaped at Close.

## Rules

- Approval lands the spec doc's status flip and `features/` in one sign commit. Nothing is locked on disk: the delivery PR prints the `features/` diff since that commit, and the user reading it is the whole mechanism.
- Verification gate: `npm test` (hook unit tests). A host run's delivery gate is the acceptance run plus the acceptance mutation run, survivors killed or justified in the PR body.
- Never pipe test output inside a `&&` chain; redirect to a file and check the exit code.
- Editing doctrine (`skills/*`, `agents/*`), the test for every line: could the actor derive it from the repo or from competence? Cut it. Is it a decision they would otherwise have to guess? Keep it. Then read every worker fence as the weakest-equipped seat that will receive it — a codex seat has no slash commands, no subagents, no plugin root; a fence naming an affordance a seat lacks is a stall, not a rule.
- Spend the constraint budget on workers, not the maestro. Worker doctrine is fences and ratchets — hard rules, followed to the letter. Maestro doctrine is gates, decisions, and the house design discipline; inside the gates its judgment is unconstrained — over-prescribing a fable-tier seat degrades it. A doctrine idea defined in two skills is extracted into one skill both point at, never kept in sync by hand.
- Where a role's doctrine lives: a skill is doctrine consumed by more than one role or more than one runtime (codex seats read skills by path — that is why builder and reviewer methodology is a skill); behavior of exactly one role on one runtime still lives in its skill, with the agent file a pointer — agent files point, never summarize, because a summarized copy drifts.
- A seat is a context boundary before it is a worker: a dispatch buys a fresh window and returns a finished answer — the dispatcher reads answers, never transcripts. An instrument becomes a skill only when more than one role or phase consumes it; a seat earns an agent file only when its identity recurs across dispatches; everything else is a brief.
- Keep `CLAUDE.md` symlinked to this file.
