---
name: use-claude
description: Run one read-only design or cross-review task through Claude Fable 5 and return its report. Use when a panel or orchestration needs an independent Claude view.
---

# Use Claude

Run the supplied brief through the local Claude CLI. This is a read-only consultation boundary, not an implementation worker and not the `claude-exec` adapter.

## Launch

Create a private session directory with `mktemp -d`, write the self-contained brief to an absolute `<brief-file>`, then run this from the active Codex turn as one tracked terminal command:

```bash
claude -p --safe-mode --model claude-fable-5 --effort high \
  --permission-mode dontAsk --tools Read,WebSearch \
  --allowedTools "Read(//<absolute-worktree-without-leading-slash>/**),WebSearch" \
  --setting-sources user --strict-mcp-config --disallowedTools "mcp__*" \
  --settings '<read-only sandbox JSON>' \
  --no-session-persistence --output-format json \
  < <brief-file> > <out-file> 2> <log-file>
```

- `<read-only sandbox JSON>` denies `Agent`, `Bash`, `Edit`, `NotebookEdit`, `Skill`, `WebFetch`, and `Write`; it enables the sandbox, permits reads only under the absolute worktree, denies all writes and shell network access, and leaves `WebSearch` as the only network-backed tool. Resolve the loaded plugin root from this `SKILL.md` path and reuse the filesystem sandbox structure from `<loaded-plugin-root>/scripts/claude-exec`. Keep autoreview's `--safe-mode`, user setting source, and strict MCP isolation conventions.
- Resolve the worktree path before launch. Do not run against the primary checkout when the task needs an isolated worktree. Quote the `Read` rule exactly and do not widen it beyond that worktree.
- Keep the task self-contained: goal, evidence paths, constraints, required answer format, and the explicit instruction not to modify files or run commands. The model has no conversation history.
- `claude -p` reads the brief from standard input. Never embed the brief in shell quoting. The JSON result is the report; inspect the log only for a failed invocation.

## Keep it visible

Keep the tracked command attached to the active Codex turn so its process, completion, and failure remain visible. Give it an explicit timeout suited to the task. If it outlives one tool yield, continue the same terminal session; do not background it with `&` or leave an orphaned process.

Use the log file's modification time as the liveness signal, with a window long enough for the requested read. If the process stalls, stop that terminal session and launch a fresh consultation from the same brief. `--no-session-persistence` is deliberate, so there is no resume path.

## Result

Treat a nonzero exit, an empty output file, or a non-success JSON result as a failed dispatch. Report the exit code and the relevant log tail, then redispatch once or continue when the calling workflow permits it. Otherwise read the report, retain the model-free substantive answer, and never apply product changes from it without independent verification.
