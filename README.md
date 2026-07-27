# Bottega Dex

Bottega Dex takes one substantial task, bug, or issue through Bottega's delivery procedure using native Codex orchestration:

```text
start → discover → orchestrate → dual code review → QA → close
```

Discovery settles the direction, then `maestro` executes the upstream `orchestrate` instructions directly.

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

1. `start` takes on the work, settles release intent, creates the run branch and worktree, reads the repository's commands, and confirms GitHub plus both review routes.
2. `discover` reads the repository and relevant current sources, finds blind spots, and settles the direction and boundaries with the user.
3. `maestro` runs the embedded `orchestrate` instructions on the original request and discovery findings. It delegates useful work to native Codex subagents, integrates the results, and runs the repository's decisive gate.
4. `code-review` runs Bottega's vendored autoreview helper on the complete integrated diff with GPT-5.6 Sol high and Claude Opus 5 high.
5. `qa` drives every changed product scenario on the accepted review head and records evidence-backed verdicts.
6. `close` confirms the review and QA records match the published head, files follow-ups, opens the pull request, and reports its checks and merge state.

Review and QA issues are fixed with subagents according to their size and the repository's implementation methodology, then checked again before publication continues.

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
    orchestrate/SKILL.md
    code-review/
      SKILL.md
      LICENSE
      references/
        autoreview.md
        smell-baseline.md
      scripts/
        autoreview
        test-review-harness
      tests/
        test_autoreview_hardening.py
    qa/SKILL.md
    close/
      SKILL.md
      references/qa-evidence.md
```

The bundled `orchestrate` skill is an exact copy of [provencher/codex-skills `orchestrate/SKILL.md`](https://github.com/provencher/codex-skills/blob/main/orchestrate/SKILL.md), retrieved from commit [`8aa6c42`](https://github.com/provencher/codex-skills/commit/8aa6c42b73781c905c55f8a1253a18127079ac21). Its instruction paragraph is also embedded verbatim in `maestro`. The upstream copyright notice is preserved in [LICENSE](LICENSE).

The surrounding procedures are adapted from [Bottega](https://github.com/vadimcomanescu/bottega/tree/4384beee72b5f45498fada686db1751d6ca78159/skills) for native Codex orchestration.

## Autoreview

After the repository's decisive gate passes, `code-review` runs the vendored Bottega autoreview helper on the integrated branch diff. The panel is pinned to:

- GPT-5.6 Sol at high reasoning;
- Claude Opus 5 at high effort.

The active Codex task verifies every finding. Accepted issues are fixed with subagents, the affected checks run again, and the same dual autoreview panel repeats until clean.

Anthropic documents `claude-opus-5` as the full pinned model name; the `opus` alias instead tracks the latest permitted Opus release. See [Claude Code model configuration](https://docs.anthropic.com/en/docs/claude-code/model-config.md).

## Claude adapter

`plugins/bottega-dex/scripts/claude-exec` remains available as the bounded direct Claude adapter requested for the plugin. It invokes `claude -p` with Claude Opus 5 at high effort, structured output, bounded execution, model-usage provenance, and frozen-target checks. The code-review workflow itself uses the vendored autoreview helper, matching Bottega.

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
