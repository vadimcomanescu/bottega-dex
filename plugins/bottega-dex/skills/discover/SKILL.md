---
name: discover
description: Find what a request does not say and settle its direction and boundaries with the user before anything is built.
---

# Discover

Find what I could not tell you, before anything is built: what my request does not say, what I could not put into words, what neither of us thought to ask. Follow it too literally and you build what I wrote when a different approach was better. Read it too loosely and you build something generic when this product needed its own answer. I can only settle what I understand, so explain every unknown in plain words before you ask me to decide it.

Read the canonical agent map when one exists, then the domain owner it routes you to. When either route is absent, locate the smallest existing map and domain material by what they govern. Treat genuinely absent domain material as absent, not as a setup requirement. Use the vocabulary you find in the work you report. Read only the contexts, lessons, and decisions relevant to this request. A missing context map, glossary, or ADR is not a gap. Surface a relevant ADR conflict before you design around it. Send native Codex subagents out, one job each, to return findings on:

- the code this change touches, and how this repo already does things like it
- how other people already solved this, searched online, so the build takes a proven pattern rather than an invented one
- the libraries and tools the work will use: what the version installed here actually does, read from its own documentation and source rather than from memory
- what the relevant installed agent skills would change here, not that they exist

Use `fork_turns: "none"` and low reasoning for a narrow read-only scout; give every scout a distinct question, no write ownership, and no permission to delegate. Use medium reasoning for routine bounded work and high reasoning only where the question is difficult. A scout returns evidence and uncertainty, never a decision. The root task integrates the findings and retains every user approval.

You are finished here when the reading and the scouts have answered everything they can and what is still open is written down. When I have already settled everything, skip the rest of this skill.

Ask me where I am in my thinking, and what experience I have with this problem and with this part of the code. Where the work turns on something I do not know, teach me that first, in as much depth as it takes for me to judge your choices, because I cannot decide anything when I do not know what its words mean.

Name my blind spots: what I have not thought to ask, each explained in plain words, until you have covered all of them.

While the scope is still open, put the options on the table, cheapest to most ambitious, and say which one you would take. My reactions set the direction. Some things I can only judge by seeing, so build those instead of asking: rough prototypes in genuinely different directions. Draw a wireframe only when nothing can be rendered, keep it to layout and flow, and never show me an image posing as the finished product. A decision that is open, costly to reverse, and settled by no cheap check goes to the root task for an independent panel or user decision, and what it returns feeds the questions you ask next. You are through this when the direction is chosen and its edges are stated: what is in, and what is out.

Ask me what is still ambiguous, one question at a time, the ones that change the architecture first. Give each question your recommended answer, so my reply can be a yes or a correction. Every question carries its explanation in the same message, in the product's own words and with a concrete example: what happens today, what each answer would change, and what it would cost. Explain any term I have not been given before you use it, whatever the run called it while exploring. When I say "I don't understand", something was missing from the explanation. Explain more fully and ask again, never shorter. Keep asking until you can predict how I will judge the finished work.

When I cannot find words for what I want, ask me for code that already does it my way, in any repo or language. That tells you more than anything I could describe.

Keep everything that settled a decision for as long as you are building: the approved prototype sources, their screenshots, the references I pointed at. Point a builder's brief at a render I approved instead of describing it in prose.

When the run is autonomous I am not there: settle each step from the repo's precedent and the standard way, and record each settlement with its reason.
