# Bottega Dex

Bottega Dex is an issue-to-PR workflow for Codex. Give it a task, bug, or issue URL and it takes the work through repository discovery, specification, implementation, verification, independent review, QA, and pull request delivery.

It is the Codex-native edition of [Bottega](https://github.com/vadimcomanescu/bottega). Codex owns orchestration and implementation. Claude provides an independent second model family for final review and costly design decisions.

## What a run delivers

Every run produces:

- an isolated task branch and worktree
- an explicit behavior contract and acceptance criteria
- implementation verified by the repository's own checks
- a complete-diff review from both Codex and Claude
- QA evidence matched to the changed surface
- a pull request containing decisions, verification, review results, evidence, and known limits

The final integrated review is mandatory. It is never replaced by slice review or skipped because a change is small.

## Install

Requirements:

- A current Codex client with plugin and native subagent support.
- Claude Code, authenticated for non-interactive `claude -p` calls.
- Node.js 24 or newer for the Claude adapter.

```bash
codex plugin marketplace add vadimcomanescu/bottega-dex
codex plugin add bottega-dex@bottega-dex
```

Start a Codex task on GPT-5.6 at Ultra. Use the Sol route label when the client exposes it, then invoke:

```text
$bottega-dex:run <task, bug, or issue URL>
```

## How it works

1. **Understand.** Read repository instructions, relevant code, history, product context, remotes, and host commands. Create one task branch and worktree.
2. **Specify.** State the intended behavior, acceptance criteria, definition of done, and material defaults. Wait for approval unless the user requested autonomous execution.
3. **Plan.** Divide the work into vertical slices with clear interfaces and verifiers. Send costly decisions without repository precedent to the independent design panel.
4. **Build.** Use one builder at a time. Keep routine reads and commands in the orchestrator, and delegate only substantial bounded work that benefits from a fresh context.
5. **Verify.** Run focused checks during implementation and the repository's decisive full gate on the integrated head.
6. **Review.** Freeze the complete diff by base, head, and tree SHA. Start one cold Codex reviewer and one cold Claude reviewer against the same target and contract.
7. **QA.** Drive the reviewed artifact as a user. Capture screenshots or recordings for visible behavior and targeted runtime evidence for nonvisual behavior.
8. **Deliver.** Open a pull request with the behavior change, decisions, checks, both review records, QA evidence, and known limits.

Any fix after review changes the frozen head. Bottega Dex reruns the decisive gate and both complete-diff reviews before delivery.

The user approves the specification and merges the pull request. Autonomous execution can remove the specification pause, but it never removes approval for deploys, money movement, destructive actions, or changes to shared and production data.

## Cross-family review

The final integrated diff is reviewed independently by two model families:

- A native Codex reviewer inspects the frozen checkout with the repository's instructions and review contract.
- A Claude Opus reviewer receives the same target, requirements, reviewer method, and output schema through a bounded `claude -p` adapter.

Both reviewers start without implementation history. Neither sees the other report, candidate findings, or an orchestrator conclusion. Their reports use the same schema so the orchestrator can reproduce each finding, check it against code and tests, and decide from evidence. Agreement raises confidence, but findings are never accepted by vote alone.

The Claude adapter binds the review to the requested head and tree, requires structured output, records CLI and model-usage provenance, enforces a timeout, and rejects any call that changes the frozen tracked target. A successful report therefore identifies both the reviewer family and the exact code it reviewed.

## Roles and routing

| Role | Responsibility | Route |
| --- | --- | --- |
| Orchestrator | Scope, design, routing, integration, arbitration, and delivery | GPT-5.6 Sol, Ultra |
| Mechanic | Substantial mechanical or read-heavy discovery with an exact verifier | Luna high when exposed, otherwise GPT-5.6 Terra high |
| Builder | One bounded implementation slice | GPT-5.6 Sol, high |
| Codex reviewer | Cold review of the complete frozen diff | GPT-5.6 Sol, high |
| Claude reviewer | Independent review of the same frozen diff | Claude Opus through `claude -p` |
| QA | User-facing acceptance scenarios and evidence | GPT-5.6 Sol, high |
| Panel | Independent drafts and comparison for costly decisions | Codex Sol and Claude Opus |

The active Codex task owns the native agent lifecycle. Worker methods live beside the run skill and are loaded only for the role that needs them.

## Plugin structure

The plugin exposes one user-facing skill, `run`. Its role prompts, design rules, panel method, and report schemas are internal references.

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
    exec-common.js
```

## Develop

```bash
npm ci
npm test
npm run typecheck
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/bottega-dex
```

Adapter changes also require a minimal real Claude structured-output smoke call.

The design decisions and supporting sources are documented in the [architecture research](docs/research/2026-07-14-plugin-simplification.md).

## Sources

- [OpenAI prompting guidance](https://learn.chatgpt.com/docs/prompting)
- [OpenAI skill guidance](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI plugin structure](https://learn.chatgpt.com/docs/build-plugins)
- [OpenAI native subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Anthropic Claude Code CLI](https://code.claude.com/docs/en/cli-usage)

## License

MIT
