# bottega

Autonomous issue-to-PR runs for Claude Code. One command takes a task, bug, or GitHub issue to a reviewed, evidence-backed pull request with no human in the loop.

```
/plugin marketplace add vadimcomanescu/bottega
/plugin install bottega@bottega

/bottega:run <task, or issue URL>
```

## What it does

`/bottega:run` turns the current Claude Code session into an orchestrator that:

1. Reads the codebase and closes the open questions in the request, asking the user only what the repo can't answer, with a recommended default attached to each question.
2. States the plan before building: what will be built, how it will be verified, and why. The user's nod is the go signal.
3. Designs the change, splits it into vertical slices, and dispatches worker agents to build them on an isolated branch and worktree.
4. Has every diff reviewed by a model from the opposite family of the one that wrote it, in rounds, until no confirmed finding remains.
5. Opens a PR carrying the evidence: what changed and why, who built and who reviewed each slice, every finding and its resolution, and the verification output.

The user is involved at most twice: approving the spec when the work warrants one, and merging the PR. A small mechanical fix ships within the hour with nothing beyond what every run gets; work that changes product behavior can additionally get a signed spec, QA recordings, storyboards, and a docs pass, each added for a stated reason named in the PR.

## Requirements

- Claude Code running on the strongest available Claude model. The orchestrator role needs it, and the skill says so instead of proceeding silently on a lower tier.
- The [codex CLI](https://github.com/openai/codex), logged in. Cross-model review is never dropped (see below), so bottega checks for it before any run and fails loudly if it's missing.

Nothing else is assumed about the host repo. Run state lives under `.bottega/`, gitignored; the only committed artifacts are the PR and, on spec runs, the spec document and feature files.

## Design decisions

**No engine.** This repo is markdown prompts plus two small hooks. There is no scheduler, queue, or state machine; orchestration uses what Claude Code already provides (tracked subagent dispatches, tracked background shells, workflows). Why: any orchestration machinery written here would duplicate the harness and drift from it, and prompts that lean on the harness get its reliability for free.

**Both-family review, always.** The integrated diff is reviewed cold by two reviewers in parallel, one per model family (codex and Claude), neither seeing the other's findings; each fix that follows is rechecked by a fresh reviewer from the opposite family of the builder who wrote it. Why: same-family review inherits the generator's blind spots and produces confident false verification, and an opposite-family read covers every line whoever built it. This is the one step never dropped, whatever the size of the change, because it is what lets a user merge without reading the diff. Every reviewer returns one schema-enforced JSON report (`skills/reviewing/references/report.schema.json`) pinned to the exact SHAs it reviewed, so "review passed" is a state derivable from the evidence on disk, not a narrative.

**Model routing is enforced, not suggested.** Worker roles map to fixed models (a routing table in `skills/run/SKILL.md`), and a PreToolUse hook (`hooks/route-guard.js`) rejects any dispatch that omits a model or routes a worker to the top-tier model. Why: a dispatch that omits a model silently inherits the orchestrator's model, the most expensive one, and in a measured run 103 of 132 dispatches did exactly that before this hook existed.

**Specs only when they pay for themselves.** Work that introduces user-visible behavior gets a one-page spec plus Gherkin feature files, made executable by the [acceptance-pipeline-kit](https://github.com/vadimcomanescu/acceptance-pipeline-kit): test entrypoints are generated from the signed scenarios, so nothing is hand-translated between what the user approved and what runs. Approval happens in one collaborative document: comment to change anything, comment `SIGNED` to approve. Why the threshold: a signed spec brings a whole verification pipeline with it (acceptance suite, QA recordings of every scenario, mutation testing of the feature files), and forcing that onto a typo fix would bury small work in process.

**Unattended runs are explicit.** Handed an issue and told to run unattended, bottega treats the issue thread as the interview, signs the spec itself, and discloses that in the PR's first line, with status comments on the issue at every phase boundary. Why: an absent user should get decisions made and flagged for review at the PR, never a stalled run. Self-signing happens only on the user's explicit instruction.

**The PR is the only path to trunk.** Every run builds on its own branch in its own worktree; the user's checkout is never touched, and the merge click is the only human action that lands code. Why: an autonomous system should be unable to change what you run, only to propose it.

## Roles

Agent definitions in `agents/` say who a worker is; skills in `skills/` say how it works. Agent files never pin a model: the full routing table (with reasoning effort per role) lives in [`skills/run/SKILL.md`](skills/run/SKILL.md) and is enforced by the hook. The models below mirror it; every role that makes judgment calls runs on a top-tier model, and sonnet holds only the mechanic, where the work is short and judgment is forbidden by design.

| Role | Job | Model | Method |
| --- | --- | --- | --- |
| orchestrator | design, routing, arbitration, every judgment call | fable-5 | [`skills/run/SKILL.md`](skills/run/SKILL.md) |
| builder | implements one slice, test-first, inside a given interface | gpt-5.6-sol, or opus-4.8 for a user-facing slice | [`skills/implementing/SKILL.md`](skills/implementing/SKILL.md) |
| reviewer | tries to break the slice, polices the tests, judges the design | the opposite family from the builder (sol or opus-4.8) | [`skills/reviewing/SKILL.md`](skills/reviewing/SKILL.md) |
| qa | drives the built artifact as a user, records the evidence | opus-4.8 | [`skills/qa/SKILL.md`](skills/qa/SKILL.md) |
| documenter | updates the host's agent-facing docs to match what shipped | opus-4.8 | [`skills/documenting/SKILL.md`](skills/documenting/SKILL.md) |
| mechanic | executes fully specified command lists, no judgment calls | sonnet-5 | [`agents/mechanic.md`](agents/mechanic.md) |

One design vocabulary spans all of them: [`skills/codebase-design`](skills/codebase-design/SKILL.md) (deep modules behind small interfaces, plus a `CONCEPTS.md` domain glossary in the host repo). The orchestrator designs by it, builders receive it in their briefs, reviewers judge against it.

## Repo layout

```
skills/         the methodology, one skill per role plus run/spec/signoff/panel
agents/         agent definitions: identity and a pointer to the skill, nothing else
hooks/          route guard (model routing) and entry guard (points prose at /bottega:run)
tests/          unit tests for the hooks
docs/specs/     closed records of delivered runs
```

## Development

```bash
npm install
npm test        # hook unit tests
```

## Credits

The acceptance approach follows Robert C. Martin's [Acceptance Pipeline Specification](https://github.com/unclebob/Acceptance-Pipeline-Specification) via the [acceptance-pipeline-kit](https://github.com/vadimcomanescu/acceptance-pipeline-kit). The discovery method (interviewing for unknowns) follows Thariq Shihipar's unknowns framework. The design vocabulary is John Ousterhout's deep modules. The build-then-review split follows Addy Osmani's long-running-agent notes. The panel (blinded frontier drafts, a judge held to structured comparison) follows OpenRouter's [Fusion](https://openrouter.ai/blog/announcements/fusion-beats-frontier/), which measured fused frontier models beating any single one; bottega deviates in one place: the judge never writes the answer, synthesis stays with the orchestrator, which holds the run context the judge never sees.

## License

MIT
