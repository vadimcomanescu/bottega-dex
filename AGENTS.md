# bottega-dex

Bottega Dex is the Codex-native Bottega workflow. `maestro` runs `start`, `discover`, and an adaptive set of later phases in fixed order to deliver one task as a reviewed pull request. It may skip a nonmandatory later phase only when nothing is unclear and reversal is cheap. The isolated worktree and branch, project gates, whole-diff review, and pull request are the only mandatory invariants.

Never apply changes from this repository to `/Users/vadimcomanescu/Code/bottega` unless the user explicitly requests a separate port.

Native Codex subagent instructions in this plugin are intentional. The Claude compatibility mapping above applies to imported Claude tool names, not to explicit Codex subagent fan-out in Bottega Dex skills.

## Map

| Path | Purpose |
| --- | --- |
| `.agents/plugins/marketplace.json` | Public Codex marketplace entry |
| `plugins/bottega-dex/.codex-plugin/plugin.json` | Installable plugin manifest |
| `plugins/bottega-dex/skills/maestro/SKILL.md` | User-facing end-to-end workflow |
| `plugins/bottega-dex/skills/bro/SKILL.md` | User-facing plain-language restatement skill |
| `plugins/bottega-dex/skills/improve/SKILL.md` | User-facing codebase improvement scan and Maestro handoff |
| `plugins/bottega-dex/skills/setup/SKILL.md` | User-facing one-time machine and repository reconciliation |
| `plugins/bottega-dex/skills/start/SKILL.md` | Supporting ownership, isolation, and launch procedure |
| `plugins/bottega-dex/skills/discover/SKILL.md` | Supporting discovery procedure |
| `plugins/bottega-dex/skills/architect/SKILL.md` | Shared architecture doctrine |
| `plugins/bottega-dex/skills/panel/SKILL.md` | Independent Codex and Claude decision panel |
| `plugins/bottega-dex/skills/use-claude/SKILL.md` | Direct read-only Claude cross-read procedure |
| `plugins/bottega-dex/skills/orchestrate/SKILL.md` | Exact upstream decomposition and implementation method |
| `plugins/bottega-dex/skills/implement/SKILL.md` | Implementation doctrine for dispatched slices and repairs |
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
- Keep `improve` explicitly invoked. It scans and proposes before a run exists, waits for the user's candidate choice, then gives the accepted scan to `maestro` as completed discovery.
- Keep `setup` explicitly invoked and separate from a run. It reads the repository's existing authorities, proposes exact machine, file, and GitHub changes, waits for approval, and is idempotent.
- The fixed phase order is `start`, `discover`, `architect`, optional `panel`, `use-claude`, `orchestrate`, `code-review`, `qa`, `close`. Adaptive execution may omit an unnecessary nonmandatory later phase but never reorder phases, and it must re-enter a skipped phase if the work grows to need it.
- Discovery findings feed architecture and the orchestration brief.
- `start` reads the host repository's documented merge procedure. `close` follows that procedure: opening the PR arms a queue where one owns landing, while opener-armed GitHub auto-merge and its red hold check remain a documented fallback only.
- `use-claude` invokes Claude Fable 5 at high effort through direct `claude -p` for design cross-reads when reversal would be costly and for the Claude panel seat.
- The complete integrated diff runs through the vendored autoreview helper with GPT-5.6 Sol at high reasoning and Claude Opus 5 at high effort.
- A single builder skips its slice review only when the integrated structured review will run. Under the `SKILL.md` and prose exception, require one fresh high-reasoning review of the whole docs diff.
- Native subagents perform orchestration work. The vendored autoreview helper is the review process boundary.
- Keep `claude-exec` as the bounded direct Claude reviewer-role adapter requested by the user. It is separate from code review; autoreview invokes Claude itself for reviews.
- Verify every autoreview finding. Fix accepted issues with one or more subagents depending on size and repository methodology, then rerun affected proof and follow the code-review skill's pinned cross-family rerun rule.
- QA is required when a user-facing surface or product behavior changed. Otherwise `maestro` skips it. When run, QA drives the reviewed artifact and never fixes product code.
- Never issue a direct merge command. A queue-owned PR is watched through its queue summary and updated-base checks; an `autoMergeRequest` of null is normal there.
- Keep `plugins/bottega-dex/skills/orchestrate/SKILL.md` identical to the upstream source linked in `README.md`.
- Keep imported `setup`, `start`, `discover`, `architect`, `improve`, `implement`, `panel`, `qa`, and `close` procedures aligned with the Bottega source linked in `README.md`, except for Codex-native adaptations.
- Preserve the upstream copyright notice in `LICENSE`.
- Preserve unrelated changes. Use `apply_patch` for edits and stage explicit paths.

## Repository landing procedure

This is this repository's authoritative fallback landing procedure, distinct from the plugin's general queue-first behavior.

These are target settings, not current facts, until the external repository setup completes:

- The target `main` ruleset has no bypass actors. It requires a pull request, allows squash merges only, has zero required approvals, leaves strict up-to-date checking off, blocks branch deletion, blocks non-fast-forward updates, and has required checks `verify` and `hold`.
- The target repository setting has GitHub auto-merge enabled.

Bootstrap those settings in this safe order:

The bootstrap is a land run and must not carry the `hold` label. This bootstrap sequence must not be used for a held release before `hold` is a required check.

1. Create the `hold` label and read it back.
2. Enable GitHub auto-merge.
3. Create a temporary active no-bypass `main` ruleset that requires a pull request, allows squash merges only, has zero required approvals, leaves strict up-to-date checking off, blocks branch deletion and non-fast-forward updates, and requires only the already-live `verify` check.
4. Open this bootstrap pull request as a land run without the `hold` label, then arm it with `gh pr merge --auto --squash <PR-URL>`.
5. After this merge-control workflow lands, observe a successful `hold` check reported by the landed workflow. Only then update the active ruleset to require both `verify` and `hold`.

The `pull_request` enforcement assumes this repository's owner-authored and cooperative-contributor model. It is not tamper-resistant against a hostile pull request that changes the workflow. It blocks the current label state, but it does not evaluate code, reviews, or other readiness.

- The account that opens any later pull request arms it with `gh pr merge --auto --squash <PR-URL>` in the same run that opens it.
- On a land run, auto-merge merges the pull request when the required checks pass.
- On a hold run, open the pull request with the `hold` label already applied and arm auto-merge immediately after creation, before waiting for or polling any required check. Only after the arm is present, poll the required checks and verify that the required `hold` check is red. If no enforcing required `hold` check appears, run `gh pr merge --disable-auto <PR-URL>`, confirm that `autoMergeRequest` is null, leave the pull request labeled and unarmed, stop, and report the missing enforcement. Removing the label reruns the check so the pull request can land when every required check passes.
- Never issue a direct merge command.

## Verification

Run:

```bash
npm test
npm run typecheck
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/bottega-dex
```

For adapter changes, also run the dry-run contract tests and one minimal real structured-output smoke call.
