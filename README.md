# bottega-dex

Autonomous issue-to-PR runs for Codex. One skill takes a task, bug, or GitHub issue to a reviewed, evidence-backed pull request.

Bottega Dex is the Codex-native sibling of [bottega](https://github.com/vadimcomanescu/bottega). Bottega remains the Claude Code product. This repository preserves its process while making Codex the orchestrator.

## Install

Requirements:

- Codex CLI 0.144.0 or newer, logged in.
- Claude Code 2.1.207 or newer, logged in. Claude is used only for the independent model-family paths.
- Node.js 24 or newer for plugin scripts.

```bash
codex plugin marketplace add vadimcomanescu/bottega-dex
codex plugin add bottega-dex@bottega-dex
```

Start the orchestrator on GPT-5.6 with Ultra reasoning. In clients that display routing tiers, use Sol:

```bash
codex -m gpt-5.6 -c 'model_reasoning_effort="ultra"'
```

In the Codex app, select GPT-5.6 Sol and Ultra before starting the task. Then invoke:

```text
$bottega-dex:run <task, bug, or issue URL>
```

Installed plugin hooks require a one-time trust review. Open `/hooks` when Codex asks, inspect the two shipped hooks, and trust them. Start a new thread after installing or upgrading so Codex loads the current skill and hooks.

The plugin works with generic native subagents. For optional project-scoped custom agents that pin documented models, effort, and sandbox settings, invoke `$bottega-dex:setup` and approve the exact host files it proposes. Plugin installation never writes host custom-agent configuration by itself.

## The flow

`$bottega-dex:run` turns the current Codex thread into an orchestrator that:

1. Isolates the run in its own worktree and discovers the host's test, lint, typecheck, build, and run commands.
2. Reads the codebase, surfaces unstated risks, researches precedent, and interviews the user when intent is unclear.
3. Presents a concise user-facing specification. The user's approval starts the build unless the original request explicitly waived that gate.
4. Plans vertical slices and sends expensive-to-reverse decisions to a blinded cross-family panel.
5. Builds in isolated slices with requested native routes and host gates green after every integration.
6. Reviews the frozen integrated diff once with two cold reviewers in parallel, one Codex and one Claude, using the same report schema.
7. Drives the real product as a user and publishes recordings, screenshots, and verdicts in the pull request.
8. Synchronizes existing documentation and opens the pull request with the specification, decisions, review record, and QA evidence.

The user appears twice: approving the specification and merging the pull request. An explicit autonomous request removes the first gate. The merge remains the only path to trunk.

## Routing

Codex work stays inside the native subagent harness. Each brief requests a route and reasoning effort, and the orchestrator records the model the native thread reports. Claude is invoked only for the deliberate second-family review and panel paths.

| Role | Route |
| --- | --- |
| orchestrator | GPT-5.6 Sol, Ultra, current Codex thread |
| mechanical work | GPT-5.6 Luna, high |
| builder | GPT-5.6 Sol, high |
| integrated review | GPT-5.6 Sol high plus Claude Opus xhigh |
| fix review | fresh GPT-5.6 Sol, high |
| QA | GPT-5.6 Sol, high |

Codex builders, mechanics, reviewers, QA workers, and panelists are native subagents. Every worker receives an explicit plugin-owned role prompt plus its method and task contract. This keeps identity portable while preserving visible threads, progress, follow-ups, cancellation, and results. A project can pin documented routes with `$bottega-dex:setup`. Without it, the brief steers the requested route and the returned model is recorded.

The one external adapter uses `claude -p --safe-mode` with fixed roles, tools, permissions, JSON Schema output, and envelope normalization.

CLIProxyAPI is intentionally not part of the design. It is useful when an application needs a provider-compatible HTTP service or account routing. Bottega Dex already has native Codex agent threads and needs Claude's complete coding-agent loop only for a few independent calls, so a proxy would add a service, authentication state, and protocol translation without adding capability.

## Design decisions

**Codex is the orchestrator.** The interactive thread stays on GPT-5.6 Sol at Ultra because it owns specification, architecture, routing, arbitration, and delivery. The plugin does not start a hidden orchestrator process because that would break the conversational approval gate and split run state.

**Native Codex orchestration.** Codex work uses Codex subagent threads directly. The plugin does not start a second Codex process, duplicate authentication, or hide workers behind terminal subprocesses.

**Claude is a deliberate boundary.** `claude-exec` exists only for the independent Claude reviewer and panel roles. It normalizes Claude's structured output without becoming a general orchestration layer.

**Cross-family review is never dropped.** Round 1 always sends the same frozen integrated diff to one Codex reviewer and one Claude reviewer. Neither sees the other's output. Every report echoes the base, head, and tree SHAs and matches one JSON Schema. Fixes receive a fresh delta review.

**The harness remains the orchestration layer.** The plugin provides skills, one external adapter, and two hooks. It has no queue, daemon, scheduler, or state machine. Work is visible as Codex agent threads, tool calls, worktrees, commits, reports, and the pull request.

**QA is evidence, not implementation.** QA drives the reviewed head and never fixes it. A failure returns to the builder and review loop, then QA drives the new head again. Evidence is published with commit-pinned links from a never-merged branch and removed after merge.

## Repository layout

```text
.agents/plugins/marketplace.json       public Codex marketplace
plugins/bottega-dex/.codex-plugin/     plugin manifest
plugins/bottega-dex/skills/            run, builder, review, panel, design
plugins/bottega-dex/skills/*/references/agents/  portable worker role prompts
plugins/bottega-dex/assets/custom-agents/         optional project TOML templates
plugins/bottega-dex/scripts/           external Claude adapter and shared safety helpers
plugins/bottega-dex/hooks/             model and entry guards
tests/                                 package and behavior contracts
```

## Develop

```bash
npm ci
npm test
npm run typecheck
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/bottega-dex
```

## Sources

- [OpenAI Codex plugin structure](https://learn.chatgpt.com/docs/build-plugins#plugin-structure)
- [OpenAI Codex subagents and model configuration](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Anthropic Claude Code CLI reference](https://code.claude.com/docs/en/cli-usage)

## Credits

The process and its history come from [bottega](https://github.com/vadimcomanescu/bottega). The discovery method follows Thariq Shihipar's unknowns framework. The design vocabulary follows John Ousterhout's deep modules. The build and review split follows Addy Osmani's long-running-agent notes. The blinded panel follows OpenRouter Fusion's independent-draft pattern, while final synthesis stays with the orchestrator.

## License

MIT
