---
name: panel
description: Independent feedback on a costly plan decision. Blinded frontier recommendations, a compare-only judge; the orchestrator synthesizes. Reached by pointer from skills/run.
disable-model-invocation: true
user-invocable: false
---

# Panel

Run it after the spec is agreed, on a decision `skills/run` sends here: one expensive to reverse after merge. Independent frontier panelists answer the same question blind; a judge compares; you synthesize. Independently trained models fail in different places, so the answers disagree exactly where the problem is underdetermined or one answer is wrong, and the judge never merges, so the disagreement survives to be read. Panelists landing where you didn't is the signal your bet is suspect; panelists landing on your answer without ever seeing it is confirmation instead of an echo.

Run it as the bundled workflow. The judge's comparison comes back schema-valid or not at all, and blinding is enforced by code, not discipline:

    Workflow({ scriptPath: "<this skill's dir>/panel.js",
               args: { task: <one self-contained prompt>,
                       codexExec: <absolute path to the plugin's scripts/codex-exec> } })

The prompt is each panelist's whole world: the decision framed as a question, the agreed spec, the constraints, the repo pointers. Never include your preferred answer: panelists handed your bet return two copies of it, and the disagreement that would have surfaced a better shape never appears. If a panelist would need your session context, the prompt is missing something.

Synthesize from the returned comparison; the synthesis is yours, never a vote. Settle each contradiction by the stronger evidence; fold in what only one panelist saw. Where the panel moved you is named in the PR.
