# bottega

An autonomous long-running agent system built for Fable to orchestrate. Read `README.md` for the model; this file is the working agreement for agents inside this repo.

## Map

| Path | What it is |
| --- | --- |
| `.claude-plugin/` | Plugin + marketplace manifests — one-command install (`/plugin marketplace add vadimcomanescu/bottega`) |
| `skills/bottega/SKILL.md` | Maestro doctrine — the entry point, gates, architecture authority, routing |
| `skills/implementing`, `skills/reviewing`, `skills/qa` | Self-contained actor methodology (nothing loaded from any host pack) |
| `skills/codebase-design` | House design discipline — vocabulary, deep-module principles, `CONCEPTS.md` domain glossary; defined once, used on both sides of the dispatch seam: maestro designs by it, dossiers carry it, reviewers judge against it |
| `skills/signoff` | Patron gate — the collaborative spec doc (storyboards inline, comment loop, `SIGNED` as a comment); branded local canvas kept in `assets/` for at-the-machine sessions |
| `agents/` | Actor identity: builder, reviewer, qa — each points at its skill; no model pins |
| `features/` | Signed commissions (Gherkin). **Locked after sign-off — never edit** |
| `docs/specs/` | Spec contracts (intent, non-goals, decisions log) |
| `src/`, `tests/` | The `bottega` CLI (`sign`, `verify`) and its unit tests |
| `handlers/` | APS step handlers wiring feature steps to the CLI |
| `build/`, `acceptance/generated/` | Derived: JSON IR and generated entrypoints. Regenerate, never hand-edit |
| `.bottega/` | Runtime: `aps.lock` (pinned toolchain), `verify/<sha>/` (evidence), `wt/<slice>/` (worktrees) |

## Rules

- `features/` after sign-off, `build/`, `acceptance/generated/`, `.bottega/commission.lock`: read-only for every actor. Drift fails `bottega verify`.
- Verification gate: `npm test` (unit + generated acceptance) and, at delivery, the acceptance mutation run with survivors killed or justified in `.bottega/verify/<sha>/equivalent-mutants.json`.
- Never pipe test output inside a `&&` chain; redirect to a file and check the exit code.
- Editing doctrine (`skills/*`, `agents/*`), the test for every line: could the actor derive it from the repo or from competence? Cut it. Is it a decision they would otherwise have to guess? Keep it.
- Spend the constraint budget on workers, not the maestro. Worker doctrine is fences and ratchets — hard rules, followed to the letter. Maestro doctrine is gates, decisions, and the house design discipline; inside the gates its judgment is unconstrained — over-prescribing a fable-tier seat degrades it. A doctrine idea defined in two skills is extracted into one skill both point at, never kept in sync by hand.
- Keep `CLAUDE.md` symlinked to this file.
