---
name: maestro
description: Take one substantial task, bug, or issue through Bottega's run boundaries to a reviewed, QA-backed pull request using native Codex orchestration. Use only when the user explicitly asks Bottega Dex or maestro to deliver the work end to end.
---

# Maestro

Take one piece of work from request to a pull request ready to merge. Keep scope, decisions, review arbitration, and acceptance in the active Codex task. Native subagents do the delegated work, and every tracked change receives the same final review and QA regardless of who wrote it.

Write to the user in plain language. State what happened and what remains. Use the repository's own domain terms and invent none.

Run these phases in order. Do not insert a separate specification or planning phase. Discovery settles the direction; `orchestrate` owns decomposition, implementation, integration, and proof.

## 1. Open

Use [open](../open/SKILL.md) whole. Settle release intent, claim the work, enter the isolated run worktree, read the repository's commands, and confirm the required review and delivery routes before discovery or implementation.

## 2. Discover

Use [discover](../discover/SKILL.md) whole. Settle the unknowns that repository evidence, product precedent, current provider guidance, or the user can answer. Hand its direction, boundaries, and decisions directly to orchestration. Create no spec or plan document.

## 3. Orchestrate

Remain available to the user while delegating substantive work. Run narrow, read-only scouts in parallel with `reasoning_effort: "low"` and `fork_turns: "none"`. Use `reasoning_effort: "medium"` for routine implementation and `"high"` for difficult work. Give each agent distinct ownership, prevent overlapping assignments, and instruct leaf workers not to delegate. Integrate the results and keep approvals with the user.

If implementation exposes a material unknown, return only that unknown to discovery, settle it, then resume orchestration. Do not introduce a spec or plan phase as an intermediate answer.

## 4. Review

Use [code-review](../code-review/SKILL.md) on the complete integrated diff. The active task verifies and arbitrates every finding. Any accepted blocker returns to `orchestrate` as a bounded repair task, then focused proof, the decisive gate, and a fresh blind dual review run again.

## 5. QA

Use [qa](../qa/SKILL.md) on the accepted review head. Drive every changed product scenario through its real user or integration surface and collect the verdicts in one report. An implementation defect returns to `orchestrate`; after repair, rerun the decisive gate, dual review, and the affected QA scenarios at the new head.

## 6. Open the pull request

For every requirement in the original request and every boundary discovery settled, point to current evidence: code, command output, review evidence, or a QA verdict. Unproven means unfinished. Then use [close](../close/SKILL.md) to publish evidence, file follow-ups, open the pull request, and report its real checks and merge state.

The run's durable state is its worktree, branch, `.bottega/run/<slug>/` records, commits, and pull request. A later task resumes by entering that branch through `open`, reading those records, and continuing at the first incomplete phase. If the user says stop, stop active workers cleanly, preserve completed work, and stop.
