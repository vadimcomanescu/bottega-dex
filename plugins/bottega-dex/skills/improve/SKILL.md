---
name: improve
description: Scan a codebase for deepening opportunities, present the strongest candidates, agree on one with the user, then take it through Bottega Dex delivery with the scan standing as discovery. Use only when the user explicitly invokes $bottega-dex:improve to decide what to improve next. Never invoke it proactively because the selected candidate can start hours of autonomous work and open a pull request.
---

# Improve

Find the refactors that turn shallow modules into deep ones, so the codebase gets easier to test and navigate. Present the strongest candidates, let the user choose one, verify that choice against the code, then hand it to a run.

## 1. Read

Start with the canonical agent map when one exists, then the domain owner it routes you to. When either route is absent, locate the smallest existing map and domain material by what they govern. Treat genuinely absent domain material as absent, not as a setup requirement. Read only what the scan needs: the vocabulary you find, the relevant contexts and decisions covering the code you will touch, and the document the repository names as its documentation authority. A missing context map, glossary, or ADR is not a gap. Surface a relevant ADR conflict before proposing a change.

## 2. Scope

Follow the direction the user named. It takes priority over anything you would choose yourself. Without a direction, inspect the commit history for hot spots, meaning the files and modules that change often, and bias the scan there. Scan wider when churn is spread across the whole history because deepening pays off where the next change is likely to land.

## 3. Scan

Read the scoped code and note where you hit friction, using the vocabulary from [codebase-design](../codebase-design/SKILL.md):

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

Present the strongest candidates in the conversation. Make each candidate one coherent unit under [architect](../architect/SKILL.md). Name the files, the evidence of friction, the change in product terms, the gain in leverage and locality, and a strength: strong, worth exploring, or speculative. Leave interface design to the run. Lead with the candidate you would take first and explain why. No HTML. No file report. The user picks one or rejects them; never start a run from the agent's ranking alone.

When the user rejects a candidate for a reason a future scan should remember, offer to record that boundary through [domain-modeling](../domain-modeling/SKILL.md) as an ADR. Write it directly only after the user accepts the record, and skip temporary reasons.

## 6. Verify the choice

After the user chooses a candidate, verify it on the real code before spending a run on it:

- apply the deletion test and name where the complexity would concentrate if the module disappeared;
- name a behavior test that the current interface makes difficult to write and the caller-facing interface that should make it possible; and
- check the candidate against every ADR covering the area, surfacing any collision that would require reopening a decision.

If the candidate fails verification, return the evidence to the user and let them choose another candidate or stop. Record a rejected direction as an ADR only when [domain-modeling](../domain-modeling/SKILL.md) says it qualifies and the user accepts that record.

## 7. Run it

After the chosen candidate passes verification, sharpen it with the user until its acceptance criteria are measurable. Then use [maestro](../maestro/SKILL.md), handing over the original candidate, friction evidence, deletion-test result, testability evidence, ADR check, agreed change, criteria, and which behavioral decisions the scan settled beyond that candidate. Maestro still performs release and ownership setup. The scan stands as completed discovery, so Maestro does not repeat it. When the scan settled additional behavioral decisions, Maestro synthesizes the spec; otherwise it carries the agreed candidate and criteria verbatim as the behavioral baseline. It then continues to the Plan.
