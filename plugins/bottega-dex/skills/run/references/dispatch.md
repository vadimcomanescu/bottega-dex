# Worker dispatch

## Native Codex workers

Start Codex work with the harness's native subagent control. Keep the returned agent handle for follow-up, interruption, and completion. The harness owns thread tracking and waiting. Never replace a native agent with a nested Codex process.

Every native brief states:

- The selected role prompt by absolute path. The worker reads it before its method or task.
- Requested route and effort. Use documented model identifiers when the dispatch primitive requires an identifier. Sol and Luna remain host routing labels when the host exposes them.
- The linked worktree as the working directory.
- The relevant plugin skill and schema as absolute paths.
- The task contract, owned paths, host gates, and expected final report.

Use a matching custom agent when the current environment exposes one: `bottega_dex_mechanic`, `bottega_dex_builder`, `bottega_dex_reviewer`, `bottega_dex_qa`, or `bottega_dex_panelist`. Otherwise spawn a generic native subagent with the same role prompt, steer the route in the brief, and record the model reported by the native agent. If a required Sol reviewer reports a lower route, do not silently accept it. Retry through an available native custom agent or ask the user how to proceed.

The role prompt is the worker identity. The method skill is the reusable process. A custom-agent TOML only pins host configuration and never replaces either one. Plugin installation does not register custom agents. `$bottega-dex:setup` is the explicit opt-in path for project TOML installation.

Use the native follow-up control when a worker asks a question. Native agents return summaries to the orchestrator and never coordinate with one another. Builders work in the run worktree. Reviewers work in disposable linked worktrees at the frozen head.

## External Claude workers

Claude is external only where the process deliberately requires a second model family. Launch it through:

```text
<plugin-root>/scripts/claude-exec \
  --role <reviewer|panelist|judge> \
  --cwd <worktree> \
  --brief <brief.md> \
  --out <final-message.json> \
  --events <provider-events.json> \
  [--schema <schema.json>]
```

Pass every path as an absolute path. `claude-exec` owns model, effort, permissions, tools, structured output, and a fixed wall-clock timeout. It uses `claude -p --safe-mode`, retains the user's Claude authentication, and starts a cold non-persistent session. A timed-out worker exits 124.

Launch Claude as a tracked background shell command when it runs beside a native Codex subagent. Wait through the harness rather than polling. The Claude reviewer runs only in a disposable linked worktree, and the adapter rejects the primary checkout before launch.

Every brief carries:

- The relevant worker skill by absolute path.
- The slice or review contract and exact owned paths.
- Host gate commands.
- The three safety and test lines from the run skill.
- A final JSON contract with status, touched files, tests changed, commands and results, evidence paths, undetermined decisions, and anomalies.

Reviewer briefs use the shipped review schema instead of a prose report contract. Instruct the native reviewer to return only one matching JSON object. Claude receives the same schema through its structured-output flag. Accept a report only when its round, family, model, base SHA, head SHA, and tree SHA match the dispatch.
