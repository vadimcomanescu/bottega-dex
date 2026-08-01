# Bottega Dex

Bottega Dex ports Bottega's issue-to-pull-request workflow to Codex:

```text
start → discover → spec when discovery adds decisions → architect when needed → panel when its three conditions hold → Claude cross-read when reversal is costly → orchestrate → closeout review with parallel Standards and Spec reviews → architecture read when reversal is costly → QA when user-facing behavior changes → close
```

Discovery reads the touched code first and scales its unknowns work to the task. As it settles a term or a qualifying decision, it updates the repository's glossary or ADR inline. `spec` is synthesized only when discovery settles something beyond the request. Otherwise the request text is carried verbatim as the spec. Architect runs only when the design, acceptance criteria, domain terms, or slices need settling. `panel` runs only when a decision is open, costly to reverse, and cannot be settled by a cheap check. The Claude cross-read runs only when a poor design would be costly to reverse. The independent architecture read uses the same condition. QA runs only when a user-facing surface or product behavior changed.

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

To restate the immediately preceding assistant reply once in plain language:

```text
$bottega-dex:bro
```

To run discovery on its own and receive an evidence-backed report without starting a delivery run:

```text
$bottega-dex:discover <task, bug, or issue URL>
```

For domain language or a throwaway design experiment, invoke `$bottega-dex:domain-modeling` or `$bottega-dex:prototype` directly. They do not publish product changes by themselves.

## Workflow

1. `start` settles whether the pull request should hold or merge on green, then creates the isolated branch and worktree and reads the repository's commands and complete landing procedure: its hold brake, opener action, landing mechanism, every applicable disarm or withdrawal action, the readback proving terminal ineligibility, and its outcome signals.
2. `discover` reads the affected code first, then uses narrow read-only scouts and works with the user to settle the direction and boundaries. During a Maestro run, resolved glossary terms and qualifying ADRs are written immediately in the isolated worktree. Standalone discovery does not edit the caller's checkout; it records exact proposed changes for a later isolated delivery run.
3. When discovery settled decisions beyond the request, `spec` synthesizes one baseline. Otherwise the request text is the baseline verbatim. The baseline travels through architecture, builder briefs, QA, and review.
4. When needed, `architect` makes the domain terms, design, acceptance criteria, named test interfaces, and independent vertical slices explicit. `panel` is available for the small set of consequential decisions that need model diversity. `bro` restates one preceding reply plainly when invoked; it does not persist across turns. Maestro independently keeps its own messages plain during a run.
5. When a poor design would be costly to reverse, `use-claude` sends the settled design and execution proposal to Claude Fable 5 at high effort for a read-only second opinion.
6. Before implementation, Maestro freezes the integration base and neutral boundary facts: base, owner boundary, exact slice file bounds, non-test LOC, and named test interfaces. The spec or verbatim request stays separate. Standards receives the neutral facts plus trusted frozen-base authority and no behavior; Spec receives the same facts plus the behavioral baseline. The main run worktree remains the integration worktree. Before multi-builder dispatch, Maestro creates one slice branch and worktree per independent slice from the frozen base. Each builder edits only its slice worktree, so parallel builders never share Git state. The trusted sanitized helper reviews that slice branch against the frozen base at P2 with streamed output, the selected high-reasoning engine, and its exact-model smoke boundary. Only the accepted slice commit is integrated into the main run worktree. A single builder may use the main run worktree and skip slice review only when the structured whole-diff review will run.
7. One fresh high-reasoning review worker owns review convergence for the integrated code diff. Its dispatch includes the frozen integration base, neutral boundary facts, separate behavioral baseline, and threat-model sentence. Standards receives neutral facts plus trusted authority and no behavior; Spec receives those facts plus behavior. The worker is a leaf: it runs the bundled Bottega autoreview method, verifies and classifies findings, and returns accepted repair briefs without spawning builders or editing production code. The main task never edits production code; it dispatches `implement` builders, then returns the repaired head to the same worker for proof and reruns. It keeps a fixed GPT-5.6 Sol and Claude Opus 5 panel across every rerun. Reviews run at P2, and the session must pass the malicious smoke harness before a clean review is trusted. Its TruffleHog preflight and deletion-side redaction run before any model call.
8. The Standards and Spec reviews run in parallel and stay separate, following Bottega `7ee58ba`: Standards checks repository conventions and the review baseline, while Spec checks the promised behavior. When reversal is costly, an independent architecture read follows. An architecture-driven repair re-enters `panel` when its conditions hold, then repeats the complete dual-panel, Standards, and Spec reviews. After two review-triggered repair cycles without convergence, the root task pauses and reclassifies the remaining findings.
9. QA is required when a user-facing surface or product behavior changed. In that case, `qa` drives the reviewed artifact through every required user-visible scenario and records evidence-backed verdicts without editing product code. Any post-review change returns through every required review. The complete required QA scenario set then runs on the final reviewed SHA, never only an affected subset, so all evidence names one SHA. A scenario that still fails after two QA repair rounds returns to the root task. When no user-facing surface or product behavior changed, `maestro` skips QA.
10. `close` publishes the evidence, opens the pull request with the project's documented brake when held, and follows the complete landing procedure. A queue-owned eligible non-draft PR receives no auto-merge arm. GitHub auto-merge is armed only when the procedure assigns that action to the opener; its required brake check remains the documented fallback. If hold enforcement cannot be proved, Close performs every documented disarm or withdrawal action across GitHub, queues, and repository-owned mechanisms, uses draft only when the procedure names it as safe, and reports a safe stop only after every applicable readback proves the PR terminally ineligible. Any other repository-owned mechanism receives only its documented opener action, and the final report reads its outcome from the same procedure.

Every run keeps an isolated branch and worktree, green project gates, whole-diff review, and a pull request. Narrow read-only scouts use low reasoning with no inherited conversation. Routine implementation uses medium reasoning and difficult work uses high reasoning. Every agent receives distinct ownership, leaf workers do not delegate, and the main task remains available to the user.

Every diff, including skill and workflow prose, goes through the sanitized review helper. Skill changes also receive deterministic plugin validation and Codex compatibility checks.

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

The surrounding procedures, including `setup`, are adapted from [Bottega 0.177.0 at `7ee58ba`](https://github.com/vadimcomanescu/bottega/tree/7ee58ba7ca3c0677c2f1405bdb52b4ba3b7a09b7/skills). Bottega's Claude-host harness setup becomes Codex plugin and Claude CLI verification; its Fable and Opus worker roles become native Codex orchestration; its GPT cross-read becomes the direct Claude cross-read in `use-claude`; its tracker-owned spec becomes a run-local Codex spec baseline. Dex keeps the review worker's GPT/Claude panel fixed rather than using Bottega's conditional panel. Bottega's complete host-defined landing procedure is applied while Dex retains queue-owned non-draft semantics and its fail-closed opener-armed fallback.

## Review and Claude boundaries

The code-review directory carries Bottega's vendored autoreview method, helper, baselines, fixtures, and tests at the `fe588b1` vendor pin. The helper runs a TruffleHog preflight and redacts secrets found only on deleted lines before the structured review. The review worker uses GPT-5.6 Sol at high reasoning and Claude Opus 5 at high effort. P2 is the default actionable threshold; the malicious smoke harness is required before a session treats a clean exit as clean. Findings are verified against the real code path before accepted issues are repaired and reviewed again.

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
