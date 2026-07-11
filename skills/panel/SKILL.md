---
name: panel
description: Draft one hard artifact from independent frontier panelists. Blinded drafts, a compare-only judge, the orchestrator synthesizes. Reached by pointer from skills/run and skills/spec.
disable-model-invocation: true
---

# Panel

A drafting tool for one-shot artifacts where coverage and framing decide quality and no checker can catch a wrong answer; its standing uses are the run's approach, when the repo doesn't settle the architecture (`skills/run`, The plan), and the spec (`skills/spec`, step 2). Work a checker verifies and long-horizon execution belong in the run instead, and a decided question stays decided. Independently trained models fail in different places, and the judge compares instead of merging, so the disagreement between drafts stays inspectable; that disagreement is the product.

Run it as the bundled workflow. The judge's comparison comes back schema-valid or not at all, and blinding is enforced by code, not discipline:

    Workflow({ scriptPath: "<this skill's dir>/panel.js",
               args: { task: <one self-contained prompt> } })

The prompt is each panelist's whole world: the problem, the constraints, the repo pointers, the template. Never include your preferred solution: panelists handed your bet return two copies of it, and the contradiction that would have surfaced a better shape never appears. Write it at the level the user's answers set: intent-level when the request was a candidate (panelists free to spec a different move), request-level only when the ask is truly fixed. If a panelist would need your session context, the prompt is missing something.

Synthesize from the returned comparison; the synthesis is yours, never a vote. Keep agreements weighed by their evidence; settle each contradiction by the stronger evidence; fold in what only one panelist saw. What no panelist addressed, and the assumptions they split on, go to the user as open questions. Save the returned comparison in the run's working state.
