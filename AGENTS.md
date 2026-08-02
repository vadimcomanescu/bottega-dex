# bottega-dex

Bottega Dex is the Codex-native Bottega workflow. `maestro` runs `start`, `discover`, and an adaptive set of later phases in fixed order to deliver one task as a reviewed pull request. It may skip a nonmandatory later phase only when nothing is unclear and reversal is cheap. The isolated worktree and branch, project gates, whole-diff review, and pull request are the only mandatory invariants.

Never apply changes from this repository to `/Users/vadimcomanescu/Code/bottega` unless the user explicitly requests a separate port.

Native Codex subagent instructions in this plugin are intentional. The Claude compatibility mapping above applies to imported Claude tool names, not to explicit Codex subagent fan-out in Bottega Dex skills.

## Map

| Path | Purpose |
| --- | --- |
| `.agents/plugins/marketplace.json` | Public Codex marketplace entry |
| `CONTEXT.md` | Root glossary for run and review roles |
| `docs/adr/` | Durable workflow decisions and their trade-offs |
| `docs/lessons/` | Failure records and their enforcement points |
| `plugins/bottega-dex/.codex-plugin/plugin.json` | Installable plugin manifest |
| `plugins/bottega-dex/skills/maestro/SKILL.md` | User-facing end-to-end workflow |
| `plugins/bottega-dex/skills/bro/SKILL.md` | User-facing one-shot plain-language restatement |
| `plugins/bottega-dex/skills/improve/SKILL.md` | User-facing codebase improvement scan and Maestro handoff |
| `plugins/bottega-dex/skills/setup/SKILL.md` | User-facing one-time machine and repository reconciliation |
| `plugins/bottega-dex/skills/start/SKILL.md` | Supporting ownership, isolation, and launch procedure |
| `plugins/bottega-dex/skills/discover/SKILL.md` | User-invocable and Maestro discovery procedure: understand intent first, then adapt the unknowns work to the task |
| `plugins/bottega-dex/skills/spec/SKILL.md` | Internal synthesis of discovery into the spec baseline used by builders, QA, and review |
| `plugins/bottega-dex/skills/domain-modeling/SKILL.md` | User-invocable domain vocabulary and ADR maintenance |
| `plugins/bottega-dex/skills/prototype/SKILL.md` | User-invocable throwaway logic or UI prototype method |
| `plugins/bottega-dex/skills/codebase-design/SKILL.md` | Shared deep-module vocabulary and principles |
| `plugins/bottega-dex/skills/architect/SKILL.md` | Consequential interface, dependency, test, effect, and documentation-authority methods that contribute to the Plan when architecture is needed |
| `plugins/bottega-dex/skills/panel/SKILL.md` | Independent Codex and Claude decision panel |
| `plugins/bottega-dex/skills/use-claude/SKILL.md` | Direct read-only Claude cross-read procedure |
| `plugins/bottega-dex/skills/orchestrate/SKILL.md` | Exact upstream decomposition and implementation method |
| `plugins/bottega-dex/skills/implement/SKILL.md` | Implementation doctrine for dispatched slices and repairs |
| `plugins/bottega-dex/skills/close/SKILL.md` | Supporting publication and terminal-state procedure: apply the host project's documented brake when held, perform only its assigned opener action, watch its landing mechanism, and report the outcome its procedure defines |
| `plugins/bottega-dex/skills/close/references/qa-evidence.md` | QA evidence publication procedure |
| `plugins/bottega-dex/skills/code-review/SKILL.md` | Vendored autoreview entrypoint for Sol and Claude Opus 5, with TruffleHog preflight |
| `plugins/bottega-dex/skills/code-review/references` | Autoreview contract and review baseline |
| `plugins/bottega-dex/skills/code-review/scripts` | Vendored autoreview engine and harness |
| `THIRD_PARTY.md` | Vendored source pins and local adaptations |
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
- Keep `improve` explicitly invoked. It scans and proposes before a run exists, waits for the user's candidate choice, verifies that choice with the deletion test, testability evidence, and applicable ADRs, then gives the accepted scan to `maestro` as completed discovery. Maestro conditionally synthesizes a spec when the scan settled behavioral decisions beyond the candidate; otherwise the agreed candidate is the verbatim behavioral baseline. It then continues to the Plan without repeating discovery.
- Keep `setup` explicitly invoked and separate from a run. It reads the repository's existing authorities, proposes exact machine, file, and GitHub changes, waits for approval, and is idempotent.
- The fixed phase order is `start`, `discover`, conditional `spec`, conditional `architect`, optional `panel`, conditional `use-claude`, `orchestrate`, closeout `code-review` with parallel Standards and Spec reviews, conditional architecture read, conditional `qa`, `close`. Adaptive execution may omit a phase only under its local condition, never reorder phases, and must re-enter a skipped phase if the work grows to need it.
- Discovery first explains the request in repository terms, then scales its unknowns work to the task. It updates resolved glossary terms and qualifying ADRs inline. Its findings feed the spec, architecture, and orchestration brief.
- The spec is synthesized only when discovery settled something beyond the request. Otherwise the request text is the spec verbatim. The whole diff is always read against that baseline after bug review.
- Before builders start, Maestro and the root task always write a durable Plan distinct from the behavioral spec: builder non-decisions, named test interfaces, any threat model, and vertical slices. `architect` contributes consequential design only when its condition holds; a trivial or already-settled run still gets the shortest sufficient Plan without forcing that phase. Use only the repository's authorized planning location; otherwise keep the Plan in isolated run state or the conversation. Never create or mutate a tracker item implicitly.
- `start` reads the host repository's complete landing procedure: its hold brake, opener action, landing mechanism, every applicable disarm or withdrawal action, the readback proving terminal ineligibility, and its outcome signals. `close` follows it. A queue-owned eligible non-draft PR receives no auto-merge arm; the opener arms GitHub auto-merge only when the procedure assigns that action; another repository-owned mechanism receives only its documented opener action. If hold enforcement cannot be proved, Close disarms or withdraws every applicable GitHub, queue, and repository-owned mechanism, uses draft only when the procedure names it as safe, and never claims a safe hold until every mechanism reports the PR ineligible. Dex retains the required brake check and fail-closed recovery for its documented opener-armed fallback.
- `use-claude` invokes Claude Fable 5 at high effort through direct `claude -p` for design cross-reads when reversal would be costly and for the Claude panel seat.
- `bro` restates the immediately preceding assistant reply once in plain, jargon-free language. It does not persist across turns. Maestro maintains its own plain-language rule for its invocation.
- The main run worktree is the integration worktree. Before multi-builder dispatch, create one slice branch and worktree per independent slice from the frozen integration base. Each builder edits only its slice worktree; parallel builders never share Git state. Review each slice branch against the frozen base and integrate only its accepted commit into the main run worktree. The root task resolves questions and retains every user approval.
- Before implementation, freeze the neutral boundary facts: target and base, architectural owner boundary, relevant sibling surfaces, public, security, and product contracts, changed-file and exact slice file bounds, non-test LOC measurements, named test interfaces, and the exact threat-model sentence when relevant. Changed-file and slice bounds and LOC are review measurements and evidence, not hard scope caps; the Plan's exact slice ownership remains binding for builder isolation. Keep the Spec behavioral baseline separate: spec or verbatim request plus violated invariant and intended behavior when applicable. Standards receives neutral facts plus trusted frozen-base authority and never behavioral content. Spec receives the same neutral facts plus the behavioral baseline. In a multi-builder run, every completed slice is reviewed before integration through the trusted sanitized code-review helper at P2, using the selected high-reasoning engine and its exact-model smoke boundary.
- One fresh high-reasoning review worker owns review convergence for the complete integrated diff. It is a leaf: it runs the vendored autoreview helper, verifies and classifies findings, and returns accepted repair briefs without spawning builders or editing production code. The root task never edits production code; it dispatches `implement` builders and returns the repaired head to the same review worker for proof and reruns. The GPT-5.6 Sol and Claude Opus 5 panel stays mandatory and fixed across reruns.
- The review gate runs at P2 and trusts a clean session only after its malicious smoke harness passes. Every diff uses the sanitized helper. Standards authority comes from the trusted frozen base, not the reviewed checkout. The review prompt includes the frozen owner and scope baseline, threat model, and named test interfaces. Standards and Spec reviews run in parallel and stay separate, following Bottega `e0926de`; the independent architecture read remains conditional on costly reversal.
- The vendored review preflight requires `trufflehog` and uses its verified or unknown findings plus deletion-side redaction. Setup reports the missing binary rather than installing it.
- A single builder skips its slice review only when the integrated structured review will run.
- Native subagents perform orchestration work. The vendored autoreview helper is the review process boundary.
- Keep `claude-exec` as the bounded direct Claude reviewer-role adapter requested by the user. It is separate from code review; autoreview invokes Claude itself for reviews.
- Verify every autoreview finding and rerun affected proof; retain the Dex queue and opener-armed auto-merge landing boundaries.
- After two review-triggered repair cycles without convergence, the root task pauses and reclassifies every remaining finding before continuing. An architecture-driven repair re-enters panel when its conditions hold, then repeats the complete dual-panel, Standards, and Spec reviews.
- After any post-review change, rerun the complete required QA scenario set on the final reviewed SHA, never only an affected subset.
- QA is required when a user-facing surface or product behavior changed. Otherwise `maestro` skips it. When run, QA drives the reviewed artifact and never fixes product code.
- Never issue a direct merge command. A queue-owned PR is watched through its queue summary and updated-base checks; an `autoMergeRequest` of null is normal there.
- Keep `plugins/bottega-dex/skills/orchestrate/SKILL.md` identical to the upstream source linked in `README.md`.
- Keep imported `setup`, `start`, `discover`, `codebase-design`, `architect`, `improve`, `implement`, `panel`, `qa`, and `close` procedures aligned with the Bottega source linked in `README.md`, except for Codex-native adaptations. Keep `domain-modeling`, `prototype`, and the internal `spec` seam aligned with their selected sources while retaining Dex's repository-local and Codex-native boundaries.
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
- This fallback has no queue or separate repository-owned landing enrollment. On failed hold enforcement, a null `autoMergeRequest` is therefore the documented terminal-ineligibility proof; if that readback cannot be obtained, never report the pull request as safely held.
- Never issue a direct merge command.

## Verification

Run:

```bash
npm test
npm run typecheck
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/bottega-dex
```

For adapter changes, also run the dry-run contract tests and one minimal real structured-output smoke call.
