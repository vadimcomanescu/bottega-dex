# Bottega Dex plugin simplification research

Date: 2026-07-14

Scope: current official OpenAI Codex documentation and source, official Anthropic Claude Code documentation, and first-party public workflow-plugin repositories. The product examined is Bottega Dex 0.2.0 at commit [`13734ba`](https://github.com/vadimcomanescu/bottega-dex/tree/13734ba300c2b3979ad569aaf174a238d6ee9738).

## Decision

Bottega Dex should be a small, skills-first Codex plugin. The active Codex task is the orchestrator. It delegates bounded work through native subagents, gives each worker a skill-local role prompt, runs one cold Codex review and one cold Claude review over the same frozen integrated diff, arbitrates their findings, runs the host repository's decisive gate, performs proportional user-facing QA, and opens a pull request.

It should not install project agent configuration, enforce the root model with hooks, start another Codex process, run panels for ordinary choices, or create a separate evidence branch for every change. Claude remains a required independent reviewer because cross-family review is a Bottega product invariant. The same blind, cross-family method remains available before implementation only for choices that are expensive to reverse and not settled by repository precedent.

The smallest package that preserves Bottega's full doctrine is one `run` skill with progressively loaded role prompts and schemas, plus one bounded Claude adapter:

```text
plugins/bottega-dex/
  .codex-plugin/plugin.json
  skills/run/
    SKILL.md
    references/
      agents/
      codebase-design.md
      panel.md
      *.schema.json
  scripts/
    claude-exec
```

Ship no hooks. Keep the one script because OpenAI's skill guidance identifies external tooling and deterministic behavior as valid reasons for a script, and this adapter must invoke an external family, bound the process, validate structured output, and fail closed on identity mismatch.

## Verified facts

### 1. Codex plugins distribute workflows, not host agent configuration

- OpenAI defines a skill as the reusable workflow and a plugin as the distribution package. Skills use progressive disclosure, and instruction-only is the default. OpenAI advises keeping each skill focused on one job and preferring instructions over scripts unless deterministic behavior or external tooling requires code. [Build skills](https://learn.chatgpt.com/docs/build-skills#best-practices)
- The documented Codex plugin manifest can point to skills, hooks, apps, and MCP servers. It has no custom-agent manifest field. OpenAI's minimal example is a plugin containing one skill. [Build plugins](https://learn.chatgpt.com/docs/build-plugins#plugin-structure)
- Codex custom workers are host configuration. They live in `~/.codex/agents/` or a project's `.codex/agents/` as standalone TOML files. OpenAI notes that this configuration is heavier and may evolve. Codex already ships `default`, `worker`, and `explorer` agents. [Subagents, custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents#custom-agents)
- The optional `agents/openai.yaml` inside a skill controls presentation, invocation policy, and tool dependencies. It is not a worker definition. [Build skills, optional metadata](https://learn.chatgpt.com/docs/build-skills#optional-metadata)
- The current Codex source matches the documentation. The plugin manifest exposes skills, MCP servers, apps, and hooks, while custom agent roles are loaded from configuration layers. [Plugin manifest source](https://github.com/openai/codex/blob/5bed6447998c754d154dbd796517310b8f04d4ce/codex-rs/plugin/src/manifest.rs#L17-L24), [agent-role source](https://github.com/openai/codex/blob/5bed6447998c754d154dbd796517310b8f04d4ce/codex-rs/core/src/config/agent_roles.rs#L19-L97)

This differs from Claude Code. Claude plugins can bundle native agent definitions under `agents/`. [Claude plugin components](https://code.claude.com/docs/en/plugins-reference#plugin-components-reference) That Claude facility should not be copied into a Codex plugin as if the runtimes had the same package contract.

### 2. Native Codex already provides the orchestrator and worker harness

- Codex handles spawning, follow-up instructions, waiting, and closing agent threads. The main task collects the results. [Subagent orchestration](https://learn.chatgpt.com/docs/agent-configuration/subagents#orchestration-and-thread-controls)
- OpenAI recommends subagents for independent, bounded work and noisy read-heavy work. It warns that parallel write-heavy workflows add conflicts and coordination cost. [Why subagent workflows help](https://learn.chatgpt.com/docs/agent-configuration/subagents#why-subagent-workflows-help)
- Exact model and effort can be selected in a host custom-agent file. Otherwise Codex can route automatically or the prompt can steer the choice. OpenAI recommends `gpt-5.6` for demanding work and `gpt-5.6-terra` for lighter read-heavy work. The root task's model and intelligence level are selected by the host interface, not by a plugin manifest. [Choosing models and reasoning](https://learn.chatgpt.com/docs/agent-configuration/subagents#choosing-models-and-reasoning)
- The default `agents.max_depth = 1` permits direct children and prevents recursive fan-out. [Subagent global settings](https://learn.chatgpt.com/docs/agent-configuration/subagents#global-settings)
- Claude's own documentation reaches the same operational boundary: use subagents for self-contained or noisy work, use the main conversation for shared context and quick iteration, and use worktrees when concurrent tasks touch code. [Claude subagents](https://code.claude.com/docs/en/sub-agents), [parallel agents](https://code.claude.com/docs/en/agents)

No `codex exec`, proxy, or second Codex process is needed. The host already owns the agent lifecycle.

### 3. Strong public Codex plugins use skill-local prompts

- OpenAI's Superpowers plugin keeps implementer and reviewer prompts beside the orchestration skill and dispatches fresh native subagents. [Orchestration skill](https://github.com/openai/plugins/blob/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/superpowers/skills/subagent-driven-development/SKILL.md), [implementer prompt](https://github.com/openai/plugins/blob/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/superpowers/skills/subagent-driven-development/implementer-prompt.md)
- OpenAI's Wix plugin passes a worker an instruction-file path and deliberately keeps worker-only instructions out of the orchestrator's context. [Wix orchestration](https://github.com/openai/plugins/blob/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/wix/skills/wix-headless/SKILL.md#L52-L65), [Wix build dispatch](https://github.com/openai/plugins/blob/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/wix/skills/wix-headless/references/BUILD.md)
- Compound Engineering's current first-party repository explicitly ships 30 skills and zero standalone agents. Specialist behavior lives in skill-local prompt assets, and its native Codex install has no separate custom-agent installation step. [Compound Engineering inventory](https://github.com/EveryInc/compound-engineering-plugin/blob/1a7a4c1e844b55fe74f2aac79d9879cc136fbb5b/README.md#L111-L125), [Codex installation](https://github.com/EveryInc/compound-engineering-plugin/blob/1a7a4c1e844b55fe74f2aac79d9879cc136fbb5b/README.md#L171-L208)

These repositories prove that role identity does not require plugin-installed custom TOML agents. A bounded prompt asset plus native dispatch is a current, supported pattern.

### 4. Concise context and repository-native gates matter more than universal ceremony

- OpenAI's harness-engineering guidance treats the root instruction file as a map, not an encyclopedia. It uses progressive disclosure, enforces hard invariants mechanically, and allows autonomy inside those boundaries. [Harness engineering](https://openai.com/index/harness-engineering/)
- The same account says end-to-end behavior depends heavily on repository-specific structure and tooling and should not be assumed to generalize without similar investment. [Harness engineering, autonomy](https://openai.com/index/harness-engineering/#increasing-levels-of-autonomy)
- Anthropic describes hooks as event automation that must run on every matching event. Plugins are the packaging layer, not a reason to add hooks by default. [Claude extension overview](https://code.claude.com/docs/en/features-overview#match-features-to-your-goal)

### 5. Heterogeneous evaluators have empirical support, with limits

- The PoLL study evaluated panels drawn from disjoint model families across three judge settings and six datasets. Its diverse panels correlated better with human judgments than a single GPT-4 judge and exhibited less intra-model bias. [Replacing Judges with Juries](https://arxiv.org/abs/2404.18796)
- Self-preference research found that GPT-4 assigned significantly higher evaluations to outputs that were more familiar to it than human evaluators did. This supports avoiding sole reliance on one model family's evaluation preferences. [Self-Preference Bias in LLM-as-a-Judge](https://arxiv.org/abs/2410.21819)
- Mixture-of-Agents research showed that multiple model outputs can improve results, but later work found a real quality-diversity tradeoff. Diversity helps when quality is held fixed, while mixing in weaker models can reduce performance. [Mixture-of-Agents](https://arxiv.org/abs/2406.04692), [Rethinking Mixture-of-Agents](https://arxiv.org/abs/2502.00674)

These studies concern evaluation and answer aggregation, not production code review of a frozen diff. They support the architectural premise that strong, independently trained families can expose different errors and biases. They do not prove that exactly one Codex reviewer plus one Claude reviewer has a specific defect-recall improvement. That exact gate is Bottega product doctrine, not a verified platform requirement or a direct consequence of the papers.

The counterevidence matters to the design. Cross-family review should use two strong reviewers against the same evidence. It should not expand into a large standing panel, majority vote, or weak-model fan-out. The orchestrator should verify each finding against code and tests instead of treating agreement as truth or disagreement as failure.

### 6. Claude Code exposes a small, official review interface

- Anthropic documents `claude -p` for non-interactive use and explicitly shows piping a Git diff into Claude as a reviewer. [Run Claude Code programmatically](https://code.claude.com/docs/en/headless#add-claude-to-a-build-script)
- `--output-format json` plus `--json-schema` returns validated structured output, while the JSON envelope also includes session, cost, and per-model usage metadata. [Structured output](https://code.claude.com/docs/en/headless#get-structured-output)
- `--safe-mode` disables local customizations while preserving authentication, and `--tools` can restrict the reviewer to read-only tools. `--no-session-persistence` prevents saving a resumable session. `--model` and `--effort` select the requested reviewer route. [Claude CLI reference](https://code.claude.com/docs/en/cli-usage)
- `claude auth status` is a documented machine-readable preflight that exits nonzero when the user is not authenticated. [Claude CLI commands](https://code.claude.com/docs/en/cli-usage#cli-commands)

This is sufficient for one bounded adapter. CLIProxyAPI is unnecessary. It would add an extra routing and trust layer without improving independence, evidence parity, or output validation.

## Platform facts and Bottega doctrine

Official platform documentation answers what Codex and Claude can package, configure, and execute. It does not define Bottega's quality policy.

The following are platform facts:

- Codex plugins package skills, hooks, apps, and MCP configuration, but not project custom-agent TOMLs.
- Codex natively manages its subagent threads.
- Claude Code provides a supported non-interactive CLI with restricted tools and schema-constrained output.

The following are Bottega product doctrine:

- Every integrated diff receives one cold Codex review and one cold Claude review.
- Both reviewers receive the same frozen target, requirements, repository rules, reviewer prompt, and report contract.
- Neither reviewer sees the other's findings or the orchestrator's preferred conclusion.
- The orchestrator checks findings against evidence and owns the final judgment.

Absence of cross-family review from OpenAI's plugin requirements is not evidence against this doctrine. It only means Codex does not provide cross-provider review as a native plugin component.

## Inference from the sources

### What is plugin responsibility

The plugin should own the repeatable issue-to-PR method, delegation boundaries, worker and reviewer briefs, mandatory cross-family integrated review, delivery criteria, and a compact comparable report format. Those are portable workflow concerns and Bottega's differentiating quality policy.

The host should own the root model, reasoning effort, sandbox, approvals, available tools, GitHub authentication, and optional custom agents. Those are runtime or project policy concerns.

The target repository should own its architecture, commands, tests, lint rules, documentation, QA tooling, and release constraints. Bottega Dex should discover and honor them, not replace them with a universal harness.

### Ceremony in Bottega Dex 0.2.0

| Current element | Evidence in 0.2.0 | Decision | Reason |
| --- | --- | --- | --- |
| Exact GPT-5.6 Sol Ultra model guard hook | [`run` lines 8-10](https://github.com/vadimcomanescu/bottega-dex/blob/13734ba300c2b3979ad569aaf174a238d6ee9738/plugins/bottega-dex/skills/run/SKILL.md#L8-L10), [`hooks.json`](https://github.com/vadimcomanescu/bottega-dex/blob/13734ba300c2b3979ad569aaf174a238d6ee9738/plugins/bottega-dex/hooks/hooks.json) | Remove the global hook, keep the scoped run check | Root model choice belongs to the host, so the plugin cannot set it. The run skill stops when the client visibly shows a route below the required GPT-5.6 Sol Ultra orchestrator. |
| `setup` skill and five custom-agent TOMLs | [`setup`](https://github.com/vadimcomanescu/bottega-dex/blob/13734ba300c2b3979ad569aaf174a238d6ee9738/plugins/bottega-dex/skills/setup/SKILL.md) | Remove from the plugin | It mutates project-scoped host configuration to compensate for a package feature Codex does not provide. Native workers and prompt assets are sufficient. |
| Mandatory Claude preflight and `claude-exec` adapter | [`run` line 34](https://github.com/vadimcomanescu/bottega-dex/blob/13734ba300c2b3979ad569aaf174a238d6ee9738/plugins/bottega-dex/skills/run/SKILL.md#L34) | Simplify and retain | Keep one bounded adapter for reviewer, panelist, and compare-only judge roles. Preflight authentication and version once, then use schema-constrained, non-persistent calls. |
| Mandatory native plus Claude review | [`run` line 48](https://github.com/vadimcomanescu/bottega-dex/blob/13734ba300c2b3979ad569aaf174a238d6ee9738/plugins/bottega-dex/skills/run/SKILL.md#L48) | Retain | This is Bottega doctrine. Two strong disjoint families review the same frozen integrated diff independently. The orchestrator verifies findings rather than voting. |
| Blind panel with two drafts and a judge | [`panel`](https://github.com/vadimcomanescu/bottega-dex/blob/13734ba300c2b3979ad569aaf174a238d6ee9738/plugins/bottega-dex/skills/panel/SKILL.md) | Retain with a narrow trigger | Repository precedent settles normal design. Use the panel only for public contracts, persisted data, dependencies, or module boundaries that are expensive to reverse. |
| JSON schemas for review and panel output | [`review schema`](https://github.com/vadimcomanescu/bottega-dex/blob/13734ba300c2b3979ad569aaf174a238d6ee9738/plugins/bottega-dex/skills/reviewing/references/report.schema.json) | Retain and colocate | Comparable cross-family output, target identity validation, blinded comparison, and fail-closed parsing are machine-consumption requirements. |
| Mechanic and QA identities | [`run` routing table](https://github.com/vadimcomanescu/bottega-dex/blob/13734ba300c2b3979ad569aaf174a238d6ee9738/plugins/bottega-dex/skills/run/SKILL.md#L18-L30) | Keep as short prompt assets | They do not install host agents. They make bounded delegation and the non-fixing QA boundary explicit without expanding the public skill surface. |
| Worker per slice, parallel worktrees, full suite after every integration | [`run` line 42](https://github.com/vadimcomanescu/bottega-dex/blob/13734ba300c2b3979ad569aaf174a238d6ee9738/plugins/bottega-dex/skills/run/SKILL.md#L42) | Simplify | Use one task worktree. Run focused checks while building and the decisive host gate on the integrated head. Parallelize only truly independent work. |
| Fixed three-round review protocol | [`run` line 48](https://github.com/vadimcomanescu/bottega-dex/blob/13734ba300c2b3979ad569aaf174a238d6ee9738/plugins/bottega-dex/skills/run/SKILL.md#L48) | Simplify | Fix confirmed findings, rerun the full blind pair on the new complete head, and escalate when the design is wrong or progress stalls. |
| Mandatory screenshots, GIFs, recordings, and evidence branch | [`run` line 50](https://github.com/vadimcomanescu/bottega-dex/blob/13734ba300c2b3979ad569aaf174a238d6ee9738/plugins/bottega-dex/skills/run/SKILL.md#L50) | Replace | Drive user-visible behavior when relevant. Attach the smallest useful evidence through the host's existing artifact path. Do not create a branch for evidence by default. |
| `.bottega/run` state and session record | [`run` line 34](https://github.com/vadimcomanescu/bottega-dex/blob/13734ba300c2b3979ad569aaf174a238d6ee9738/plugins/bottega-dex/skills/run/SKILL.md#L34) | Remove | The task, worktree, branch, commits, test output, and pull request already provide recoverable state. |
| Mandatory spec sign-off for every run | [`run` lines 12 and 38](https://github.com/vadimcomanescu/bottega-dex/blob/13734ba300c2b3979ad569aaf174a238d6ee9738/plugins/bottega-dex/skills/run/SKILL.md#L12-L38) | Replace | Infer routine details from the request and repository. Ask only when ambiguity changes scope, user-visible behavior, or an expensive decision. Keep explicit approval for deploys, money, destructive actions, and shared data. |
| Entry reminder hook | [`hooks.json`](https://github.com/vadimcomanescu/bottega-dex/blob/13734ba300c2b3979ad569aaf174a238d6ee9738/plugins/bottega-dex/hooks/hooks.json) | Remove | Explicit `$bottega-dex:run` invocation and a precise skill description are enough. A hook on every prompt is broader than the workflow needs. |

## Recommendation

### Architecture

1. Keep one public skill, `$bottega-dex:run`.
2. Keep the active Codex task as orchestrator. It owns scope, decisions, integration, review arbitration, and delivery.
3. Store short builder, reviewer, QA, mechanic, panelist, and judge prompts beside the run skill. Pass their absolute paths only when the matching dispatch is justified.
4. Use Codex's built-in worker or default agent. Do not require project custom-agent installation.
5. Require GPT-5.6 Sol at Ultra for the orchestrator. The plugin cannot select it, so the run skill stops only when the active client visibly reports a different route and does not pretend to verify hidden settings.
6. Default to zero implementation workers. Use one worker for a substantial bounded implementation lane. The mandatory cold Codex reviewer is a separate review call, not implementation fan-out.
7. Retain one compact review schema shared by Codex and Claude.
8. Retain one `claude-exec` adapter with only reviewer, panelist, and compare-only judge routes. Ship no hooks.

### Minimal cross-family review contract

1. Freeze `base_sha`, `head_sha`, and `tree_sha` after the integrated host gate passes. Generate one review bundle containing the patch, acceptance criteria, applicable repository instructions, and pointers to the frozen source tree.
2. Start both reviews from the same bundle and source snapshot. Use a fresh native Codex reviewer in a disposable checkout. In parallel, run `claude -p` through the adapter with `--safe-mode`, a strong Claude model and high effort, no Edit or Write tools, Bash for gates and probes inside a disposable checkout, `--no-session-persistence`, `--output-format json`, and `--json-schema`. Reject the call if tracked files change.
3. Use the same reviewer prompt and compact schema. The schema needs only reviewer family, requested model, the three target SHAs, findings, and blocked checks. Each finding needs severity, a short defect statement, impact, file and line, and reproducible evidence.
4. Validate target identity programmatically. Both reports must echo the exact frozen SHAs. Reject a stale or malformed report.
5. Validate reviewer identity from the dispatch channel, not only from self-reported JSON. For Codex, retain the native thread and reported model metadata. For Claude, pass the frozen head and tree to the adapter, verify that the checkout matches them, and retain that identity with the CLI version, requested route, successful process result, and per-model usage metadata from the JSON envelope. Fail closed when the target or expected family cannot be established.
6. Keep the reviews blind. Neither reviewer receives the other report, the orchestrator's narrative, or a generated candidate finding list.
7. The orchestrator confirms or refutes each finding against the frozen code and relevant checks. Agreement increases confidence but is not required. Disagreement is useful evidence, not a reason to ask a third model automatically.
8. Any fix changes the frozen head and invalidates both reports. Rerun focused verification and the decisive host gate, freeze the new complete diff, then run a fresh blind Codex-and-Claude pair before delivery.

### Delivery flow

1. **Scope.** Read the request, repository instructions, relevant code, and history. State acceptance criteria briefly. Ask only for a material missing choice.
2. **Isolate.** For edits, work on one task branch and worktree. Do not create per-slice worktrees.
3. **Build.** Keep reads, commands, small deterministic edits, and integration in the orchestrator. Delegate only substantial, bounded implementation with explicit ownership and a verifier.
4. **Verify while building.** Run focused tests and static checks related to the changed surface.
5. **Review the integrated diff.** Freeze base, head, and tree identity. Run one fresh Codex reviewer and one fresh Claude reviewer in parallel against the same bundle, prompt, schema, and source snapshot. Keep them blind and validate both target and reviewer identity.
6. **Arbitrate, fix, and recheck.** The orchestrator confirms or refutes findings with evidence. Resolve confirmed findings, run focused checks and the decisive gate, freeze the new head, and rerun the full blind Codex-and-Claude pair.
7. **QA proportionally.** For user-visible behavior, drive the real surface and report what was verified. For internal-only changes, tests and targeted runtime checks are enough. Use the host's existing screenshot, recording, or CI artifact path only when it improves reviewability.
8. **Deliver.** Open a pull request with the behavior change, tests run, QA performed, and material risks or unresolved limits. Update documentation only when the diff changed durable facts.

### Gates worth retaining

- One isolated task branch or worktree when modifying a repository.
- Clear acceptance criteria before implementation, without a universal approval pause.
- Focused verification during implementation and the host repository's decisive gate before delivery.
- One cold Codex review and one cold Claude review of the same frozen integrated diff.
- Comparable structured reports, exact target identity checks, and reviewer-family provenance checks.
- Real user-facing QA when the change has a user-facing surface.
- Explicit approval before deploys, money movement, destructive operations, or shared and production data changes.
- A pull request that states behavior, verification, QA, and known risks.

## Bottom line

The target Bottega Dex architecture is a concise Codex skill that trusts the native task and subagent harness, keeps role prompts local to the skill, discovers repository-native gates, and adds exactly one external boundary for Bottega's cross-family review and costly-decision doctrine. It is not a Claude workflow port, and it does not need another Codex process or a general model proxy.

Bottega Dex 0.2.0 has the right core sequence: understand, specify, plan, build, verify, cross-family review, QA, deliver. Remove exact root-model enforcement, the project-agent installer, hooks, repeated full gates, the mandatory evidence branch, and persistent run state. Keep the narrowly triggered panel, the Claude boundary, and shared schemas because they enforce deliberate product invariants: costly choices get independent challenge, and two strong independently trained families inspect the same final diff before delivery.
