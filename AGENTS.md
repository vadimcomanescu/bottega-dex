# bottega-dex

Bottega Dex is the Codex-native sibling of Bottega. It takes one task or issue to a reviewed, evidence-backed pull request. Bottega remains the Claude Code repository. Never apply changes from this repository back to it unless a user explicitly requests a separate port.

Read `README.md` for the product model. This file is the working agreement for contributors inside this repository.

## Map

| Path | Purpose |
| --- | --- |
| `.agents/plugins/marketplace.json` | Public Codex marketplace entry for `codex plugin marketplace add vadimcomanescu/bottega-dex` |
| `plugins/bottega-dex/.codex-plugin/plugin.json` | Installable Codex plugin manifest |
| `plugins/bottega-dex/skills/run/SKILL.md` | The complete isolate, discover, specify, plan, build, review, QA, and deliver method |
| `plugins/bottega-dex/skills/implementing` | Builder method loaded through worker briefs |
| `plugins/bottega-dex/skills/reviewing` | Cold reviewer method and report schema |
| `plugins/bottega-dex/skills/panel` | Blinded panel method and structured-output schemas |
| `plugins/bottega-dex/skills/codebase-design` | Shared design vocabulary and deep-module rules |
| `plugins/bottega-dex/scripts/claude-exec` | External Claude reviewer and panel adapter with safe-mode and output normalization |
| `plugins/bottega-dex/scripts/exec-common.js` | Shared path, timeout, and linked-worktree safety helpers for the Claude adapter |
| `plugins/bottega-dex/hooks` | Session model reminder and natural-language entry guard |
| `tests` | Dispatch, hook, schema, manifest, and content contracts |

## Rules

- Write plain engineering English. Use standard engineering terms. No metaphors, theatrical naming, or invented process vocabulary.
- Do not use em dashes. Use periods, commas, colons, or parentheses.
- The orchestrator is GPT-5.6 Sol at Ultra. Mechanical work routes to GPT-5.6 Luna at high. Sophisticated worker work routes to GPT-5.6 Sol at high. Cross-family paths use Claude only where the process names them.
- Codex workers use native subagents. Never launch a second Codex process from a Bottega Dex run.
- Every native brief requests the route and effort from the routing table and records the model reported by the worker. Use native custom agents when available for exact pinning.
- Claude runs only for the named cross-family reviewer and panel roles through `claude-exec`. Callers never override its model, effort, permission mode, or tool list.
- Orchestration is Codex. Never add a polling loop, queue, daemon, resident server, or general scheduler.
- Every run gets isolation, a specification, a build, host gates after integration, one cross-family review of the complete integrated diff, a real product QA drive, and a pull request.
- Cross-family review is never replaced by per-slice review and never skipped for size.
- Review and QA run against disposable or isolated worktrees. High-permission workers never run in the user's primary checkout.
- Test output is redirected to a file and its exit code is checked. Never pipe a test command through another command.
- Use `apply_patch` for local file edits. Preserve unrelated changes.
- A worker receives methods and files by absolute path. It does not inherit plugin skills or the orchestrator's conversation.
- The user approves actions involving real users, real money, deploys, shared data, or production data. An autonomous specification waiver does not authorize those actions.
- Keep worker methods short. Cut any instruction a competent frontier worker can derive from the repository or normal engineering practice unless a costly failure established the need.

## Verification

Run both gates after any change:

```bash
npm test
npm run typecheck
```

For manifest, marketplace, skill, or hook changes, also run:

```bash
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/bottega-dex
```

For adapter changes, run their `--dry-run` contract tests and one minimal real structured-output smoke call per changed external provider before release.
