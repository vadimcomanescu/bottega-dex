---
name: qa
description: Drive the reviewed work through every changed user or integration scenario and return an evidence-backed verdict. Used by maestro after code review and before close.
---

# QA

Verify the reviewed work as a user or integrator would. Product code stays untouched. Confirm the checkout is at the reviewed head before driving it.

Drive every changed scenario through the real interface: browser for web, computer use for a desktop app, a real process for a CLI, or the public integration boundary for an API. Fixtures may set up the drive, but verdicts come from observed behavior, not code inspection.

Return `PASS` with evidence, `FAIL` with the expected and observed difference, or `NOT VERIFIED` with the exact blocker. Capture evidence that matches the claim and report runtime errors even when the visible action succeeds. Do not touch real users, money, deploys, or shared or production data without user approval.

Report all scenario verdicts together. After a repair, drive the failed scenarios and anything the repair touched. Fix product defects with one or more subagents depending on their size, respecting the repository's implementation methodologies, then run code review and QA again.
