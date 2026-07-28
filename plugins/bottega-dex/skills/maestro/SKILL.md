---
name: maestro
description: Take a task, bug, or issue through Bottega Dex to a reviewed, evidence-backed pull request ready to merge. Use only when the user explicitly invokes Bottega Dex or maestro for end-to-end delivery.
---

# Maestro

Take the request to a green pull request. Ask first whether to hold the pull request or let it merge when green. Keep approvals and consequential product decisions with the user.

Use [start](../start/SKILL.md) to take on the work, create its isolated branch and worktree, record the merge choice, and load the repository's own instructions and gates.

Run discovery with the user through [discover](../discover/SKILL.md). Use narrow, read-only scouts in parallel with `reasoning_effort: "low"` and `fork_turns: "none"`. Give each scout a distinct question and tell it not to delegate. Settle material unknowns with the user and use prototypes where direct evidence is cheaper than discussion.

Own the design and important decisions. Follow [architect](../architect/SKILL.md). Use [panel](../panel/SKILL.md) only for a decision that is still open, costly to reverse after merge, and not settled by a cheap check. Make acceptance criteria and the definition of done measurable. Turn enforceable criteria into tests and record durable, non-obvious trade-offs in the repository's decision format.

When the direction, architecture, acceptance criteria, and independent vertical slices are clear, get one read-only second opinion through [use-claude](../use-claude/SKILL.md), using Claude Fable 5 at high effort. Give it the discovery findings, architecture, and proposed execution, and ask:

> Would a strong maintainer, after seeing both the current plan and your proposed change, clearly agree that your revision is necessary to satisfy the user or materially better for durable engineering reasons? If yes, revise. If no, the plan is ready.

Apply the revisions you agree with. You still own the design.

Then use [orchestrate](../orchestrate/SKILL.md) to decompose, implement, integrate, and prove the work. Its method is authoritative. Remain available to the user while delegating substantive work. Use `reasoning_effort: "medium"` for routine implementation and `"high"` for difficult work. Give agents distinct ownership, prevent overlapping assignments, and tell leaf workers not to delegate. Each implementation brief follows [implement](../implement/SKILL.md) and includes the repository's quality gates. Use fresh high-reasoning agents to review completed slices before integration. Integrate the results yourself.

Run [code-review](../code-review/SKILL.md) on the completed integrated code diff. The bundled autoreview process owns its Claude invocation. Verify every finding, fix accepted implementation issues with appropriately scoped native subagents, rerun affected proof, and follow code-review's pinned cross-family rerun rule until clean. Do not run autoreview on `SKILL.md` files or other workflow prose. For skill-only changes, use deterministic plugin validation and forward-test Codex compatibility instead.

After review is clean, use [qa](../qa/SKILL.md) on every user-visible surface touched by the work. QA drives the reviewed artifact and does not edit product code. Fix confirmed issues with appropriately scoped native subagents, then rerun the affected gates, review, and QA scenarios on the new head. Track unfinished work with Codex's native task state until the required evidence is green.

Use [close](../close/SKILL.md) to publish the evidence, open the pull request, apply the user's hold-or-merge choice, and watch the real checks to their terminal state.

If a worker fails, diagnose the failure before retrying it once. If the user says stop, stop active workers cleanly, preserve completed work, and stop.
