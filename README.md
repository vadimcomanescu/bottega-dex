# Bottega Dex

Bottega Dex ports Bottega's issue-to-pull-request workflow to Codex:

```text
start → discover → spec when discovery adds decisions → architect when needed → panel when its three conditions hold → Claude cross-read when reversal is costly → orchestrate → code-review → spec read → architecture read when reversal is costly → QA when user-facing behavior changes → close
```

Discovery reads the touched code first and scales its unknowns work to the task. `spec` is synthesized only when discovery settles something beyond the request. Otherwise the request text is carried verbatim as the spec. Architect runs only when the design, acceptance criteria, domain terms, or slices need settling. `panel` runs only when a decision is open, costly to reverse, and cannot be settled by a cheap check. The Claude cross-read runs only when a poor design would be costly to reverse. The independent architecture read uses the same condition. QA runs only when a user-facing surface or product behavior changed.

Skip a later phase only when nothing in it is unclear and a wrong call is cheap to reverse. If the work grows, re-enter it.

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

Before the first run in a repository, reconcile its agent map, commands, domain documentation, tracker conventions, merge governance, and labels:

```text
$bottega-dex:setup
```

`setup` is explicit-only. It checks the installed Codex and Claude harness, reads the repository's existing authorities, presents each exact file or GitHub change, and waits for approval before applying anything. A conforming repository produces no changes on a rerun.

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

To run discovery on its own and receive an evidence-backed report without starting a delivery run:

```text
$bottega-dex:discover <task, bug, or issue URL>
```

For domain language or a throwaway design experiment, invoke `$bottega-dex:domain-modeling` or `$bottega-dex:prototype` directly. They do not publish product changes by themselves.

## Workflow

1. `start` settles whether the pull request should hold or merge on green, then creates the isolated branch and worktree and reads the repository's commands and documented merge procedure.
2. `discover` reads the affected code first, then uses narrow read-only scouts and works with the user to settle the direction and boundaries. It can run directly without starting a delivery run.
3. When discovery settled decisions beyond the request, `spec` synthesizes one baseline. Otherwise the request text is the baseline verbatim. The baseline travels through architecture, builder briefs, QA, and review.
4. When needed, `architect` makes the domain terms, design, acceptance criteria, named test interfaces, and independent vertical slices explicit. `panel` is available for the small set of consequential decisions that need model diversity.
5. When a poor design would be costly to reverse, `use-claude` sends the settled design and execution proposal to Claude Fable 5 at high effort for a read-only second opinion.
6. `maestro` invokes the exact upstream `orchestrate` skill. Native Codex subagents fan out across distinct slices, following `implement`; the main task integrates their work and retains approvals. A single builder skips its slice review only when the structured whole-diff review will run. When the integrated diff falls under the `SKILL.md` and prose exception, one fresh high-reasoning reviewer checks the whole docs diff. Multiple builders receive fresh slice reviews before integration.
7. `code-review` runs the bundled Bottega autoreview method on the integrated code diff with GPT-5.6 Sol at high reasoning and Claude Opus 5 at high effort. Its TruffleHog preflight and deletion-side redaction run before any model call. Autoreview owns its Claude invocation.
8. After bug review, a fresh native Codex read checks the whole diff against the spec. When reversal is costly, an independent architecture read follows. Accepted fixes return through implementation and repeat the affected reads.
9. QA is required when a user-facing surface or product behavior changed. In that case, `qa` drives the reviewed artifact through every affected user-visible scenario and records evidence-backed verdicts without editing product code. When no user-facing surface or product behavior changed, `maestro` skips QA.
10. `close` publishes the evidence, opens the pull request, and follows the repository's documented landing mechanism. Opening the PR arms a merge queue where the repository uses one; opener-armed GitHub auto-merge with a red hold check remains the fallback where the repository documents it.

Every run keeps an isolated branch and worktree, green project gates, whole-diff review, and a pull request. Narrow read-only scouts use low reasoning with no inherited conversation. Routine implementation uses medium reasoning and difficult work uses high reasoning. Every agent receives distinct ownership, leaf workers do not delegate, and the main task remains available to the user.

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
    setup/
      SKILL.md
      agents/openai.yaml
      references/merge-governance.md
    start/SKILL.md
    discover/
      SKILL.md
      agents/openai.yaml
    spec/SKILL.md
    domain-modeling/
      SKILL.md
      agents/openai.yaml
      references/CONTEXT-FORMAT.md
      references/ADR-FORMAT.md
      references/LICENSE
    prototype/
      SKILL.md
      agents/openai.yaml
      LOGIC.md
      UI.md
    architect/SKILL.md
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

The surrounding procedures, including `setup`, are adapted from [Bottega at `a1b9385`](https://github.com/vadimcomanescu/bottega/tree/a1b9385d533ccb37cc1fec6ce1361aeef7ed711a/skills). Bottega's Claude-host harness setup becomes Codex plugin and Claude CLI verification; its Fable and Opus worker roles become native Codex orchestration; its GPT cross-read becomes the direct Claude cross-read in `use-claude`; its tracker-owned spec becomes a run-local Codex spec baseline. Its queue-first merge doctrine is applied through the host repository's documented procedure rather than a hard-coded Mergify configuration.

## Review and Claude boundaries

The code-review directory carries Bottega's vendored autoreview method, helper, baselines, fixtures, and tests at the `fe588b1` vendor pin. The helper runs a TruffleHog preflight and redacts secrets found only on deleted lines before the structured review. The integrated panel is pinned to GPT-5.6 Sol at high reasoning and Claude Opus 5 at high effort. Findings are verified against the real code path before accepted issues are repaired and reviewed again.

`use-claude` is the read-only Claude path used for design cross-reads and a panel seat. It invokes Claude Fable 5 at high effort through `claude -p` directly. The existing `scripts/claude-exec` remains a separate bounded reviewer-role adapter using Claude Opus 5 high; autoreview does not call it.

## Verify

```bash
npm ci
npm test
npm run typecheck
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/bottega-dex
```

Adapter changes also require the adapter dry-run contract tests and one minimal real structured-output smoke call.

The autoreview vendor requires `trufflehog` on the machine that runs a review. Setup checks for it and never installs it.

## License

MIT
