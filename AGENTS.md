# bottega-dex

Bottega Dex is the Codex-native Bottega workflow. `maestro` runs `start`, `discover`, embedded orchestration, dual autoreview, `qa`, and `close` to deliver one task as a reviewed pull request.

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
| `plugins/bottega-dex/skills/code-review/SKILL.md` | Vendored autoreview entrypoint for Sol and Claude Opus 5 |
| `plugins/bottega-dex/skills/code-review/references` | Autoreview contract and review baseline |
| `plugins/bottega-dex/skills/code-review/scripts` | Vendored autoreview engine and harness |
| `plugins/bottega-dex/skills/qa/SKILL.md` | Reviewed-head product QA procedure |
| `plugins/bottega-dex/scripts/claude-exec` | Bounded `claude -p` adapter |
| `plugins/bottega-dex/scripts/exec-common.js` | Shared adapter process and provenance helpers |
| `tests/plugin-contract.test.ts` | Package and upstream-copy contracts |
| `tests/claude-exec.test.ts` | Claude adapter contract tests |
| `tests/exec-common.test.ts` | Adapter helper tests |
| `tests/run-vendor-suites.py` | Vendored autoreview test runner |
| `tests/review-orchestration.test.ts` | Autoreview panel contracts |

## Rules

- Write plain engineering English. Do not use em dashes, metaphors, theatrical names, or invented process vocabulary.
- Keep `maestro` as the user-facing end-to-end workflow and `orchestrate` as its complete build method.
- The phase order is `start`, `discover`, `orchestrate`, `code-review`, `qa`, `close`.
- Discovery hands its findings directly to orchestration.
- The complete integrated diff runs through the vendored autoreview helper with GPT-5.6 Sol at high reasoning and Claude Opus 5 at high effort.
- Native subagents perform orchestration work. The vendored autoreview helper is the review process boundary.
- Keep `claude-exec` as the bounded direct Claude adapter requested by the user. Autoreview remains the code-review entrypoint.
- Verify every autoreview finding. Fix accepted issues with one or more subagents depending on size and repository methodology, then rerun affected proof and the dual panel.
- QA drives the reviewed artifact and never fixes product code.
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
