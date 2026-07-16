# bottega-dex

Bottega Dex is the Codex-native sibling of Bottega. It takes one task or issue to a reviewed, evidence-backed pull request. Never apply changes from this repository to `/Users/vadimcomanescu/Code/bottega` unless the user explicitly requests a separate port.

## Map

| Path | Purpose |
| --- | --- |
| `.agents/plugins/marketplace.json` | Public Codex marketplace entry |
| `plugins/bottega-dex/.codex-plugin/plugin.json` | Installable plugin manifest |
| `plugins/bottega-dex/skills/run/SKILL.md` | The single user-facing workflow |
| `plugins/bottega-dex/skills/run/references/agents` | Worker prompts passed to native subagents and Claude |
| `plugins/bottega-dex/skills/run/references` | Design rules, panel method, and structured report contracts |
| `plugins/bottega-dex/scripts/claude-exec` | Bounded `claude -p` adapter for cross-family review and panel roles |
| `tests` | Packaging, orchestration, adapter, and schema contracts |

## Rules

- Write plain engineering English. Do not use em dashes, metaphors, theatrical names, or invented process vocabulary.
- The active Codex task orchestrates. Codex workers use native subagents. Never start a second Codex process.
- The plugin exposes one skill and requires no host-agent setup or hooks.
- Use GPT-5.6 Sol at Ultra for orchestration, Luna or the documented efficient route at high for substantial mechanical work, and Sol at high for sophisticated workers. The costly-decision panel is the exception: each draft takes the strongest route its family exposes.
- The complete integrated diff always receives one cold Codex review and one cold Claude review against the same frozen target and common schema. Neither reviewer sees the other report. This gate is never replaced by slice review.
- `claude-exec` is the only external model boundary. It owns model, effort, permissions, tools, structured output, and timeout.
- Use one task worktree and one builder at a time. Keep implementation writes sequential in that worktree.
- Keep focused checks green while building and run the host's decisive full gate before delivery.
- QA drives the reviewed artifact and never fixes it. Evidence must match the changed surface.
- The user approves deploys, money movement, destructive actions, and changes to shared or production data.
- Preserve unrelated changes. Use `apply_patch` for edits and stage explicit paths.

## Verification

Run:

```bash
npm test
npm run typecheck
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/bottega-dex
```

For adapter changes, also run the dry-run contract tests and one minimal real structured-output smoke call.
