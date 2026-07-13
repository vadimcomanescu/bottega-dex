# Worker dispatch

Every worker starts through the plugin's provider-neutral adapter:

```text
<plugin-root>/scripts/worker-exec \
  --role <route> \
  --cwd <worktree> \
  --brief <brief.md> \
  --out <final-message.json> \
  --events <provider-events.json> \
  [--schema <schema.json>] \
  [--resume <provider-session-id>]
```

Pass every path as an absolute path. The adapter owns provider selection, model, effort, permissions, tool policy, structured-output flags, and resume rules. Callers never provide those values. A new need changes the route table and its tests, not one invocation.

`codex-exec` ignores user configuration but keeps authentication. On resume, it restores sandbox policy through config and uses the worker process directory because `codex exec resume` does not accept the fresh-run sandbox and directory flags.

`claude-exec` uses `claude -p --safe-mode`, not `--bare`. Safe mode prevents host Claude customizations from changing a worker while retaining the user's Claude authentication. Structured output is extracted from Claude's JSON result envelope so both providers leave the final answer at the same `--out` interface.

Builders and reviewers run only in isolated or disposable worktrees. High-permission routes are allowed there because host suites, local servers, shared git metadata, and integration tests need it. Never point a high-permission worker at the user's primary checkout.

Every brief carries:

- The relevant worker skill by absolute path.
- The slice or review contract and exact owned paths.
- Host gate commands with timeouts.
- The three safety and test lines from the run skill.
- A final JSON contract with status, touched files, tests changed, commands and results, evidence paths, undetermined decisions, and anomalies.

Reviewer briefs use the shipped review schema instead of a prose report contract. Accept a report only when its round, family, model, base SHA, head SHA, and tree SHA match the dispatch.
