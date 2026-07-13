---
name: panel
description: Internal Bottega Dex panel method for an expensive-to-reverse plan decision.
---

# Panel

Use a panel for a decision that is expensive to reverse after merge: public contracts, persisted data shape, dependency choices, or where a change lives. Skip it only when the repository already has the same decision as established precedent.

Write one self-contained question containing the agreed specification, constraints, and repository pointers. Do not include the orchestrator's preferred answer.

Launch the bundled fixed workflow through `scripts/panel-run`. It starts exactly two blind drafts in parallel through `scripts/worker-exec`:

- `--role codex-panelist` with `references/panelist.schema.json`
- `--role claude-panelist` with `references/panelist.schema.json`

Each receives the identical question and neither receives the other's output. The runner labels the returned drafts A and B, creates a comparison brief containing only the original question plus Draft A and Draft B, and sends it through `--role claude-judge` with `references/judge.schema.json`. Provider, model, and role identities never enter the judge brief.

The judge compares only. It does not merge, vote, grade, or answer the original question. The GPT-5.6 Sol Ultra orchestrator reads both drafts and the comparison, resolves contradictions by evidence, and synthesizes the decision. Record where the panel changed the plan for the pull request.

The runner is one fixed, terminating workflow. It has no polling, retries, persistence, or open-ended fan-out. A failed call returns failure to the orchestrator for diagnosis.
