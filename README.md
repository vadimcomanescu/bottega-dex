# bottega-dex

One Codex skill takes a task, bug, or issue to a reviewed, evidence-backed pull request.

Bottega Dex is the Codex-native sibling of [Bottega](https://github.com/vadimcomanescu/bottega). Bottega remains the Claude Code product and is not modified by this repository.

## Install

Requirements:

- A current Codex client with plugin and native subagent support.
- Claude Code, logged in. Bottega Dex uses `claude -p` only for the independent model-family review and costly-decision panel.
- Node.js 24 or newer for the bounded Claude adapter.

```bash
codex plugin marketplace add vadimcomanescu/bottega-dex
codex plugin add bottega-dex@bottega-dex
```

Start the task on GPT-5.6 at Ultra. Use the Sol route label when your client exposes it, then invoke:

```text
$bottega-dex:run <task, bug, or issue URL>
```

That is the complete setup. The plugin does not install project agent configuration, add hooks, or start another Codex process.

## The flow

1. Read the repository, history, product context, and host commands. Isolate nontrivial changes on one task branch and worktree.
2. State the behavior, acceptance criteria, and material defaults. Wait for approval unless the user requested autonomous execution.
3. Plan vertical slices. Put costly-to-reverse decisions without repository precedent through a blinded Codex-and-Claude panel.
4. Build with native Codex subagents only when a substantial bounded lane justifies a fresh context. Use one builder at a time by default.
5. Run focused checks during implementation and the repository's decisive full gate on the integrated head.
6. Review the complete frozen diff with two cold reviewers in parallel, one Codex and one Claude. They receive the same target, contract, prompt, and schema, and neither sees the other report.
7. Drive the reviewed artifact as a user. Capture evidence proportional to the surface: screenshots or recordings for visible behavior, runtime evidence for nonvisual behavior.
8. Open the pull request with decisions, verification, both review records, QA evidence, and known limits.

The user approves the specification and merges the pull request. Explicit autonomous instructions remove the first pause, never the merge gate or approvals for deploys, money, destructive actions, or shared and production data.

## Why the second model family stays

Cross-family review is a product invariant, not a Codex packaging requirement. A model reviewing work produced inside its own family can share the same blind spots. Bottega Dex therefore freezes one base, head, and tree, then gives the identical review bundle to a fresh Codex reviewer and a cold Claude reviewer. Their reports are blind and schema-compatible. The orchestrator verifies findings and decides from evidence rather than voting.

Claude is reached directly through one bounded adapter. A proxy service would add credentials, routing state, and another protocol boundary without improving this review.

## Routing

| Work | Route |
| --- | --- |
| Orchestrator | GPT-5.6 Sol, Ultra, current task |
| Substantial mechanical or read-heavy lane | Luna high when exposed, otherwise GPT-5.6 Terra high |
| Builder, Codex reviewer, QA | GPT-5.6 Sol, high |
| Independent reviewer and panel roles | Claude Opus through `claude -p` |

These are workflow requests, not files installed into the host repository. The active Codex client owns model availability, sandboxing, permissions, and native agent lifecycle.

## Architecture

The plugin exposes one skill, `run`. Its worker prompts, design rules, panel method, and schemas are references loaded only when needed. Native Codex threads handle Codex work. `scripts/claude-exec` is the only external boundary and accepts only reviewer, panelist, and compare-only judge roles.

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

The research behind the architecture is in [the simplification report](docs/research/2026-07-14-world-class-plugin-simplification.md).

## Sources

- [OpenAI prompting guidance](https://learn.chatgpt.com/docs/prompting)
- [OpenAI skill guidance](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI plugin structure](https://learn.chatgpt.com/docs/build-plugins)
- [OpenAI native subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Anthropic Claude Code CLI](https://code.claude.com/docs/en/cli-usage)

## License

MIT
