---
name: setup
description: Optionally install project-scoped Bottega Dex custom agents for exact documented model, effort, and sandbox routing. Invoke only when the user asks to configure strict Bottega Dex routing.
---

# Setup strict routing

The plugin works without this skill. Use it only when the user wants project-scoped custom agents that enforce documented Codex model, reasoning, and sandbox settings.

1. Resolve this plugin's root and the target project's absolute root. Confirm the target is the intended host repository, not the Bottega Dex source repository unless the user explicitly chose it.
2. Read every template under `<plugin-root>/assets/custom-agents/`. Plan to copy them to `<project-root>/.codex/agents/` with the same filenames. Also read the existing `.codex/config.toml` and target agent files when present.
3. Compare the template model identifiers with the active client's effective model catalog when the host exposes that catalog. Do not launch `codex exec` or another Codex server to discover it. If the host exposes no catalog surface, mark model availability unverified and require the user to approve the documented identifiers before writing them. Then show the exact source and destination paths, every overwrite or conflict, and this recommended configuration:

   ```toml
   [agents]
   max_threads = 4
   max_depth = 1
   ```

4. Ask for explicit confirmation and wait. Plugin installation does not authorize host configuration changes. Never overwrite a non-identical agent file unless the user explicitly approves that named conflict.
5. After approval, use `apply_patch` to create or update only the confirmed files. Preserve every unrelated `.codex/config.toml` setting. Add the two `[agents]` keys only when absent or explicitly approved for replacement.
6. Validate the resulting configuration fields with the installed Codex client in strict-config mode from the target root. State explicitly that strict-config validates configuration shape and does not prove model availability. Restore only files this setup changed when schema validation fails.
7. Tell the user to start a new Codex task so project custom agents are discovered. In that task, confirm each configured agent is available and record the actual model reported on its first use. Treat a model rejection as a setup failure and update only the affected template after the user approves the replacement.

The templates use the model identifiers documented by OpenAI: `gpt-5.6` for demanding roles and `gpt-5.6-terra` for mechanical work. Sol and Luna can be host routing labels, but never write them as model identifiers unless the active client documents and accepts them.
