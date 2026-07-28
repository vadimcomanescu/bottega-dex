---
name: maestro
description: Take a task, bug, or issue through Bottega Dex to a reviewed, evidence-backed pull request ready to merge. Use only when the user explicitly invokes Bottega Dex or maestro for end-to-end delivery.
---

# Maestro

Take the request to a green pull request. Ask first whether to hold it or let it merge when green. Keep approvals and consequential product decisions with the user.

Use [start](../start/SKILL.md) to take on the work.

Run [discover](../discover/SKILL.md) with the user.

Use [architect](../architect/SKILL.md) to settle the design and independent slices. Use [panel](../panel/SKILL.md) only when its three conditions hold.

When the direction, architecture, acceptance criteria, and independent vertical slices are clear, get one read-only second opinion through [use-claude](../use-claude/SKILL.md), using Claude Fable 5 at high effort. Give it the discovery findings, architecture, and proposed execution, and ask:

> Would a strong maintainer, after seeing both the current plan and your proposed change, clearly agree that your revision is necessary to satisfy the user or materially better for durable engineering reasons? If yes, revise. If no, the plan is ready.

Apply the revisions you agree with. You still own the design.

Then use [orchestrate](../orchestrate/SKILL.md). Give each builder [implement](../implement/SKILL.md) and the repository's quality gates. Give every completed slice a fresh high-reasoning review before integration.

Run [code-review](../code-review/SKILL.md) on the integrated diff.

After review is clean, use [qa](../qa/SKILL.md). Fix confirmed issues with appropriately scoped native subagents, then rerun review and the affected QA scenarios on the new head.

Use [close](../close/SKILL.md).

If a worker fails, diagnose the failure before retrying it once. If the user says stop, stop active workers cleanly, preserve completed work, and stop.
