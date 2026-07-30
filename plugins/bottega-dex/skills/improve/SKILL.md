---
name: improve
description: Scan a codebase for deepening opportunities, present the strongest candidates, agree on one with the user, then take it through Bottega Dex delivery with the scan standing as discovery. Use only when the user explicitly invokes $bottega-dex:improve to decide what to improve next. Never invoke it proactively because the selected candidate can start hours of autonomous work and open a pull request.
---

# Improve

Find the refactors that turn shallow modules into deep ones, so the codebase gets easier to test and navigate. Agree on the strongest candidate with the user, then hand it to a run.

## 1. Read

Start with the canonical agent map when one exists, then the domain owner it routes you to. When either route is absent, locate the smallest existing map and domain material by what they govern. Treat genuinely absent domain material as absent, not as a setup requirement. Read only what the scan needs: the vocabulary you find, the relevant contexts and decisions covering the code you will touch, and the document the repository names as its documentation authority. A missing context map, glossary, or ADR is not a gap. Surface a relevant ADR conflict before proposing a change.

## 2. Scope

Follow the direction the user named. It takes priority over anything you would choose yourself. Without a direction, inspect the commit history for hot spots, meaning the files and modules that change often, and bias the scan there. Scan wider when churn is spread across the whole history because deepening pays off where the next change is likely to land.

## 3. Scan

Read the scoped code and note where you hit friction, using the vocabulary from [architect](../architect/SKILL.md):

- understanding one concept requires moving between many small modules
- a module's interface is nearly as complex as its implementation; apply the deletion test and ask whether deleting it would concentrate the complexity or only move it
- pure functions were extracted for testability while the real bugs remain in how callers use them
- tightly coupled modules leak across their boundaries
- code is untested or hard to test through its current interface
- a custom mechanism replaces a standard solution; read that technology's official documentation, its available runtime skill, and established industry patterns before proposing adoption, and expect the improvement to be deletion plus adoption
- a migration is half-finished, so two live patterns answer one concept and every change must first choose between them
- a test loop is slow enough that every change pays for it in minutes
- rules are split from the state they protect, ownership leaks across an interface, or documentation and architecture disagree

Let the ADRs constrain the scan. Surface a conflict with an ADR only when the friction justifies reopening it, and name that ADR.

## 4. Check collisions

Check open issues and pull requests before proposing. An improvement already tracked or already in progress is not a finding.

## 5. Propose

Present the strongest candidates in the conversation. Make each candidate one coherent unit under [architect](../architect/SKILL.md). Name the files, the evidence of friction, the change in product terms, the gain in leverage and locality, and a strength: strong, worth exploring, or speculative. Leave interface design to the run. Lead with the candidate you would take first and explain why. No HTML. No file report. The user picks one or rejects them.

When the user rejects a candidate for a reason a future scan would need, offer to record the decision as an ADR so the candidate is not proposed again. Write that ADR directly because a rejected candidate never reaches a run. Skip temporary reasons.

## 6. Run it

After the user picks a candidate, sharpen it with them until its acceptance criteria are measurable. Then use [maestro](../maestro/SKILL.md), handing over the friction evidence, agreed change, and criteria. Maestro still performs release and ownership setup. The accepted scan stands as completed discovery, so Maestro confirms the handoff and continues at architecture without repeating the scan.
