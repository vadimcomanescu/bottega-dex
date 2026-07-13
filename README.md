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

Start the orchestrator on GPT-5.6 Sol with Ultra reasoning:

```bash
codex -m gpt-5.6-sol -c 'model_reasoning_effort="ultra"'
```

In the Codex app, select GPT-5.6 Sol and Ultra before starting the task. Then invoke:

```text
$bottega-dex:run <task, bug, or issue URL>
```

Installed plugin hooks require a one-time trust review. Open `/hooks` when Codex asks, inspect the two shipped hooks, and trust them. Start a new thread after installing or upgrading so Codex loads the current skill and hooks.

## The flow

`$bottega-dex:run` turns the current Codex thread into an orchestrator that:

1. Isolates the run in its own worktree and discovers the host's test, lint, typecheck, build, and run commands.
2. Reads the codebase, surfaces unstated risks, researches precedent, and interviews the user when intent is unclear.
3. Presents a concise user-facing specification. The user's approval starts the build unless the original request explicitly waived that gate.
4. Plans vertical slices and sends expensive-to-reverse decisions to a blinded cross-family panel.
5. Builds in isolated slices with fixed routes and host gates green after every integration.
6. Reviews the frozen integrated diff once with two cold reviewers in parallel, one Codex and one Claude, using the same schema-enforced report contract.
7. Drives the real product as a user and publishes recordings, screenshots, and verdicts in the pull request.
8. Synchronizes existing documentation and opens the pull request with the specification, decisions, review record, and QA evidence.

The user appears twice: approving the specification and merging the pull request. An explicit autonomous request removes the first gate. The merge remains the only path to trunk.

## Routing

Callers choose a role, not a model. `worker-exec` owns provider, model, effort, permissions, and tool policy.

| Role | Route |
| --- | --- |
| orchestrator | GPT-5.6 Sol, Ultra, current Codex thread |
| mechanical work | GPT-5.6 Luna, high |
| builder | GPT-5.6 Sol, high |
| user-facing builder | Claude Opus, xhigh |
| integrated review | GPT-5.6 Sol high plus Claude Opus xhigh |
| fix review | fresh GPT-5.6 Sol, high |
| QA and large docs sweep | Claude Opus, high |

The adapters use the official non-interactive clients:

- `codex exec` with fixed config, event capture, structured output, and explicit resume handling.
- `claude -p --safe-mode` with fixed tools and permissions, JSON Schema output, and envelope normalization.

CLIProxyAPI is intentionally not part of the design. It is useful when an application needs a provider-compatible HTTP service or account routing. Bottega Dex needs complete coding-agent tool loops from the two installed CLIs, so a proxy would add a service, authentication state, and protocol translation without adding capability.

## Design decisions

**Codex is the orchestrator.** The interactive thread stays on GPT-5.6 Sol at Ultra because it owns specification, architecture, routing, arbitration, and delivery. The plugin does not start a hidden orchestrator process because that would break the conversational approval gate and split run state.

**Two provider adapters, one worker interface.** Codex and Claude have different structured-output and resume behavior. `worker-exec` gives the run one role-based interface while `codex-exec` and `claude-exec` hide those provider differences.

**Cross-family review is never dropped.** Round 1 always sends the same frozen integrated diff to one Codex reviewer and one Claude reviewer. Neither sees the other's output. Every report echoes the base, head, and tree SHAs and matches one JSON Schema. Fixes receive a fresh delta review.

**The harness remains the orchestration layer.** The plugin provides skills, fixed adapters, and two hooks. It has no queue, daemon, scheduler, or state machine. Work is visible as Codex tool calls, worktrees, commits, reports, and the pull request.

**QA is evidence, not implementation.** QA drives the reviewed head and never fixes it. A failure returns to the builder and review loop, then QA drives the new head again. Evidence is published with commit-pinned links from a never-merged branch and removed after merge.

## Repository layout

```text
.agents/plugins/marketplace.json       public Codex marketplace
plugins/bottega-dex/.codex-plugin/     plugin manifest
plugins/bottega-dex/skills/            run, builder, review, panel, design
plugins/bottega-dex/scripts/           role router and provider adapters
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

- [OpenAI Codex plugin structure](https://developers.openai.com/codex/plugins/build)
- [OpenAI Codex subagents and model configuration](https://developers.openai.com/codex/subagents)
- [Anthropic Claude Code CLI reference](https://code.claude.com/docs/en/cli-usage)

## Credits

The process and its history come from [bottega](https://github.com/vadimcomanescu/bottega). The discovery method follows Thariq Shihipar's unknowns framework. The design vocabulary follows John Ousterhout's deep modules. The build and review split follows Addy Osmani's long-running-agent notes. The blinded panel follows OpenRouter Fusion's independent-draft pattern, while final synthesis stays with the orchestrator.

## License

MIT
