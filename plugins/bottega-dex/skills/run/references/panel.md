# Costly decision panel

Use this only for a decision that is expensive to reverse after merge and is not settled by repository precedent: a public contract, persisted data shape, dependency choice, or module boundary.

Write one self-contained question with the approved specification, constraints, and repository evidence. Do not include the orchestrator's preferred answer.

Start two blinded drafts in parallel:

- A native Codex panelist at Sol high with `agents/panelist.md` and `panelist.schema.json`.
- A Claude panelist through `scripts/claude-exec --role panelist` with the identical prompt and schema.

Neither sees the other draft. Label the results A and B without provider names. Send the question and both drafts to `scripts/claude-exec --role judge` with `agents/panel-judge.md` and `judge.schema.json`. The judge compares only. The orchestrator reads both drafts and the comparison, verifies decisive claims, and makes the decision. Record where the panel changed the plan.
