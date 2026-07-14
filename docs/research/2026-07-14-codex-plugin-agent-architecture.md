# Codex plugin agent architecture

Date: 2026-07-14

## Decision

Bottega Dex should use this architecture:

1. Keep the active Codex thread as the orchestrator.
2. Keep the workflow and routing policy in the plugin's `run` skill.
3. Preserve each worker identity as a thin Markdown role prompt owned by the plugin.
4. Pass the selected role prompt, method skill, task contract, and absolute paths to a generic native Codex subagent.
5. Keep Claude as an external, cold-session adapter only where a second model family is intentional.
6. Offer project custom-agent TOML as an explicit optional setup layer only when exact model, effort, or sandbox enforcement is required.

Do not launch `codex exec` from Codex. Do not use CLIProxyAPI for native Codex delegation.

## Verified platform boundary

The official plugin format supports a manifest, skills, hooks, apps or connectors, MCP servers, and presentation assets. It does not define a custom-agent component or an `agents` manifest field:

- [Build plugins: plugin structure](https://learn.chatgpt.com/docs/build-plugins#plugin-structure)
- [Codex plugin manifest source](https://github.com/openai/codex/blob/5bed6447998c754d154dbd796517310b8f04d4ce/codex-rs/plugin/src/manifest.rs#L17-L24)
- [Codex plugin manager source](https://github.com/openai/codex/blob/5bed6447998c754d154dbd796517310b8f04d4ce/codex-rs/core-plugins/src/manager.rs#L1883-L1953)

Official custom agents are standalone TOML configuration under `~/.codex/agents/` or project `.codex/agents/`. Agent files can set `model`, `model_reasoning_effort`, sandbox, MCP, and skill configuration:

- [Subagents: custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents#custom-agents)
- [Codex agent-role loading source](https://github.com/openai/codex/blob/5bed6447998c754d154dbd796517310b8f04d4ce/codex-rs/core/src/config/agent_roles.rs#L19-L97)

Codex itself owns spawning, follow-up routing, waiting, and closing native agent threads. `agents.max_depth` defaults to `1`, which permits direct children and prevents grandchildren:

- [Subagents: orchestration and thread controls](https://learn.chatgpt.com/docs/agent-configuration/subagents#orchestration-and-thread-controls)
- [Subagents: global settings](https://learn.chatgpt.com/docs/agent-configuration/subagents#global-settings)

## Public plugin evidence

An inventory of OpenAI's public plugin repository at commit [`11c74d6`](https://github.com/openai/plugins/tree/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9) found 182 plugin manifests and no `.codex/agents/*.toml` files under `plugins/`. Some plugins contain Markdown files under `agents/`, but these are role prompt assets, not registered Codex custom agents.

The closest precedents for Bottega Dex are conductor skills with worker prompt assets:

- [Wix conductor skill](https://github.com/openai/plugins/blob/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/wix/skills/wix-headless/SKILL.md#L52-L98)
- [Wix build dispatch](https://github.com/openai/plugins/blob/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/wix/skills/wix-headless/references/BUILD.md#L20-L30)
- [Superpowers subagent-driven development skill](https://github.com/openai/plugins/blob/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/superpowers/skills/subagent-driven-development/SKILL.md#L6-L102)
- [Superpowers implementer prompt](https://github.com/openai/plugins/blob/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/superpowers/skills/subagent-driven-development/implementer-prompt.md)

OpenAI's public repository also contains plugin-level Markdown identities such as these:

- [Figma implementation agent](https://github.com/openai/plugins/blob/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/figma/agents/figma-implementation-agent.md)
- [Vercel AI architect](https://github.com/openai/plugins/blob/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/vercel/agents/ai-architect.md)
- [Zoom integration reviewer](https://github.com/openai/plugins/blob/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/zoom/agents/zoom-integration-reviewer.md)

These files establish Markdown identities as a real distribution pattern. They do not establish automatic registration, exact model pinning, or sandbox enforcement.

## Recommended layout

```text
plugins/bottega-dex/
├── .codex-plugin/plugin.json
├── skills/
│   ├── run/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── dispatch.md
│   │       └── agents/
│   │           ├── mechanic.md
│   │           ├── builder.md
│   │           ├── reviewer.md
│   │           └── qa.md
│   ├── implementing/
│   ├── reviewing/
│   ├── panel/
│   │   └── references/agents/
│   │       ├── panelist.md
│   │       └── panel-judge.md
│   └── setup/                  # optional strict-routing setup
├── assets/
│   └── custom-agents/          # TOML templates, not auto-registered
└── scripts/
    └── claude-exec             # intentional cross-family boundary
```

Role prompts should define identity, scope, stop conditions, and return contract. The full method remains in the relevant skill. Role prompts live with the skill that dispatches them. The orchestrator should pass absolute role and method paths so each worker loads its own instructions after spawning.

The optional setup skill should be opt-in, namespaced, idempotent, and non-destructive. It should show every host file it intends to write, refuse silent overwrites, preserve existing `.codex/config.toml`, keep `agents.max_depth = 1`, and validate model identifiers against the active client.

## Model naming

The current official documentation names `gpt-5.6` for demanding work and `gpt-5.6-terra` for faster supporting work. It does not document `gpt-5.6-sol` or `gpt-5.6-luna` as TOML model identifiers. Sol and Luna may be host routing tiers, but Bottega Dex should not write them as model IDs without validating the active client's model list.

## Rejected alternatives

- Nested `codex exec` duplicates the active harness and loses native thread controls.
- CLIProxyAPI adds an unrelated proxy and credential boundary without improving native delegation.
- Plugin-local agent TOML is not a documented plugin component and is not loaded as host custom-agent configuration.
- Silent TOML installation mutates host configuration without an official plugin installation contract or explicit user consent.
