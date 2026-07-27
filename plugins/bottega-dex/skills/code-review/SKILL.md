---
name: code-review
description: Review the complete integrated work produced by an orchestrator's subagents with blind GPT-5.6 Sol and Claude Opus 5 reviewers. Use after implementation and the decisive test gate pass, before close, and rerun after any tracked change.
---

# Code review

Review the integrated diff, never individual implementation slices as a substitute. The orchestrator owns the verdict and verifies every finding. Reviewers report only; they never fix.

Resolve this skill's directory and the plugin root once. Use [references/reviewer.md](references/reviewer.md) as the common reviewer method and [references/report.schema.json](references/report.schema.json) as the common report contract.

## 1. Freeze the target

Start only after all subagent work is integrated, the tracked worktree is clean, and the repository's decisive gate passes. Resolve and record the exact base SHA, head SHA, and head tree SHA. Create separate disposable detached worktrees for the two reviewers at that head and confirm both resolve to the recorded head and tree.

Write the review round under `.bottega/run/<slug>/review/<round>/`. The common brief contains the original request, discovery's settled direction and boundaries, acceptance signals, repository instructions, reviewer method, schema, and frozen SHAs. It contains no builder reasoning, orchestrator conclusion, candidate finding, prior review report, or preferred outcome.

## 2. Start both reviewers blind

Start both reviewers in parallel against their separate frozen worktrees:

- Codex: one fresh native subagent with `model: "gpt-5.6-sol"`, `reasoning_effort: "high"`, and `fork_turns: "none"`. Tell it to remain read-only, not delegate, follow the common reviewer method, and return only the schema object. Never start a nested Codex process.
- Claude: invoke `<plugin-root>/scripts/claude-exec --role reviewer --cwd <claude-worktree> --brief <brief.md> --out <claude-report.json> --events <claude-events.json> --head <head-sha> --tree <tree-sha> --schema <report.schema.json>`. The adapter pins `claude-opus-5` at high effort and records the Claude result envelope.

Neither reviewer sees the other report. Keep the active task available to the user while both run.

## 3. Validate and arbitrate

Accept a report only when it matches the schema and its reviewer family, model, round, base SHA, head SHA, and tree SHA match the dispatch. The Codex dispatch metadata must prove GPT-5.6 Sol. The Claude envelope's model usage must prove `claude-opus-5`. Evidence paths must exist; blocked checks remain blocked, never passed.

Reproduce every finding against the frozen target. Accept or reject it from evidence, not reviewer agreement. A confirmed correctness, security, data-safety, or contract failure blocks acceptance. A real lower-severity issue outside the task becomes a follow-up.

## 4. Fix and rerun

Fix accepted blocking findings with one or more subagents depending on the size, respecting the repository's implementation methodologies. A tracked change invalidates both reports. Review the updated work again with a fresh blind Sol-and-Opus pair. No rerun sees earlier reports or findings.

Two failed fixes for the same finding or a third unsuccessful review round stops for redesign and reports the evidence to the user.

## 5. Record acceptance

When both reports contain no accepted blocking finding, write `.bottega/run/<slug>/review/accepted.json` with the base, head, tree, round, reviewer models, report paths, evidence paths, accepted findings, rejected findings with reasons, and follow-ups. Remove the disposable review worktrees. `qa` must drive this exact accepted head, and `close` must publish only the head accepted by both records.
