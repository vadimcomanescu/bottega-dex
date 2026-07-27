# Bottega Dex

Bottega Dex takes one substantial task, bug, or issue through Bottega's delivery procedure using native Codex orchestration:

```text
open → discover → orchestrate → dual code review → QA → open PR
```

There is no separate specification or planning phase. Discovery settles the direction, then `maestro` executes the upstream `orchestrate` instructions directly for decomposition, implementation, integration, and proof.

## Install

```bash
codex plugin marketplace add vadimcomanescu/bottega-dex
codex plugin add bottega-dex@bottega-dex
```

Start a new Codex task, then invoke:

```text
$bottega-dex:maestro <task, bug, or issue URL>
```

`maestro` is intentionally opt-in because one run can perform substantial agent work and open a pull request.

## Workflow

1. `open` settles ownership and release intent, creates the run branch and worktree, reads the repository's commands, and confirms GitHub plus both review routes.
2. `discover` reads the repository and relevant current sources, finds blind spots, and settles the direction and boundaries with the user.
3. `maestro` runs the embedded `orchestrate` instructions on the original request and discovery findings. It delegates useful work to native Codex subagents, integrates the results, and runs the repository's decisive gate.
4. `code-review` freezes the complete integrated diff and starts two blind reviewers against separate checkouts of the same base, head, and tree.
5. `qa` drives every changed product scenario on the accepted review head and records evidence-backed verdicts.
6. `close` confirms the review and QA records match the published head, files follow-ups, opens the pull request, and reports its checks and merge state.

Any tracked repair returns through the same orchestration step. It then reruns the decisive gate, both blind reviews, and the affected QA scenarios before publication continues.

## Plugin structure

```text
plugins/bottega-dex/
  .codex-plugin/plugin.json
  scripts/
    claude-exec
    exec-common.js
  skills/
    maestro/SKILL.md
    open/SKILL.md
    discover/SKILL.md
    orchestrate/SKILL.md
    code-review/
      SKILL.md
      references/
        report.schema.json
        reviewer.md
    qa/SKILL.md
    close/
      SKILL.md
      references/qa-evidence.md
```

The bundled `orchestrate` skill is an exact copy of [provencher/codex-skills `orchestrate/SKILL.md`](https://github.com/provencher/codex-skills/blob/main/orchestrate/SKILL.md), retrieved from commit [`8aa6c42`](https://github.com/provencher/codex-skills/commit/8aa6c42b73781c905c55f8a1253a18127079ac21). Its instruction paragraph is also embedded verbatim in `maestro`. The upstream copyright notice is preserved in [LICENSE](LICENSE).

The surrounding procedures are adapted from [Bottega](https://github.com/vadimcomanescu/bottega/tree/4384beee72b5f45498fada686db1751d6ca78159/skills). Their ownership, worktree, discovery, QA, publication, hold, merge-state, and cleanup behavior remains intact. Claude-specific workers, spec, plan, build, and panel phases are replaced by the native Codex orchestrator.

## Integrated review

After all subagent work is integrated and the repository's decisive gate passes, `code-review` freezes the complete diff by base, head, and tree SHA. It starts two cold reviewers in parallel:

- a native Codex subagent on `gpt-5.6-sol` at high reasoning;
- Claude Code on the pinned `claude-opus-5` model at high effort through the bundled adapter.

Both reviewers use one report schema. Neither receives implementation history, candidate findings, or the other report. The active Codex task reproduces and arbitrates every finding. Any tracked fix invalidates both reports and requires a fresh blind pair.

Anthropic documents `claude-opus-5` as the full pinned model name; the `opus` alias instead tracks the latest permitted Opus release. See [Claude Code model configuration](https://docs.anthropic.com/en/docs/claude-code/model-config.md).

## Claude adapter

`plugins/bottega-dex/scripts/claude-exec` is the plugin's only external model boundary. It invokes `claude -p` only for the reviewer role, with Claude Opus 5 at high effort, structured output, bounded execution, model-usage provenance, and frozen-target checks.

The adapter requires an authenticated Claude Code installation and Node.js 24 or newer. Use `--dry-run` to inspect the bounded command without invoking Claude.

## Verify

```bash
npm ci
npm test
npm run typecheck
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/bottega-dex
```

Adapter changes also require its dry-run contract tests and one minimal real structured-output smoke call.

## License

MIT
