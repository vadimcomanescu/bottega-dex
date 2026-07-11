# bottega

Autonomous issue-to-PR runs for Claude Code, built for Fable to orchestrate: one command takes a task or issue to a delivered PR, unassisted. Read `README.md` for the model; this file is the working agreement for agents inside this repo.

## Map

| Path | What it is |
| --- | --- |
| `.claude-plugin/` | Plugin + marketplace manifests — one-command install (`/plugin marketplace add vadimcomanescu/bottega`) |
| `skills/run/SKILL.md` | The single entry (`/bottega:run`) and the orchestrator's whole method: discovery, the plan, harness-native orchestration, the routing table, the review loop, delivery, resume. `references/` carry the codex dispatch format and the parallel-slice integration protocol |
| `skills/spec` | The spec instrument — spec doc (`docs/specs/<YYYY-MM-DD>-<feature-slug>.md`), scenarios authored directly in `features/`, the acceptance toolchain installed at run start, the gate handoff, the unattended sign. Part of the plan only when the work introduces product behavior worth signing; never automatic. Template in `references/` |
| `skills/signoff` | The gate — one collaborative spec doc, comment loop, `SIGNED` cascade; the standing header in `references/`, the local canvas in `assets/` |
| `skills/panel` | Drafting tool for hard one-shot artifacts — independent frontier panelists, blinded; a compare-only judge; the orchestrator synthesizes. Panelists are dispatched by its bundled workflow script |
| `skills/implementing`, `skills/reviewing`, `skills/qa`, `skills/documenting`, `skills/storyboarding` | Self-contained worker method, loaded by dispatched workers by path — nothing loaded from any host pack |
| `skills/codebase-design` | House design rules — vocabulary, deep-module principles, `CONCEPTS.md` domain glossary; the orchestrator designs by them, briefs carry them, reviewers judge against them |
| `agents/` | Worker identity: builder, reviewer, qa, documenter, storyboarder, mechanic, panelist, panel-judge — agent files point at their skill, never copy it, and never pin model or effort; routing lives in the orchestrator's table, enforced by the route guard |
| `hooks/` | Route guard (PreToolUse) — named worker agents always, and any dispatch from a session that owns a live run (`.bottega/wt/<feature-slug>/` + `.bottega/run/<feature-slug>/owner`): rejected when it omits `model`, names fable (a cold read passes by naming itself), or misroutes a named worker. Entry guard (UserPromptSubmit) points run-intent prose at `/bottega:run` |
| `docs/specs/` | Closed records of delivered runs |
| `tests/` | Unit tests for the hooks |

In host repos, a run's working state lives under `.bottega/`, gitignored; the committed artifacts are the PR and, on spec runs, the spec doc, `features/*.feature`, and the step handlers in the host's test tree. Evidence the user sees lives in the delivery PR — the one exception is the never-merged evidence branch (`bottega/evidence-<feature-slug>`), deleted after merge.

## Rules

- Orchestration is the harness: tracked dispatches, tracked background Bash, workflows — never a polling loop, a hand-rolled scheduler, or a liveness apparatus in prose. An instruction line that restates or replaces a harness capability is a defect.
- The plan is the orchestrator's decision, stated to the user before building: every run gets isolation, a build, host gates green, cross-family review, and a PR; anything more exists for a stated reason, named in the PR. Cross-family review is the one thing never dropped.
- Approval on a spec run lands the spec doc's status flip and `features/` in one sign commit; the delivery PR prints the `features/` diff since that commit, and the user reading it is the whole mechanism.
- Verification gate: `npm test` (hook unit tests). Never pipe test output inside a `&&` chain; redirect to a file and check the exit code.
- Editing the skills (`skills/*`, `agents/*`), two tests per line: could the worker derive it from the repo or from competence — and would plain Fable already do it better with no instruction? Either way, cut it. Then read every worker rule as the weakest-equipped worker that will receive it — a codex worker has no slash commands, no subagents, no plugin root.
- Spend the constraint budget on workers, not the orchestrator. Worker instructions are hard rules; orchestrator instructions are gates, decisions, and the house design rules — inside the gates its judgment is unconstrained.
- Where a role's instructions live: a skill is method consumed by more than one role or more than one runtime; behavior of exactly one role on one runtime lives in its skill, with the agent file a pointer — agent files point, never summarize.
- A dispatch is a context boundary before it is a worker: it buys a fresh window and returns a finished answer — the dispatcher reads answers, never transcripts.
- Keep `CLAUDE.md` symlinked to this file.
