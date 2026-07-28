# Bottega Dex

Bottega Dex ports Bottega's issue-to-pull-request workflow to Codex:

```text
start → discover → architect → Claude cross-read → orchestrate → code-review → QA → close
```

`panel` joins architecture only when an open decision is costly to reverse and cannot be settled by a cheap check.

## Install

```bash
codex plugin marketplace add vadimcomanescu/bottega-dex
codex plugin add bottega-dex@bottega-dex
```

Start a new Codex task, then invoke:

```text
$bottega-dex:maestro <task, bug, or issue URL>
```

`maestro` is opt-in because a run can perform substantial agent work and open a pull request.

The upstream orchestration method is also directly invocable:

```text
$bottega-dex:orchestrate <substantial task>
```

## Workflow

1. `start` settles whether the pull request should hold or merge on green, then creates the isolated branch and worktree and reads the repository's instructions and gates.
2. `discover` uses narrow read-only scouts and works with the user to settle the direction and boundaries.
3. `architect` makes the design, acceptance criteria, and independent vertical slices explicit. `panel` is available for the small set of consequential decisions that need model diversity.
4. `use-claude` sends the settled design and execution proposal to Claude Fable 5 at high effort for a read-only second opinion.
5. `maestro` invokes the exact upstream `orchestrate` skill. Native Codex subagents fan out across distinct slices, following `implement`; the main task integrates their work and retains approvals.
6. `code-review` runs the bundled Bottega autoreview method on the integrated code diff with GPT-5.6 Sol at high reasoning and Claude Opus 5 at high effort. Autoreview owns its Claude invocation.
7. `qa` drives the reviewed artifact through every affected user-visible scenario and records evidence-backed verdicts without editing product code.
8. `close` publishes the evidence, opens the pull request, applies the user's release choice, and reports the real checks and merge state.

Narrow read-only scouts use low reasoning with no inherited conversation. Routine implementation uses medium reasoning and difficult work uses high reasoning. Every agent receives distinct ownership, leaf workers do not delegate, and the main task remains available to the user.

Autoreview is for completed code diffs. Changes made only to skills or workflow prose are checked with deterministic plugin validation and forward-tested for Codex compatibility instead.

## Plugin structure

```text
plugins/bottega-dex/
  .codex-plugin/plugin.json
  scripts/
    claude-exec
    exec-common.js
  skills/
    maestro/SKILL.md
    start/SKILL.md
    discover/SKILL.md
    architect/
      SKILL.md
      references/
    panel/SKILL.md
    use-claude/SKILL.md
    orchestrate/
      SKILL.md
      agents/openai.yaml
    implement/SKILL.md
    code-review/
      SKILL.md
      LICENSE
      references/
      scripts/
      tests/
    qa/SKILL.md
    close/
      SKILL.md
      references/qa-evidence.md
```

The bundled `orchestrate` skill is byte-for-byte identical to [provencher/codex-skills `orchestrate/SKILL.md`](https://github.com/provencher/codex-skills/blob/main/orchestrate/SKILL.md), retrieved from commit [`8aa6c42`](https://github.com/provencher/codex-skills/commit/8aa6c42b73781c905c55f8a1253a18127079ac21). Its user-facing metadata lives in `skills/orchestrate/agents/openai.yaml`. The upstream copyright notice is preserved in [LICENSE](LICENSE).

The surrounding procedures are adapted from [Bottega at `72122a3`](https://github.com/vadimcomanescu/bottega/tree/72122a3/skills). Bottega's Fable and Opus worker roles become native Codex orchestration; its GPT cross-read becomes the direct Claude cross-read in `use-claude`.

## Review and Claude boundaries

The code-review directory carries Bottega's vendored autoreview method, helper, baselines, and tests. The integrated panel is pinned to GPT-5.6 Sol at high reasoning and Claude Opus 5 at high effort. Findings are verified against the real code path before accepted issues are repaired and reviewed again.

`use-claude` is the read-only Claude path used for design cross-reads and a panel seat. It invokes Claude Fable 5 at high effort through `claude -p` directly. The existing `scripts/claude-exec` remains a separate bounded reviewer-role adapter using Claude Opus 5 high; autoreview does not call it.

## Verify

```bash
npm ci
npm test
npm run typecheck
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/bottega-dex
```

Adapter changes also require the adapter dry-run contract tests and one minimal real structured-output smoke call.

## License

MIT
