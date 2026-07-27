---
name: maestro
description: Take one substantial task, bug, or issue through Bottega's run boundaries to a reviewed, QA-backed pull request using native Codex orchestration. Use only when the user explicitly asks Bottega Dex or maestro to deliver the work end to end.
---

# Maestro

Take one piece of work from request to a pull request ready to merge.

## 1. Start

Use [start](../start/SKILL.md) to take on the work.

## 2. Discover

Use [discover](../discover/SKILL.md) to understand the work.

## 3. Orchestrate

Remain available to the user while delegating substantive work. Run narrow, read-only scouts in parallel with `reasoning_effort: "low"` and `fork_turns: "none"`. Use `reasoning_effort: "medium"` for routine implementation and `"high"` for difficult work. Give each agent distinct ownership, prevent overlapping assignments, and instruct leaf workers not to delegate. Integrate the results and keep approvals with the user.

## 4. Review

Use [code-review](../code-review/SKILL.md) on the completed work. Fix accepted issues with one or more subagents depending on the size, respecting the repository's implementation methodologies. Review the updated work again.

## 5. QA

Use [qa](../qa/SKILL.md) on the reviewed work. Fix any issues with one or more subagents depending on the size, respecting the repository's implementation methodologies. Review and QA the updated work again.

## 6. Close

Use [close](../close/SKILL.md) to close the work.
