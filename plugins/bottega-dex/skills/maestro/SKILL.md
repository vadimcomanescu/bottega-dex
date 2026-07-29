---
name: maestro
description: Take a task, bug, or issue through Bottega Dex to a reviewed, evidence-backed pull request ready to merge. Use only when the user explicitly invokes Bottega Dex or maestro for end-to-end delivery.
---

# Maestro

Take the request to a green pull request. Ask first whether to hold it or let it merge when green. Keep approvals and consequential product decisions with the user.

Use [start](../start/SKILL.md) to take on the work.

Run [discover](../discover/SKILL.md) with the user. When [improve](../improve/SKILL.md) hands over an accepted scan, treat that scan as discovery, confirm the agreed candidate and criteria, and continue without repeating the scan.

When discovery is done, tell the user how much of the remaining process the work needs, then run only that. Skip a later step only when nothing in it is still unclear and a wrong call would be cheap to reverse after merge. Never skip the isolated worktree and branch, green project gates, review of the whole diff, or the pull request. If the work grows, go back and run any skipped steps it now needs.

Use [architect](../architect/SKILL.md) when the design, acceptance criteria, or independent slices need to be settled. Use [panel](../panel/SKILL.md) only when its three conditions hold. When the work adds a check, gate, or validator, ship one threat model sentence with it. The threat model names the input or actor class it covers and what it deliberately excludes.

Make repository-answerable and cheaply reversible decisions during the run. State the choice and the reason, then keep moving. The user retains approvals, consequential product choices, rule exceptions, irreversible actions, and review fixes that would change the promised contract. Keep working on independent work while waiting for a user-owned answer.

When the direction, architecture, acceptance criteria, and independent vertical slices are clear, decide what a bad design would cost to reverse after merge. When it would be costly to reverse, get one read-only second opinion through [use-claude](../use-claude/SKILL.md), using Claude Fable 5 at high effort. Give it the discovery findings, architecture, and proposed execution, and ask:

> Would a strong maintainer, after seeing both the current plan and your proposed change, clearly agree that your revision is necessary to satisfy the user or materially better for durable engineering reasons? If yes, revise. If no, the plan is ready.

Apply the revisions you agree with. You still own the design. A revision that adds a new requirement goes to the user before any builder starts. When the new requirement adds a check, gate, or validator, it also gets the shipped threat model sentence before the user reviews it. When reversal would be cheap, state that the cross-read is being skipped and continue.

Then use [orchestrate](../orchestrate/SKILL.md). Give each builder [implement](../implement/SKILL.md) and the repository's quality gates. When there is only one builder, skip the per-builder review only when the integrated structured review will run. When the integrated diff falls under the `SKILL.md` and prose exception in code-review, require one fresh high-reasoning review of the whole docs diff instead. When there is more than one builder, give every completed slice a fresh high-reasoning review before integration.

Run [code-review](../code-review/SKILL.md) on the integrated diff. Rule on every finding against the real code, the review classes, and the shipped threat model before dispatching a repair. Record and reject findings classified as out of threat model. Bring a fix that would change the promised contract to the user. After two repair cycles that have not converged, pause dispatch, reclassify every remaining finding, and follow code-review's authoritative two-cycle rule to decide whether to continue or bring the remaining classified findings to the user.

After review is clean, when a user-facing surface or product behavior changed, use [qa](../qa/SKILL.md). Fix confirmed issues with appropriately scoped native subagents, then rerun review and the affected QA scenarios on the new head. When no user-facing surface or product behavior changed, skip QA.

Use [close](../close/SKILL.md).

If a worker fails, diagnose the failure before retrying it once. If the user says stop, stop active workers cleanly, preserve completed work, and stop.
