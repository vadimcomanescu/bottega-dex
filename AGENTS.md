# bottega-dex

Bottega Dex is the Codex-native Bottega workflow. `maestro` runs `start`, `discover`, embedded orchestration, blind dual `code-review`, `qa`, and `close` to deliver one task as a reviewed pull request.

Never apply changes from this repository to `/Users/vadimcomanescu/Code/bottega` unless the user explicitly requests a separate port.

## Map

| Path | Purpose |
| --- | --- |
| `.agents/plugins/marketplace.json` | Public Codex marketplace entry |
| `plugins/bottega-dex/.codex-plugin/plugin.json` | Installable plugin manifest |
| `plugins/bottega-dex/skills/maestro/SKILL.md` | User-facing end-to-end workflow |
| `plugins/bottega-dex/skills/start/SKILL.md` | Supporting ownership, isolation, and launch procedure |
| `plugins/bottega-dex/skills/discover/SKILL.md` | Supporting discovery procedure |
| `plugins/bottega-dex/skills/orchestrate/SKILL.md` | Exact upstream decomposition and implementation method |
| `plugins/bottega-dex/skills/close/SKILL.md` | Supporting publication, PR, and terminal-state procedure |
| `plugins/bottega-dex/skills/close/references/qa-evidence.md` | QA evidence publication procedure |
| `plugins/bottega-dex/skills/code-review/SKILL.md` | Integrated Sol and Claude Opus 5 review gate |
| `plugins/bottega-dex/skills/code-review/references` | Common reviewer method and report schema |
| `plugins/bottega-dex/skills/qa/SKILL.md` | Reviewed-head product QA procedure |
| `plugins/bottega-dex/scripts/claude-exec` | Bounded `claude -p` adapter |
| `plugins/bottega-dex/scripts/exec-common.js` | Shared adapter process and provenance helpers |
| `tests/plugin-contract.test.ts` | Package and upstream-copy contracts |
| `tests/claude-exec.test.ts` | Claude adapter contract tests |
| `tests/exec-common.test.ts` | Adapter helper tests |
| `tests/review-report.test.ts` | Shared review report schema tests |
| `tests/review-orchestration.test.ts` | Frozen two-family gate contracts |

## Rules

- Write plain engineering English. Do not use em dashes, metaphors, theatrical names, or invented process vocabulary.
- Keep `maestro` as the user-facing end-to-end workflow and `orchestrate` as its complete build method.
- The phase order is `start`, `discover`, `orchestrate`, `code-review`, `qa`, `close`.
- Discovery hands its findings directly to orchestration.
- The complete integrated diff always receives one cold native GPT-5.6 Sol review and one cold Claude Opus 5 review against separate checkouts of the same frozen target and common schema. Neither reviewer sees the other report.
- Use native subagents for Codex reviewers. Never start a second Codex process.
- Keep `claude-exec` as the only external model boundary and only for the Claude reviewer. It owns model, effort, permissions, tools, structured output, timeout, and target identity.
- Any tracked fix invalidates both reviews. Rerun the decisive gate and a fresh blind pair before close.
- QA drives the dual-reviewed artifact and never fixes product code. `close` must read matching accepted review and QA records and publish only their exact head and tree.
- Keep `plugins/bottega-dex/skills/orchestrate/SKILL.md` identical to the upstream source linked in `README.md`.
- Keep imported `start`, `discover`, `qa`, and `close` procedures aligned with the Bottega source linked in `README.md`, except for Codex-native adaptations.
- Preserve the upstream copyright notice in `LICENSE`.
- Preserve unrelated changes. Use `apply_patch` for edits and stage explicit paths.

## Verification

Run:

```bash
npm test
npm run typecheck
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/bottega-dex
```

For adapter changes, also run the dry-run contract tests and one minimal real structured-output smoke call.
