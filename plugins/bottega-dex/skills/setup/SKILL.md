---
name: setup
description: Optionally install project-scoped Bottega Dex custom agents for exact documented model, effort, and sandbox routing. Invoke only when the user asks to configure strict Bottega Dex routing.
---

# Setup strict routing

The plugin works without this skill. Use it only when the user wants project-scoped custom agents that enforce documented Codex model, reasoning, and sandbox settings.

1. Resolve this plugin's root and the target project's absolute root. Confirm the target is the intended host repository, not the Bottega Dex source repository unless the user explicitly chose it.
2. Read every template under `<plugin-root>/assets/custom-agents/`. Plan to copy them to `<project-root>/.codex/agents/` with the same filenames. Also read the existing `.codex/config.toml` and target agent files when present.
3. Show the exact source and destination paths, every overwrite or conflict, and this recommended configuration:

   ```toml
   [agents]
   max_threads = 4
   max_depth = 1
   ```

4. Ask for explicit confirmation and wait. Plugin installation does not authorize host configuration changes. Never overwrite a non-identical agent file unless the user explicitly approves that named conflict.
5. After approval, use `apply_patch` to create or update only the confirmed files. Preserve every unrelated `.codex/config.toml` setting. Add the two `[agents]` keys only when absent or explicitly approved for replacement.
6. Validate the resulting configuration with the installed Codex client in strict-config mode from the target root. Report any unsupported model identifier or field and restore only files this setup changed when validation fails.
7. Tell the user to start a new Codex task so project custom agents are discovered.

The templates use the model identifiers documented by OpenAI: `gpt-5.6` for demanding roles and `gpt-5.6-terra` for mechanical work. Sol and Luna can be host routing labels, but never write them as model identifiers unless the active client documents and accepts them.
