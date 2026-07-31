---
name: maestro
description: Take a task, bug, or issue through Bottega Dex to a reviewed, evidence-backed pull request ready to merge. Use only when the user explicitly invokes Bottega Dex or maestro for end-to-end delivery.
---

# Maestro

Take the request to a green pull request. Ask first whether to hold it or let it merge when green. Keep approvals and consequential product decisions with the user.

Use [start](../start/SKILL.md) to take on the work. The isolated worktree and branch are always created before edits, and the repository's gates and landing procedure are read from its own authorities.

Run [discover](../discover/SKILL.md) with the user. When [improve](../improve/SKILL.md) hands over an accepted scan, treat that scan as discovery, confirm the agreed candidate and criteria, and continue without repeating the scan. Discovery first explains what the request means in this repository, then sizes the unknowns work to the task.

After discovery, tell the user how much of the remaining process the work needs. Skip a nonmandatory phase only when nothing in it is unclear and a wrong call would be cheap to reverse after merge. If the work grows, go back to and re-enter the skipped phase.

When discovery ends, use [spec](../spec/SKILL.md) only when discovery settled something the original request did not already say. Carry the resulting spec, including its acceptance criteria and named test interfaces, into architecture, every builder brief, QA, and review. When discovery settled nothing beyond the request, carry the request text verbatim as the spec. The spec is a run artifact and review input. It does not open or mutate a tracker issue by itself.

Every run has four invariants: an isolated worktree and branch, green project gates, the whole diff reviewed for bugs and read against the spec, and a pull request. Each other phase states its own condition where it runs:

- Use [architect](../architect/SKILL.md) when the design, acceptance criteria, domain terms, or independent slices need settling. Name the fewest and highest interfaces the work's tests cross. Each builder brief names its test surfaces, and review receives those names. If the work adds a check, gate, or validator, include one threat model sentence naming the input or actor class it covers and what it deliberately excludes.
- Use [panel](../panel/SKILL.md) only when a decision is open, costly to reverse, and cannot be settled by a test, prototype, repository evidence, or a standard solution.
- Use [use-claude](../use-claude/SKILL.md) when a poor design would be costly to reverse after merge. Give Claude Fable 5 at high effort the discovery, spec, architecture, and proposed execution for a read-only second opinion. When reversal is cheap, state that the cross-read is skipped.
- Then use [orchestrate](../orchestrate/SKILL.md) once the direction, spec, architecture, and slices are clear. Give each builder [implement](../implement/SKILL.md) and the repository's quality gates. Native Codex subagents own distinct slices, and the main task integrates their work and retains approvals. With only one builder, skip its slice review only when the integrated structured review will run. When the integrated diff is only `SKILL.md` prose under the code-review `SKILL.md` and prose exception, require one fresh high-reasoning review of the whole docs diff. More than one builder gets a fresh high-reasoning review of every completed slice before integration.
- Run [code-review](../code-review/SKILL.md) on the integrated diff. Rule on every finding against the real code, the review classes, the threat model, and the named test interfaces before dispatching a repair. Record and reject findings classified out of the threat model. A finding whose fix changes the promised contract returns to the user. After two repair cycles that have not converged, pause and reclassify every remaining finding according to code-review's two-cycle rule, then decide whether to continue or bring the classified findings to the user.
- After code review is clean, dispatch one fresh native Codex subagent at high reasoning to read the whole integrated diff against the spec. Give it the spec and the diff. It reports what the spec asked for that is missing, what the diff does that nobody asked for, and what looks implemented but wrong, with every finding quoting the spec line it judges. Keep this report separate from bug review. Accepted fixes go through [implement](../implement/SKILL.md), then rerun code-review and this spec read on the repaired head.
- Run an independent architecture read after the spec read when the design would be costly to reverse. Give a fresh native Codex subagent the architecture and [architect](../architect/SKILL.md), blind to the spec report, and ask it to apply the architect review questions to the integrated diff. Keep the reports separate, rule on each finding, and have the same reader recheck accepted repairs.
- When a user-facing surface or product behavior changed, use [qa](../qa/SKILL.md). Judge every affected scenario against the spec and any approved prototype render. When no user-facing surface or product behavior changed, skip QA and state that it was skipped.
- Use [close](../close/SKILL.md) after the accepted head, its gates, review reads, and any required QA all point to one SHA.

Make repository-answerable and cheaply reversible decisions during the run. State the choice and the reason, then keep moving. The user retains approvals, consequential product choices, rule exceptions, irreversible actions, and review fixes that would change the promised contract. A revision that adds a new requirement returns to the user before any builder starts. When that new requirement adds a check, gate, or validator, ship its threat model sentence before the user reviews it. Keep working on independent work while waiting for a user-owned answer.

If a worker fails, diagnose the failure before retrying it once. If the user says stop, stop active workers cleanly, preserve completed work, and stop.
