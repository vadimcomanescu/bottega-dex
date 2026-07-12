# bottega

Autonomous issue-to-PR runs for Claude Code. One command takes a task, bug, or GitHub issue to a reviewed, evidence-backed pull request.

```
/plugin marketplace add vadimcomanescu/bottega
/plugin install bottega@bottega

/bottega:run <task, or issue URL>
```

## What it does

`/bottega:run` turns the current Claude Code session into an orchestrator that:

1. Isolates the run in its own worktree and branch, and discovers the host's test, lint, typecheck, build, and run commands.
2. Reads the codebase, surfaces the unknowns the request never mentions, researches how others solve the same problem, and grills the user when the intent is unclear.
3. Presents a brief user-facing spec in the conversation: what changes, acceptance criteria, definition of done, wireframe mockups when UI is touched. The user's OK is the go signal.
4. Plans the work as vertical slices, and puts each costly decision (where the change lives, data shape, public contracts, dependency bets) to a panel of independent frontier models before building.
5. Dispatches builders in parallel where slices allow it, with the host's gates green after every slice and the full suite at every integrate.
6. Has the integrated diff reviewed once by two cold reviewers in parallel, one per model family, with schema-enforced reports; fixes get a single fresh reviewer each, and the rounds are hard-bounded.
7. Drives the product as a user and records it: a feature shown working, a bug shown gone, video and screenshots in the PR.
8. Syncs the host's docs to the diff and opens the PR carrying the spec, every decision made on the user's behalf, the review verdicts, and the QA evidence.

The user appears exactly twice: agreeing to the spec, and merging the PR.

## Requirements

- Claude Code running on the strongest available Claude model. The orchestrator role needs it, and the skill says so instead of proceeding silently on a lower tier.
- The [codex CLI](https://github.com/openai/codex), logged in. Cross-model review is never dropped (see below), so bottega checks for it before any run and fails loudly if it's missing.

Nothing else is assumed about the host repo. A run leaves nothing behind but the PR: working state is the worktree plus one gitignored owner file, both removed at delivery.

## Design decisions

**No engine.** This repo is markdown prompts plus two small hooks. There is no scheduler, queue, or state machine; orchestration uses what Claude Code already provides (tracked subagent dispatches, tracked background shells, workflows). Why: any orchestration machinery written here would duplicate the harness and drift from it, and prompts that lean on the harness get its reliability for free.

**Both-family review, always.** The integrated diff is reviewed cold by two reviewers in parallel, one per model family (codex and Claude), neither seeing the other's findings; each fix is rechecked by a single fresh reviewer. Why: same-family review inherits the generator's blind spots and produces confident false verification, and an opposite-family read covers every line whoever built it. This is the one step never dropped, whatever the size of the change, because it is what lets a user merge without reading the diff. Every reviewer returns one schema-enforced JSON report (`skills/reviewing/references/report.schema.json`) pinned to the exact SHAs it reviewed, so "review passed" is a state derivable from the reports, not a narrative. The rounds are bounded by design: the same finding open after two fix attempts stops the fixing, round 3 stops the review, and nothing ever dispatches round 4 automatically.

**Model routing is enforced, not suggested.** Worker roles map to fixed models (the routing table in `skills/run/SKILL.md`), and a PreToolUse hook (`hooks/route-guard.js`) rejects any dispatch or workflow that omits a model or routes a worker to the top-tier model. Why: a dispatch that omits a model silently inherits the orchestrator's model, the most expensive one, and in a measured run 103 of 132 dispatches did exactly that before this hook existed.

**The spec is a conversation, not a pipeline.** The spec is presented in the session and approved with a reply: acceptance criteria, definition of done, honest wireframes. Why: earlier versions carried a signed Gherkin pipeline (generated acceptance suites, hosted sign-off documents, feature-file mutation testing); in the field it burned hours building and reviewing its own test harness while catching zero product defects the review had not already caught. The proof the user actually consumes is the review plus the QA recording.

**QA is a witness.** QA drives the real artifact after review leaves the head clean, records the session that produced the verdict, and never fixes what it finds. Why: a claim is believable when the process that produced it could not have benefited from it being false; a QA that fixes grades its own work. Recordings publish from a never-merged evidence branch so they render in the PR, and the branch dies after merge: the evidence's job ends when the user merges.

**The PR is the only path to trunk.** Every run builds on its own branch in its own worktree; the user's checkout is never touched, and the merge click is the only human action that lands code. Why: an autonomous system should be unable to change what you run, only to propose it.

## Roles

Agent definitions in `agents/` say who a worker is; skills in `skills/` say how it works. Agent files never pin a model: the routing table (with reasoning effort per role) lives in [`skills/run/SKILL.md`](skills/run/SKILL.md) and is enforced by the hook.

| Role | Job | Model | Method |
| --- | --- | --- | --- |
| orchestrator | design, routing, arbitration, every judgment call | fable-5 | [`skills/run/SKILL.md`](skills/run/SKILL.md) |
| builder | implements one slice, test-first, inside a given interface | gpt-5.6-sol (high), or opus-4.8 (xhigh) for a user-facing slice | [`skills/implementing/SKILL.md`](skills/implementing/SKILL.md) |
| reviewer | tries to break the integrated diff, polices the tests, judges the design | gpt-5.6-sol (high) + opus-4.8 (xhigh) in round 1; gpt-5.6-sol (high) on fixes | [`skills/reviewing/SKILL.md`](skills/reviewing/SKILL.md) |
| qa | drives the built artifact as a user, records the evidence | opus-4.8 (high) | the QA rules in [`skills/run/SKILL.md`](skills/run/SKILL.md) |
| panelist / judge | blind recommendations on a costly decision / compare-only judgment | dispatched by the panel workflow | [`skills/panel/SKILL.md`](skills/panel/SKILL.md) |
| mechanical work | worktree setup, merges, gate re-runs, bulk reads; no judgment | sonnet-5 (low) | the closed command list in its dispatch |

One design vocabulary spans all of them: [`skills/codebase-design`](skills/codebase-design/SKILL.md) (deep modules behind small interfaces, plus a `CONCEPTS.md` domain glossary in the host repo). The orchestrator designs by it, builders receive it in their briefs, reviewers judge against it.

## Repo layout

```
skills/         run (the whole method), implementing, reviewing, panel, codebase-design
agents/         agent definitions: identity and a pointer to the skill, nothing else
hooks/          route guard (model routing) and entry guard (points prose at /bottega:run)
tests/          unit tests for the hooks and the review report contract
docs/specs/     closed records of delivered runs
```

## Development

```bash
npm install
npm test        # hook unit tests
```

## Credits

The discovery method (interviewing for unknowns) follows Thariq Shihipar's unknowns framework. The design vocabulary is John Ousterhout's deep modules. The build-then-review split follows Addy Osmani's long-running-agent notes. The review report contract (schema enforced at dispatch, a frozen review target, "clean" as a state derivable from the reports) adapts the architecture of [openclaw/agent-skills autoreview](https://github.com/openclaw/agent-skills/tree/main/skills/autoreview). The panel (blinded frontier drafts, a judge held to structured comparison) follows OpenRouter's [Fusion](https://openrouter.ai/blog/announcements/fusion-beats-frontier/), which measured fused frontier models beating any single one; bottega deviates in one place: the judge never writes the answer, synthesis stays with the orchestrator, which holds the run context the judge never sees.

## License

MIT
