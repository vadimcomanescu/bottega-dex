---
name: discover
description: Understand what a request means in the repository, then find its unknowns and settle its direction and boundaries before anything is built. Use when discovery is invoked directly or by maestro.
---

# Discover

Understand what I am asking for, find what I could not tell you, and settle it with me before anything is built.

## 1. Understand the intent

Start with the request, issue, or accepted improvement scan. Read the code it touches until you can state, in this repository's own words:

- what the request means in the current product;
- which behavior, owner, and files would change;
- what the repository already does for the same kind of work; and
- which questions remain open.

Read the canonical agent map when one exists, then the domain owner it routes you to. When either route is absent, locate the smallest existing map and domain material by what they govern. Treat genuinely absent domain material as absent, not as a setup requirement. Use the vocabulary you find in the report. Read only the contexts, lessons, and decisions relevant to this request. Surface a relevant ADR conflict before you design around it. This first reading is complete when you can explain the request without repeating its words or inventing a solution.

## 2. Answer the questions

Send native Codex subagents one narrow, read-only question each. Use `fork_turns: "none"` and low reasoning for a narrow read-only scout, with distinct ownership and no delegation. Choose only the questions the first reading left open:

- how this repository already solves the affected behavior;
- how a standard platform, library, or public source solves it;
- what an installed runtime skill changes for this work; and
- any other concrete question raised by the touched code.

A scout returns evidence and uncertainty, never a decision. The root task integrates the findings and retains every user approval. When the repository or standard way already answers a question, keep it out of the fan-out.

## 3. Match the method to the work

A serious feature, cross-cutting behavior, or costly-to-reverse design earns the full method: blind-spot teaching, options from cheapest to most ambitious, prototypes for questions that are easier to see or drive, and one user question at a time in architectural order. A small fix settles from the codebase, its tests, and the standard way, then records only the decisions that need carrying forward. State which path you took and why.

When unknowns remain, work through them with me, the blind-spot pass first. Ask where I am in my thinking and what experience I have with this problem and this part of the code. Name what I have not thought to ask, explain what good looks like here, and show the prior work and the potholes so I can steer the rest.

While the direction is open, put the options on the table, cheapest to most ambitious, and say which one you would take. Some questions are cheaper to settle by looking at or driving a real artifact. For those, use [prototype](../prototype/SKILL.md) and show several genuinely different directions. A rendered screen must be a real render. When nothing can render yet, use a wireframe for layout and flow. A decision that is open, costly to reverse, and settled by no cheap check goes to [panel](../panel/SKILL.md), and its result feeds the next questions. The direction is settled when its boundaries state what is in and out.

Ask one question at a time, starting with the ones that change the architecture. Give each question your recommended answer, explain what happens today, what each answer changes, and what it costs. When a question can be answered from the codebase or a tool, answer it yourself. When I say I do not understand, explain more fully and ask again.

Keep everything that settled a decision for as long as you are building: the approved prototype sources, their screenshots, and the references I pointed at. Point a builder's brief and QA scenarios at an approved render instead of describing it in prose. Fold validated decisions into the spec; prototypes remain throwaway evidence rather than production code.

When the run is autonomous I am not there, settle each step from the repository's precedent and the standard way, and record each settlement with its reason. When neither settles it, take the reversible option and say so.

## Completion

Return one discovery report containing the original request, the repository-specific interpretation, evidence and uncertainty, the settled direction and boundaries, the decisions made by the user or by precedent, the remaining user-owned decisions, and whether discovery settled anything beyond the request. That last answer tells maestro whether to synthesize a spec or carry the request text verbatim.
