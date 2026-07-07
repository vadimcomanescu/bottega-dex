# bottega

An autonomous long-running agent system built for Fable to orchestrate. Read `README.md` for the model; this file is the working agreement for agents inside this repo.

## Map

| Path | What it is |
| --- | --- |
| `.claude-plugin/` | Plugin + marketplace manifests — one-command install (`/plugin marketplace add vadimcomanescu/bottega`) |
| `skills/run/SKILL.md` | The whole loop in one command (`/bottega:run`) — a thin sequencer: `skills/spec`, then on SIGNED `skills/execute`; owns nothing but the seam |
| `skills/execute/SKILL.md` | Maestro run doctrine (`/bottega:execute`) — expects a signed, unexecuted spec and refuses anything else; architecture authority, routing, the review loop, delivery, the spec close-out |
| `skills/spec` | The commission — interview, contract (`docs/specs/<YYYY-MM-DD>-<feature-slug>.md`), Direction, shot list, cross-read; scenario text lives only in `features/`, authored directly — the doc points, never copies; standalone via `/bottega:spec` (the gate is then the finish line). Template in `references/` |
| `skills/implementing`, `skills/reviewing`, `skills/qa`, `skills/documenting`, `skills/storyboarding` | Self-contained actor methodology (nothing loaded from any host pack); storyboarding is the render seat — admissible frames, real captures only; documenting is the end-of-run doc-sync seat — host agent docs made true of what shipped, reviewed like code |
| `skills/codebase-design` | House design discipline — vocabulary, deep-module principles, `CONCEPTS.md` domain glossary; defined once, used on both sides of the dispatch seam: maestro designs by it, dossiers carry it, reviewers judge against it |
| `skills/signoff` | User gate — the collaborative spec doc (storyboards inline, comment loop, `SIGNED` as a comment); `assets/` holds the local canvas for at-the-machine sessions and `gate-diff.mjs`, the sign-blocking check that the hosted doc carries the feature files verbatim |
| `agents/` | Actor identity: builder, reviewer, qa, documenter — each points at its skill; no model pins |
| `hooks/` | Route guard (PreToolUse) — worker seats always, and while a run is live (run branch or `.bottega/wt/` entry) **any** dispatch, rejected when it omits `model` or names fable (cold read passes by naming itself); entry guard (UserPromptSubmit) points run-intent prose at the three entry commands. The fable fence, harness-enforced |
| `docs/specs/` | Spec contracts (intent, non-goals, decisions log) — closed records of delivered commissions |
| `tests/` | Unit tests for the hooks and the gate-diff check |

In host repos, a run's working state (toolchain, evidence, worktrees, gate records) lives under `.bottega/`, gitignored; the committed artifacts are the spec doc, `features/*.feature`, and the step handlers in the host's test tree. Evidence the user sees lives in the delivery PR, never in committed archives.

## Rules

- `features/` in a host repo is frozen from the sign commit onward — by convention, in plain sight: any later edit surfaces in the delivery PR's diff as a contract change.
- Verification gate: `npm test` (hook + gate-diff unit tests). A host run's delivery gate is the acceptance run plus the acceptance mutation run, survivors killed or justified in the PR body.
- Never pipe test output inside a `&&` chain; redirect to a file and check the exit code.
- Editing doctrine (`skills/*`, `agents/*`), the test for every line: could the actor derive it from the repo or from competence? Cut it. Is it a decision they would otherwise have to guess? Keep it. Then read every worker fence as the weakest-equipped seat that will receive it — a codex seat has no slash commands, no subagents, no plugin root; a fence naming an affordance a seat lacks is a stall, not a rule.
- Spend the constraint budget on workers, not the maestro. Worker doctrine is fences and ratchets — hard rules, followed to the letter. Maestro doctrine is gates, decisions, and the house design discipline; inside the gates its judgment is unconstrained — over-prescribing a fable-tier seat degrades it. A doctrine idea defined in two skills is extracted into one skill both point at, never kept in sync by hand.
- Keep `CLAUDE.md` symlinked to this file.
