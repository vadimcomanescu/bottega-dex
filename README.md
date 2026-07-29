# Bottega Dex

Bottega Dex ports Bottega's issue-to-pull-request workflow to Codex:

```text
start → discover → architect when needed → panel when its three conditions hold → Claude cross-read when reversal is costly → orchestrate → code-review → QA when user-facing behavior changes → close
```

Architect runs only when the design, acceptance criteria, or slices need settling. `panel` runs only when a decision is open, costly to reverse, and cannot be settled by a cheap check. The Claude cross-read runs only when a poor design would be costly to reverse. QA runs only when a user-facing surface or product behavior changed.

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

To scan for the strongest codebase improvement, choose one candidate, and take it through Maestro:

```text
$bottega-dex:improve [area or direction]
```

`improve` is also opt-in. It checks code and change-history hot spots, checks open issues and pull requests for collisions, presents its strongest candidates in the conversation, and waits for your choice before starting a run. The accepted scan becomes Maestro's discovery, so the run does not repeat it.

The upstream orchestration method is also directly invocable:

```text
$bottega-dex:orchestrate <substantial task>
```

To restate the last reply in plain language:

```text
$bottega-dex:bro
```

## Workflow

1. `start` settles whether the pull request should hold or merge on green, then creates the isolated branch and worktree and reads the repository's commands and documented merge procedure.
2. `discover` uses narrow read-only scouts and works with the user to settle the direction and boundaries.
3. After discovery, `maestro` states how much later process the work needs. It may skip a later phase only when nothing there is unclear and a wrong call is cheap to reverse. If the work grows, it re-enters skipped phases. The isolated branch and worktree, green project gates, whole-diff review, and pull request are the only phases or outcomes that are always required.
4. When needed, `architect` makes the design, acceptance criteria, and independent vertical slices explicit. `panel` is available for the small set of consequential decisions that need model diversity.
5. When a poor design would be costly to reverse, `use-claude` sends the settled design and execution proposal to Claude Fable 5 at high effort for a read-only second opinion.
6. `maestro` invokes the exact upstream `orchestrate` skill. Native Codex subagents fan out across distinct slices, following `implement`; the main task integrates their work and retains approvals. A single builder skips its slice review only when the structured whole-diff review will run. When the integrated diff falls under the `SKILL.md` and prose exception, one fresh high-reasoning reviewer checks the whole docs diff. Multiple builders receive fresh slice reviews before integration.
7. `code-review` runs the bundled Bottega autoreview method on the integrated code diff with GPT-5.6 Sol at high reasoning and Claude Opus 5 at high effort. Autoreview owns its Claude invocation.
8. QA is required when a user-facing surface or product behavior changed. In that case, `qa` drives the reviewed artifact through every affected user-visible scenario and records evidence-backed verdicts without editing product code. When no user-facing surface or product behavior changed, `maestro` skips QA.
9. `close` publishes the evidence, opens the pull request, and follows the repository's documented landing mechanism. Opening the PR arms a merge queue where the repository uses one; opener-armed GitHub auto-merge with a red hold check remains the fallback where the repository documents it.

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
    bro/
      SKILL.md
      agents/openai.yaml
    improve/
      SKILL.md
      agents/openai.yaml
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

The surrounding procedures are adapted from [Bottega at `1de2acabd1004ebd9cae697e89f9b2889571bea9`](https://github.com/vadimcomanescu/bottega/tree/1de2acabd1004ebd9cae697e89f9b2889571bea9/skills). Bottega's Fable and Opus worker roles become native Codex orchestration; its GPT cross-read becomes the direct Claude cross-read in `use-claude`. Bottega's queue-first merge doctrine is applied through the host repository's documented procedure rather than a hard-coded Mergify configuration.

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
