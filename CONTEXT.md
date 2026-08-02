# Bottega Dex

The vocabulary used by the delivery skills and their reports.

## Language

**Run**:
One end-to-end Bottega Dex delivery from a request through a reviewed pull request.

**Orchestrator**:
The main Codex task responsible for one Bottega Dex run.

**Worker**:
A Codex subagent assigned one bounded part of a run.

**Review worker**:
A worker responsible for reviewing one frozen change until it is accepted or escalated.

**Independent review**:
One review of a frozen change against one authority. Standards review means checking repository conventions. Spec review means checking delivered behavior against the promised specification.

**Plan**:
The run's durable architecture handoff written before builders start: what builders must not decide, the named interfaces tests cross, any threat model, and the vertical slices. It is separate from the behavioral specification. The repository's documented planning authority owns it; without one, it stays in isolated run state or the conversation.
_Avoid_: execution plan, design (design is the activity; Plan is the artifact)

**Landing procedure**:
The repository's documented rule for what lands a pull request, read from its agent map and its routed authority.

**Brake**:
The named condition that keeps a pull request out of landing, and whether repository machinery enforces it.

**Arm**:
The action that admits a pull request to landing: an opener action, automatic queue entry for an eligible non-draft pull request, or no action because repository machinery owns it.

**Deciding signal**:
The required check or queue state that decides whether the documented landing procedure can proceed.
