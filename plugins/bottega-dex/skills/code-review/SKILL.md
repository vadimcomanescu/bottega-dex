---
name: code-review
description: Review a diff through the vendored review engine, with separate Standards and Spec reviews. Use $bottega-dex:code-review on a PR, ref range, or working diff. A run's Review phase uses the whole method.
---

# Code review

Run the bundled structured review helper as a closeout check.

Codex review is the standalone default when no engine is set. It uses `gpt-5.6-sol` with `high` reasoning, then retries once with `gpt-5.6-terra` only when the account cannot access Sol. Only the integrated Maestro closeout diff uses the pinned two-engine panel: GPT-5.6 Sol at high reasoning and Claude Opus 5 at high effort. Its Standards and Spec reviews are both fixed to GPT-5.6 Sol at high reasoning. Those selections stay pinned across every integrated closeout rerun. Before integration, each slice's bug, Standards, and Spec passes all use the one high-reasoning engine, model, and thinking configuration selected in its builder dispatch, not the integrated fixed panel. They still run at P2 through the sanitized helper, and smoke that exact selected configuration before their first clean result.

Use when:

- user asks for Codex review / Claude review / Pi review / autoreview / second-model review
- after non-trivial code edits, before final/commit/ship
- reviewing a local branch or PR branch after fixes

Every diff uses the secret-safe helper and the separate Standards and Spec reviews below. Do not bypass that method for skill, metadata, documentation, configuration, generated, or executable changes.

## Contract

- Run every invocation at `--max-priority P2` and pass `--stream-engine-output`.
  P0-only filtering can suppress real P1 defects; classification is the noise
  filter. Use P3 only when the caller explicitly requests polish-level review.
- Treat review output as advisory. Never blindly apply it.
- Verify every finding by reading the real code path and adjacent files.
- Read dependency docs/source/types when the finding depends on external behavior.
- Reject unrealistic edge cases, speculative risks, broad rewrites, and fixes that over-complicate the codebase.
- Prefer small fixes at the right ownership boundary; no refactor unless it clearly improves the bug class.
- When an accepted finding shows a bug class or repeated pattern, inspect the current PR scope for sibling instances before fixing.
- Fix the scoped bug class at once when practical; stop at touched surfaces, owner boundaries, and clear follow-up territory.
- Keep going until structured review returns no accepted/actionable findings only while the work remains inside the original task scope.
- If a review-triggered fix changes code, rerun focused tests and rerun the structured review helper.
- For security-audit suppression changes, verify accepted findings remain auditable: suppressed findings stay in structured output, active output keeps an unsuppressible suppression notice, and aggregate findings cannot hide unrelated active risk.
- Never switch or override the requested review engine/model except for the documented Codex Sol-to-Terra account-access fallback. Capacity, rate-limit, and unrelated failures keep the same engine/model.
- Be patient with large bundles. Structured review can take up to 30 minutes while the model call is active, especially with Codex tools or web search.
- Treat heartbeat lines like `review still running: ... elapsed=... pid=...` as healthy progress, not a hang. Let the helper continue while heartbeats are advancing. Pass `--stream-engine-output` when live engine text is useful; Codex and Claude filter tool/file chatter, other runnable engines pass raw output through.
- Do not kill a review just because it has been quiet for 2-5 minutes, or because it is still running under the 30-minute window. Inspect the process only after missing multiple expected heartbeats, after 30 minutes, or after an obviously failed subprocess; prefer letting the same helper command finish.
- Tools are useful in review mode. Codex receives the validated bundle in an empty workspace so ignored files and linked-worktree metadata remain unreadable; web search stays available for dependency contracts and upstream docs.
- Security perspective is always included, but it should not cripple legitimate functionality. Report security findings only when the change creates a concrete, actionable risk or removes an important safety check.
- Reviewer subprocesses preserve engine authentication and non-credentialed proxy variables needed by headless or restricted-network environments while stripping process-injection, Git override, and credentialed proxy values.
- Before engine invocation, autoreview runs TruffleHog over temporary snapshots of the exact added, modified, or deleted content under review. It intentionally matches TruffleHog's low-false-positive pre-commit policy (`verified,unknown`); it does not classify arbitrary password-like strings or rescan unchanged history. Unchanged context lines inside a modified hunk also pass through the local secret scanner because they are sent to the engine but are not snapshot additions. After that scan passes, locally recognized secret-like values are redacted in place only when they occur exclusively on deleted lines of an entirely removed file; if one of those deleted values also occurs in added, context, or mixed staged/unstaged content, the review fails closed. Install TruffleHog using its official platform-neutral instructions; autoreview fails with that link when the binary is unavailable and never auto-installs it. Repositories should also run TruffleHog in pull-request CI as a backup outside autoreview; repository-local Git hooks are optional. Review bundles still omit security-sensitive paths or files, and explicit prompt and dataset inputs remain checked before engine invocation. Safe large diffs are sent as one pass while they fit the aggregate prompt limit, then partitioned into complete bounded passes without truncation.
- For regression provenance, keep roles separate: blamed code author, blamed PR author, PR merger/committer, current PR author, and PR/date. If no blamed PR is traceable, use the blamed commit as the provenance: commit SHA, date, and author username. Do not guess a merger or frame missing PR metadata as a separate finding.
- Do not invoke built-in `codex review`, nested reviewers, or reviewer panels from inside the review. The helper builds one validated bundle, calls the selected engine once for normal inputs or once per complete bounded chunk for oversized inputs, validates the structured results, and stops.
- A clean helper result stops repeats of that same engine pass. It does not waive the required separate Standards and Spec review passes. Do not rerun the same pass just to get a nicer "clean" line, a second opinion, or clearer closeout wording.
- Before trusting the first clean exit in a session, run the malicious smoke harness from the same environment for every selected engine, with that engine's selected model and thinking level pinned. For the integrated Maestro closeout, run `AUTOREVIEW_MAX_PRIORITY=P2 AUTOREVIEW_CODEX_MODEL=gpt-5.6-sol AUTOREVIEW_CODEX_THINKING=high "$AUTOREVIEW_HARNESS" --fixture malicious --engine codex` and `AUTOREVIEW_MAX_PRIORITY=P2 AUTOREVIEW_CLAUDE_MODEL=claude-opus-5 AUTOREVIEW_CLAUDE_THINKING=high "$AUTOREVIEW_HARNESS" --fixture malicious --engine claude`. If a probe fails, that engine's clean exits are untrusted until it is repaired.
- When repository gates or hooks cannot run in the review environment, report the gap and any bypass, and mark the head unverified rather than clean. Unverified outranks clean.
- A diff is clean only with a clean engine result and every applicable Standards and Spec review result resolved: fixed or rejected with its reason. A standalone review with no supplied spec records `no spec available`; that non-applicable status does not block a clean engine result. Maestro always supplies a spec.
- If rejecting a finding as intentional/not worth fixing, add a brief inline code comment only when it explains a real invariant or ownership decision that future reviewers should know.
- Do not push just to review. Push only when the user requested push/ship/PR update.
- A clean review of a pushed head posts one commit status on that head, context `bottega/review`, naming the base it was reviewed against.
- Review never merges. Return the accepted head and its evidence to the repository's documented landing procedure. Under Maestro, [close](../close/SKILL.md) owns publication and landing from the integrated review, QA on the accepted head when required, and the project's checks.

## Scope Governor

Autoreview is a closeout gate, not permission to rewrite the task.

Before the first review, freeze two records and one neutral boundary. The behavioral baseline is the original request or issue and intended behavior; only the Spec review receives it. The neutral review-boundary facts shared with both reviews are target and base, owner boundary, exact changed-file or slice bounds, non-test LOC, and named test interfaces. The relevant threat-model sentence may accompany either review. Standards additionally receives trusted frozen-base authority and never behavioral text. For inherited or already-bloated branches, use the intended PR diff for changed-file bounds and non-test LOC rather than accepting all existing branch drift.

Before patching a finding, classify it:

- **In-scope blocker**: the finding is introduced by the current diff, affects the same owner boundary, and can be fixed without changing the task's contract.
- **Follow-up**: the finding is real but belongs to an adjacent bug class, sibling surface, cleanup, or broader hardening track.
- **Stop-and-escalate**: the finding requires a new protocol/config/storage/public API contract, a different owner boundary, a release-process change, or a design choice outside the original request.
- **Out of threat model**: the finding is real and may be reproducible, but its failure requires an input or actor class outside the frozen threat model. Record the finding and reason in the review evidence, reject it, and do not dispatch a fix. A constructed reproduction proves reachability, not that the scenario is in the agreed model. Only the user can approve widening that model.

In a Bottega Dex maestro run, the review worker verifies each routine finding against the real code and returns accepted repair briefs with its review report to the orchestrator. The orchestrator dispatches `implement` builders, decides escalations, and never edits production code. After those builders return their proof, the review worker reruns review. Outside a run, fix directly as this contract states.

Stop patching and report the scope break instead of continuing when:

- a narrow PR turns into an architecture change, protocol change, migration, or release-process change;
- the diff grows past 2x the original files or non-test LOC without explicit approval to expand scope; compute both numbers against the frozen baseline before each repair dispatch;
- two review-triggered patch cycles have not converged; pause and reclassify every remaining finding before another edit;
- the best fix is "define the canonical contract first" rather than another local inference layer;
- fixing the accepted finding would make the PR no longer describe the same behavior, issue, or owner boundary.

After the two-cycle pause, continue only when every remaining accepted finding is an in-scope blocker inside the threat model and the cycles are narrowing: each cycle has fewer accepted findings than the previous cycle and does not reopen a fixed finding. Otherwise preserve the useful analysis, identify the smallest safe landed subset if one exists, and open or request a follow-up for the larger fix. Do not keep committing speculative fixes just to satisfy the reviewer.

Do not stack or push review-triggered fix commits while scope classification or focused proof is unresolved. Keep exploratory edits local until the cycle is proven in scope; if scope breaks, remove them from the landing lane instead of preserving them as branch history.

Critical exceptions must be explicit: active data loss, crash, broken install/upgrade, release blocker, or concrete security exposure. If the exception is not one of those, it is not critical enough to blow up scope.

## Release Branches And Release Process

On release, beta, stable, hotfix, signing, notarization, appcast, package-publish, or release-check work, use freeze discipline even when the branch name is not release-like:

- Fix only release blockers, failed release infrastructure, exact backports, install/upgrade breakage, data loss, crashes, or concrete security exposure.
- Treat non-blocking autoreview findings as follow-ups for `main`, not reasons to broaden the release branch.
- Do not introduce new product behavior, config surface, protocol shape, migration, plugin ownership, docs narrative, or process policy unless it directly unblocks the release.
- Keep proof tied to the release target: exact branch/ref, failing check or shipped-risk reason, smallest command/proof, and whether the fix must also forward-port to `main`.
- If review discovers a real but non-critical design problem during release closeout, stop with a follow-up issue/PR plan; do not use the release branch as the refactor lane.

## Skill Path (set once)

Set the skill script paths once, then use `"$AUTOREVIEW"` and `"$AUTOREVIEW_HARNESS"` in the examples below.

Choose one:

```bash
# Bottega Dex plugin install. Resolve this directory from the loaded SKILL.md path:
export AUTOREVIEW="<absolute-code-review-skill-directory>/scripts/autoreview"
export AUTOREVIEW_HARNESS="<absolute-code-review-skill-directory>/scripts/test-review-harness"
```

```bash
# Claude Code plugin install, the shape bottega:setup produces:
export AUTOREVIEW="${CLAUDE_PLUGIN_ROOT}/skills/code-review/scripts/autoreview"
export AUTOREVIEW_HARNESS="${CLAUDE_PLUGIN_ROOT}/skills/code-review/scripts/test-review-harness"
```

```bash
# Project-local skill in the current repo for Codex and other agents:
export AUTOREVIEW=".agents/skills/code-review/scripts/autoreview"
export AUTOREVIEW_HARNESS=".agents/skills/code-review/scripts/test-review-harness"
```

```bash
# Claude Code project-local skill in the current repo:
export AUTOREVIEW=".claude/skills/code-review/scripts/autoreview"
export AUTOREVIEW_HARNESS=".claude/skills/code-review/scripts/test-review-harness"
```

```bash
# Global skill:
export AGENTS_HOME="${AGENTS_HOME:-$HOME/.agents}"
export AUTOREVIEW="$AGENTS_HOME/skills/code-review/scripts/autoreview"
export AUTOREVIEW_HARNESS="$AGENTS_HOME/skills/code-review/scripts/test-review-harness"
```

When using Claude Code, set `AGENTS_HOME="$HOME/.claude"` for global skills.

## Pick Target

Dirty local work:

```bash
"$AUTOREVIEW" --mode local --max-priority P2 --stream-engine-output
```

Use this only when the patch is actually unstaged/staged/untracked in the
current checkout. `--mode uncommitted` is accepted as an alias for `--mode local`.
For committed, pushed, or PR work, point the helper at the commit
or branch diff instead; do not force dirty modes just
because the helper docs mention dirty work first. A clean local review
only proves there is no local patch.

Branch/PR work:

```bash
"$AUTOREVIEW" --mode branch --base origin/main --max-priority P2 --stream-engine-output
```

Optional review context is first-class. Prompt files and datasets must be repo-relative so review bundles cannot pull arbitrary host files:

```bash
"$AUTOREVIEW" --mode branch --base origin/main --prompt-file review-notes.md --dataset evidence.json --max-priority P2 --stream-engine-output
```

In a Bottega Dex maestro run, the Standards prompt carries the full content of every repository contract governing the named test interfaces, frozen at the target base: root `AGENTS.md` and `REVIEW.md` when each governs them, and the fixed standards baseline ([references/smell-baseline.md](references/smell-baseline.md)) from the loaded skill. It also carries the neutral review-boundary facts: target and base, owner boundary, exact changed-file or slice bounds, non-test LOC, named test interfaces, and the threat-model sentence when relevant. If a governing contract is absent at the frozen base, state that absence in the prompt and omit it. The Standards prompt never carries the request, build spec, verbatim request, or intended behavior. The Spec prompt alone carries the run's build spec or verbatim request, plus the same neutral review-boundary facts so it judges only its designated slice. Neither prompt contains diff content or deleted revisions; proposed changes to authority files remain only in the helper's sanitized bundle. This lets the Standards review report a test crossing any other interface, or reaching into implementation internals, as a finding. The threat model and named test interfaces are the only run-design exceptions, never the run's other design decisions. A decision record the run committed on the branch arrives in the bundle as changed content and is reviewed as any file; the isolation rule governs the prompt, not the diff. The task running this skill writes each prompt to a file outside the reviewed repo and passes it as `--prompt "$(cat <file>)"`; never paste PR text into the command source, and keep `--json-output` outside the reviewed repo.

If an open PR exists, use its actual base:

```bash
base=$(gh pr view --json baseRefName --jq .baseRefName)
"$AUTOREVIEW" --mode branch --base "origin/$base" --max-priority P2 --stream-engine-output
```

Reviewing an open PR, treat its unresolved review threads as claimed findings: verify each, fix or refute it with evidence, reply, and resolve the thread (in bottega repos through `scripts/pr-threads`).

Reviewing a PR by number, resolve the target first: fetch the PR head, check it out in its own worktree, and run the review there against the PR's base; the user's checkout is never the review target. A ref-range target reviews exactly that range from the current checkout. Resolve the base ref to its commit SHA before the first invocation and review against that SHA; reruns and the posted commit status use the same SHA. If the live base advances, mark the review unverified and rerun it against the required base, except when the documented landing procedure makes the merge queue authoritative and the queue's speculative updated-base required checks rerun the project's proof. In that narrow queue case, verify the queue summary and those updated-base checks for the PR instead of rerunning the branch review. Without both documented queue authority and speculative required-check proof, base advancement remains unverified and requires a rerun. Run the helper from a trusted checkout, never from the reviewed worktree: resolve the helper's absolute path before entering the PR worktree, and refuse a helper the reviewed diff supplies.

Committed single change:

```bash
"$AUTOREVIEW" --mode commit --commit HEAD --max-priority P2 --stream-engine-output
```

Use commit review for already-landed or already-pushed work on `main`. Reviewing
clean `main` against `origin/main` is usually an empty diff after push. For a
small stack, review each commit explicitly or review the branch before merging
with `--base`.

## Oversized Bundles

The helper scans the full patch before partitioning it. A safe bundle that fits
the aggregate prompt limit remains one integrated review pass. Larger bundles
are split at bundle sections and file boundaries where possible; an oversized
single-file block is split at line boundaries with repeated file/hunk context
and an absolute new- or old-file line offset. Untracked snapshots use
injection-safe source-line records so continuation passes retain reportable
locations. A single physical diff line split across passes also retains its
original addition, deletion, or context marker.
Every original bundle byte appears exactly once across the pass sequence, and
all validated reports are merged before required-finding and exit-status checks.
The helper caps one run at eight bounded passes so an unexpectedly huge branch
cannot create unbounded model calls; split still-larger work into coherent review
targets.

Chunking makes large-diff review usable, but it cannot give one model call every
cross-file implementation detail. For architecture-heavy changes, still prefer
a coherent branch or PR shape whose semantic decision surface fits one pass.
Removing verified non-authoritative generated noise remains useful, but never
drop lockfiles, generated clients, policies, manifests, schemas, or other
independently semantic artifacts merely to shrink the review.

## Parallel Closeout

Format first if formatting can change line locations. Then it is OK to run tests and review in parallel:

```bash
"$AUTOREVIEW" --parallel-tests "<focused test command>" --max-priority P2 --stream-engine-output
```

Parallel tests inherit only a small allowlist of ordinary OS, CI, and toolchain
variables. Put additional non-secret project controls directly in the test command.
Home and standard config directories point to a temporary isolated root that is
removed after the command exits. Do not put secrets in the command because it is
printed before execution. Set `OPENCLAW_TESTBOX=1` on the autoreview process, not
inside the test command, because the environment snapshot and credential staging
happen before the test shell starts:

```bash
OPENCLAW_TESTBOX=1 "$AUTOREVIEW" --parallel-tests "pnpm check:changed" --max-priority P2 --stream-engine-output
```

On POSIX, the helper puts this isolated Testbox home under the short, sticky
system `/tmp`; Blacksmith creates an SSH control socket below that home, and a
long macOS `TMPDIR` can exceed the Unix-socket path limit. With an older helper,
prefix the outer autoreview process with `TMPDIR=/tmp`. Setting `TMPDIR` inside
the quoted test command is too late because the isolated home already exists.

This is the narrow trusted-maintainer-code exception: it stages only the Blacksmith
credential file into the temporary home so the command can delegate remotely. Never
use this credential-hydrated path for untrusted contributor or fork code. Run other
secret-bearing or credentialed tests separately in an appropriately isolated remote
runner.

Tradeoff: tests may force code changes that stale the review. If tests or review lead to code edits, rerun the affected tests and rerun review until no accepted/actionable findings remain. Once that rerun exits cleanly, stop; do not spend another long review cycle on redundant confirmation.

## Review Panels

Run multiple reviewers against one frozen bundle:

```bash
"$AUTOREVIEW" --reviewers codex,claude,pi --max-priority P2 --stream-engine-output
```

The integrated Maestro closeout reviews the integrated diff as this mandatory panel:

```bash
"$AUTOREVIEW" --mode branch --base <frozen-base> --reviewers codex,claude --max-priority P2 --stream-engine-output \
  --model codex=gpt-5.6-sol --thinking codex=high \
  --model claude=claude-opus-5 --thinking claude=high
```

Every integrated Maestro closeout rerun repeats this exact two-engine panel with the models and thinking pinned, and repeats both Standards and Spec reviews with Sol at high reasoning, until all three review results are clean at the accepted head. A standalone invocation keeps the engine or panel its caller selected. Pre-integration slice reruns keep the one dispatch-selected high-reasoning engine, model, and thinking configuration for their bug, Standards, and Spec passes, and smoke that exact selected configuration before the first clean result. Do not replace either selection during reruns.

`--panel` is shorthand for Codex plus Claude unless `--engine` changes the first reviewer:

```bash
"$AUTOREVIEW" --panel --max-priority P2 --stream-engine-output
```

Set reviewer models and thinking/effort explicitly:

```bash
"$AUTOREVIEW" --reviewers codex,claude --model codex=gpt-5.6-sol --thinking codex=xhigh --model claude=claude-fable-5 --thinking claude=xhigh --max-priority P2 --stream-engine-output
```

Inline syntax is also supported for simple model IDs:

```bash
"$AUTOREVIEW" --reviewers codex:gpt-5.6-sol:xhigh,claude:claude-fable-5:xhigh --max-priority P2 --stream-engine-output
```

For models with slashes or extra colons, prefer keyed form:

```bash
"$AUTOREVIEW" --engine pi --model anthropic/claude-sonnet-4 --thinking high --max-priority P2 --stream-engine-output
"$AUTOREVIEW" --reviewers codex,pi --model codex=gpt-5.6-sol --model pi=anthropic/claude-sonnet-4 --max-priority P2 --stream-engine-output
```

`--reviewers all` covers Codex, Claude, and Pi. Droid, Copilot, Cursor, and OpenCode selections fail closed because their current CLI contracts cannot confine project instructions, filesystem reads, or network fetches to the review boundary.

## Models and thinking

The helper accepts `--model` globally or per engine (`engine=model`) and `--thinking` globally or per engine (`engine=level`). Repeat either flag for multiple reviewers.

Recommended model defaults:

| Engine              | Default model                                      | Source note                                           |
| ------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| **codex** (default) | `gpt-5.6-sol` -> `gpt-5.6-terra` on access failure | Helper default                           |
| **claude**          | `claude-fable-5`                                   | Anthropic's most capable widely released Claude model |

CLI flags and environment variables override these defaults. Pi does not get a built-in model default because its provider catalog may vary by installation. Droid, Copilot, Cursor, and OpenCode are currently refused.

| Engine              | Model flag                 | Example model IDs                                                            | Thinking flag                 | Accepted levels                                            |
| ------------------- | -------------------------- | ---------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------- |
| **codex** (default) | `codex --model X exec ...` | `gpt-5.6-sol`, then `gpt-5.6-terra` on Sol access failure                    | `-c model_reasoning_effort=Y` | `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max` |
| **claude**          | `claude --model X`         | `claude-fable-5`, `claude-opus-4-8`, `claude-sonnet-4-6`, `claude-haiku-4-5` | `--effort Y`                  | `low`, `medium`, `high`, `xhigh`, `max`                    |
| **droid**           | currently refused          | Factory model IDs                                                            | `-r, --reasoning-effort Y`    | `off`, `none`, `low`, `medium`, `high`, `xhigh`, `max`     |
| **copilot**         | currently refused          | Copilot model aliases                                                        | not supported                 | n/a                                                        |
| **pi**              | `pi --model X`             | `anthropic/claude-sonnet-4`, `openai/gpt-4o`                                 | `--thinking Y`                | `off`, `minimal`, `low`, `medium`, `high`, `xhigh`         |
| **cursor**          | currently refused          | Cursor model aliases                                                         | not supported                 | n/a                                                        |
| **opencode**        | currently refused          | OpenCode provider/model IDs                                                  | not supported                 | n/a                                                        |

Claude also supports `--fallback-model a,b` for availability-based fallback chains ([model-config](https://code.claude.com/docs/en/model-config)). Current Claude docs note that auth, billing, rate-limit, request-size, and transport errors do not trigger fallback, and the changelog documents interactive-session support in `v2.1.166`.

[OpenAI's model guidance](https://developers.openai.com/api/docs/guides/latest-model) identifies Sol as the GPT-5.6 frontier-capability route and documents `max` support. Autoreview keeps `high` as its default; use `max` only for the hardest quality-first reviews after comparing its latency and cost with `xhigh` on representative changes.

Examples matching current `main` behavior:

```bash
# Codex with explicit model and reasoning
"$AUTOREVIEW" --engine codex --model gpt-5.6-sol --thinking xhigh --max-priority P2 --stream-engine-output

# Codex fast mode (priority service tier); needs a model whose catalog lists the tier, silently standard otherwise
"$AUTOREVIEW" --engine codex --codex-speed fast --max-priority P2 --stream-engine-output

# Safe Codex model/response tuning overrides (--codex-speed wins over a service_tier here)
"$AUTOREVIEW" --engine codex --codex-config 'service_tier="fast"' --max-priority P2 --stream-engine-output

# Claude Code aliases or full model names, with optional availability fallback
"$AUTOREVIEW" --engine claude --model claude-fable-5 --thinking xhigh --max-priority P2 --stream-engine-output
"$AUTOREVIEW" --engine claude --model claude-fable-5 --fallback-model claude-opus-4-8,claude-sonnet-4-6 --max-priority P2 --stream-engine-output

# Pi with explicit model and thinking level
"$AUTOREVIEW" --engine pi --model anthropic/claude-sonnet-4 --thinking high --pi-bin pi --max-priority P2 --stream-engine-output

```

`--cursor-agent-bin` and `CURSOR_AGENT_BIN` remain compatibility aliases for
`--cursor-bin` and `CURSOR_BIN`.

### Environment defaults

CLI flags take precedence over environment variables.

Store persistent personal defaults in your shell startup file or launcher
environment. For repository-local defaults, use an existing local environment
loader such as an untracked `.envrc`; the helper does not write a config file.

| Variable                           | Purpose                                                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `AUTOREVIEW_MODEL`                 | Override the built-in default `--model` for all engines                                                                          |
| `AUTOREVIEW_THINKING`              | Default `--thinking` for all engines                                                                                             |
| `AUTOREVIEW_FALLBACK_MODEL`        | Default Claude `--fallback-model` chain                                                                                          |
| `AUTOREVIEW_<ENGINE>_MODEL`        | Per-engine model override, for example `AUTOREVIEW_CODEX_MODEL=gpt-5.6-sol`                                                      |
| `AUTOREVIEW_<ENGINE>_THINKING`     | Per-engine thinking override                                                                                                     |
| `AUTOREVIEW_CODEX_CONFIG`          | Safe Codex model/response tuning overrides, semicolon-separated, e.g. `service_tier="fast"`; capability-bearing keys fail closed |
| `AUTOREVIEW_CODEX_SPEED`           | Codex service tier override: `fast` (priority), `flex`, or `default`; silently standard when the model does not list the tier    |
| `AUTOREVIEW_CLAUDE_FALLBACK_MODEL` | Claude-only fallback chain                                                                                                       |
| `AUTOREVIEW_PROVIDER_ENV_ALLOW`    | Comma-separated custom Pi/OpenCode credential variable names; names must end in a recognized credential suffix                   |

Codex maps thinking to `model_reasoning_effort`. Claude maps thinking to `--effort`. Pi maps thinking to `--thinking`. Only Claude accepts `--fallback-model`; global CLI/env fallback requires at least one Claude reviewer, and engine-specific fallback overrides require that reviewer to be selected. Non-Claude fallback overrides, including `AUTOREVIEW_<NONCLAUDE>_FALLBACK_MODEL`, fail closed instead of being silently ignored.

## Review engine isolation

When autoreview runs inside the repository under review, external reviewer CLIs must not load project-local trust or configuration that the branch controls.

| Engine       | Isolation flags                                                                                                                                                                                  | Reference                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| **codex**    | Auth-only config overrides, isolated workspace, `exec --ignore-user-config --ignore-rules --skip-git-repo-check`, plus read-only sandbox                                                         | Codex CLI `exec --help`                                                     |
| **claude**   | `--safe-mode --setting-sources user --strict-mcp-config --disallowedTools mcp__*`; auto-memory and filesystem/shell tools disabled; empty external workspace; WebSearch by default (`v2.1.169+`) | Claude Code [CLI reference](https://code.claude.com/docs/en/cli-reference)  |
| **droid**    | Fails closed: current CLI cannot disable both project instructions and all tools                                                                                                                 | Droid CLI `exec --help` and `--list-tools`                                  |
| **copilot**  | Fails closed: repository read tools also expose ignored files outside the reviewed bundle                                                                                                        | GitHub Copilot CLI command reference                                        |
| **pi**       | `--no-approve --no-session --no-context-files --no-extensions --no-skills --no-prompt-templates --no-themes --no-tools`                                                                          | Pi CLI `--help`; requires Pi `v0.79.0+`                                     |
| **opencode** | Fails closed: project/global config isolation and private-network fetch denial are not both proven                                                                                               | OpenCode CLI contract                                                       |
| **cursor**   | Fails closed: documented read permissions can target absolute host paths and no proven repository-only filesystem sandbox is exposed                                                             | Cursor CLI [permissions](https://cursor.com/docs/cli/reference/permissions) |

Codex `--ignore-user-config` skips config loading for the exec run. Autoreview reconstructs only the documented `cli_auth_credentials_store`, `forced_login_method`, and `forced_chatgpt_workspace_id` settings from `CODEX_HOME/config.toml`, keeping authentication usable without forwarding unrelated user configuration. Codex runs in an empty temporary workspace: the validated bundle is its sole repository input, ignored files and linked-worktree metadata remain unreadable, and the zero project-doc budget keeps workspace instructions out of the prompt. `--ignore-rules` skips user/project execpolicy rules. Claude `--safe-mode` disables project hooks, skills, plugins, MCP servers, and CLAUDE.md; autoreview supplies WebSearch by default, permits only explicitly domain-constrained WebFetch rules, and exposes no filesystem or shell tools. Pi runs from a neutral temporary directory with project resources disabled and `--no-tools`. Droid, Copilot, Cursor, and OpenCode fail closed because their current CLI contracts cannot isolate untrusted review input from host, project, or private-network trust surfaces.

Codex uses a named permission profile that grants read access only to an empty temporary workspace. This is narrower than repository-root access, which would expose ignored credentials, and narrower than the legacy `read-only` sandbox, which permits reads across the host filesystem.

## Context Efficiency

Run the helper directly so target selection, engine choice, structured validation, and exit status all stay in one path. If output is noisy, summarize the completed helper output after it returns; do not ask another agent or reviewer to rerun the review.

## Helper

After setting `AUTOREVIEW` and `AUTOREVIEW_HARNESS` above:

```bash
"$AUTOREVIEW" --help
```

The smoke harness has thin shell wrappers over a shared Python implementation:

```bash
"$AUTOREVIEW_HARNESS" --fixture benign --engine codex
```

The helper:

- chooses dirty local changes first
- accepts `--mode uncommitted` as an alias for `--mode local`
- otherwise uses current PR base if `gh pr view` works
- otherwise uses `origin/main` for non-main branches
- does not fetch automatically during branch review; the selected base ref must already resolve locally
- recognizes `--engine droid`, `copilot`, `cursor`, and `opencode` only to fail closed with isolation errors; runnable engines are `codex`, `claude`, and `pi`; default is `AUTOREVIEW_ENGINE` or `codex`
- resolves bare `git`, `gh`, reviewer, and PowerShell shell commands from absolute `PATH` entries only, never from the reviewed checkout; explicit `--*-bin` paths are interpreted from the reviewed repository root when relative and accepted only when both the supplied path and resolved target stay outside the reviewed repository
- use `--mode commit --commit <ref>` for already-committed work, especially clean `main` after landing
- scans safe Git patches in full, recognizes synthetic fixture values tied to their credential field, reviews them in one pass up to the aggregate prompt limit, and automatically uses complete bounded passes above it
- should be left in `--mode auto` or forced to `--mode branch` for PR/branch work; do not force `--mode local` after committing
- writes only to stdout unless `--output`, `--json-output`, or live streamed engine stderr is set
- supports `--dry-run`, `--parallel-tests`, `--parallel-tests-shell`, `--prompt`, repo-relative `--prompt-file`, repo-relative `--dataset`, `--no-tools`, `--no-web-search`, repeatable Codex-only safe model/response tuning with `--codex-config key=value`, Codex-only `--codex-speed fast|flex|default`, and commit refs
- supports `--stream-engine-output` or `AUTOREVIEW_STREAM_ENGINE_OUTPUT=1` for live engine text while preserving structured validation; Codex and Claude hide tool/file event details, emit compact activity summaries, and report usage at turn completion
- supports opt-in review panels with `--panel` / `--reviewers`, plus per-engine `--model`, `--thinking`, and Claude `--fallback-model`
- uses built-in defaults `codex=gpt-5.6-sol` with `high` reasoning and an access-only `gpt-5.6-terra` retry, plus `claude=claude-fable-5`; honors `AUTOREVIEW_MODEL`, `AUTOREVIEW_THINKING`, `AUTOREVIEW_FALLBACK_MODEL`, and per-engine `AUTOREVIEW_<ENGINE>_MODEL` / `AUTOREVIEW_<ENGINE>_THINKING` environment overrides when CLI flags are omitted
- gives Codex the bundle in an empty workspace with web search available; Claude receives the bundle plus WebSearch by default and optional domain-constrained WebFetch, and Pi receives the bundle with no tools
- runs Claude with `--safe-mode` (`v2.1.169+`), `--setting-sources user`, MCP and auto-memory disabled, no filesystem/shell tools, an empty external workspace, and `--fallback-model` when set
- refuses Droid, Copilot, Cursor, and OpenCode reviews until their CLIs expose the required project, filesystem, and network isolation
- runs Pi `v0.79.0+` from neutral temporary directories with `--no-approve`, `--no-session`, disabled Pi context/resource loading, and `--no-tools` because its built-in read tools are not repository-confined
- prints `review still running: <engine> elapsed=<seconds>s pid=<pid>` to stderr at long-running intervals while waiting for the selected review engine, unless streamed output or compact Codex activity has been visible recently
- prints `autoreview clean: no accepted/actionable findings reported` when the selected review command exits 0
- exits nonzero when accepted/actionable findings are present

## Standards and Spec reviews

Run the Standards and Spec reviews in parallel as two separate autoreview helper invocations against the same frozen target, per [references/reviews.md](references/reviews.md). The outer review worker retains read-only target-repository access to invoke the helper and verify findings. Each helper-created isolated model session receives only the helper's redacted review bundle plus its review prompt. The review worker never passes raw diffs, deleted revisions, or repository access into those isolated sessions.

The task running this skill creates two review-specific prompt files outside the reviewed repository. Both prompts contain their review instructions and the neutral review-boundary facts. The Standards prompt additionally contains required trusted authority text frozen at the target base, and never contains the request, build spec, verbatim request, or intended behavior. The Spec prompt additionally contains the run's build spec or verbatim request and uses the neutral bounds to judge only its designated slice. Neither prompt contains diff content or deleted revisions. Pass each prompt with `--prompt`, because `--prompt-file` intentionally accepts only repository-relative files. Keep each JSON report outside the reviewed repository too.

For an integrated Maestro closeout branch review, run these commands against the same frozen base used by the mandatory panel:

```bash
"$AUTOREVIEW" --mode branch --base "$FROZEN_BASE" --engine codex --max-priority P2 --stream-engine-output \
  --model gpt-5.6-sol --thinking high \
  --prompt "$(cat "$STANDARDS_REVIEW_PROMPT")" --json-output "$STANDARDS_REVIEW_REPORT"

"$AUTOREVIEW" --mode branch --base "$FROZEN_BASE" --engine codex --max-priority P2 --stream-engine-output \
  --model gpt-5.6-sol --thinking high \
  --prompt "$(cat "$SPEC_REVIEW_PROMPT")" --json-output "$SPEC_REVIEW_REPORT"
```

For standalone local or commit review, replace only the target arguments with the exact frozen target arguments used by the structured review. The engine, model, thinking, P2 threshold, stream setting, prompt boundary, and separate external report stay fixed for the Standards and Spec reviews. Do not use `--dry-run`: it exits before TruffleHog and bundle construction. A review is clean only when its own helper invocation reports `trufflehog: clean`, completes structured review, and has every finding resolved. If its preflight or helper invocation fails, that review is unverified and cannot contribute to a clean result. A standalone Spec review with no supplied spec keeps the `no spec available` short circuit in the reference and does not launch or claim a clean Spec result. Maestro always supplies its spec.

Standards and Spec findings use the same verification and scope classification as engine findings. Keep the Standards and Spec reports separate. A Maestro head is clean only when the mandatory panel and both review invocations produce clean results at the same frozen target.

## Reporting

Include:

- review command used
- tests/proof run
- findings accepted/rejected, briefly why
- the Standards and Spec review reports, kept separate, and how each finding was resolved
- the clean result from the final helper/review run, or why a remaining finding was consciously rejected

Do not run another review solely to improve the final report wording. If the final helper run exited 0 and produced no accepted/actionable findings, report that exact run as clean.
