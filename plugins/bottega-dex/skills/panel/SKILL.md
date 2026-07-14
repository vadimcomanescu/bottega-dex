---
name: panel
description: Internal Bottega Dex panel method for an expensive-to-reverse plan decision.
---

# Panel

Use a panel for a decision that is expensive to reverse after merge: public contracts, persisted data shape, dependency choices, or where a change lives. Skip it only when the repository already has the same decision as established precedent.

Write one self-contained question containing the agreed specification, constraints, and repository pointers. Do not include the orchestrator's preferred answer. Resolve `references/agents/panelist.md` and `references/agents/panel-judge.md` as absolute paths. Never send this panel orchestration skill to a worker.

Start exactly two blind drafts in parallel:

- One native Codex subagent requested at GPT-5.6 Sol high. Give it `references/agents/panelist.md`, the question, and `references/panelist.schema.json` by absolute path. Require one matching JSON object.
- One external Claude panelist through `scripts/claude-exec --role panelist` with the identical role prompt, question, and schema.

Neither receives the other's output. After both finish, label the returned drafts A and B. Create a comparison brief containing `references/agents/panel-judge.md`, the original question, Draft A, and Draft B. Do not include provider, model, or role identities. Send that brief through `scripts/claude-exec --role judge` with `references/judge.schema.json`.

The judge compares only. It does not merge, vote, grade, or answer the original question. The GPT-5.6 Sol Ultra orchestrator reads both drafts and the comparison, resolves contradictions by evidence, and synthesizes the decision. Record where the panel changed the plan for the pull request.

Use native agent controls and tracked background shell execution. Do not poll, retry automatically, persist a worker, or expand the panel. A failed call returns failure to the orchestrator for diagnosis.
