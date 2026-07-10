---
name: panel
description: Draft one hard artifact from independent frontier panelists — blinded drafts, a compare-only judge, the maestro synthesizes. Reached by pointer from skills/spec.
disable-model-invocation: true
---

# Panel

A drafting instrument for one-shot artifacts where coverage and framing decide quality and no checker can catch a wrong answer — the spec contract is its default use (`skills/spec`, step 5). Work a checker verifies and long-horizon execution ride the run instead, and a decided question stays decided.

Why a panel, technically: two independently trained models have decorrelated errors — on the same task they fail in different places. Two independent drafts therefore cover more of the task than either alone, and where they disagree is exactly where the task is underdetermined or one of them is wrong. A compare-only judge turns that disagreement into an inspectable object; merging or voting would average it away, and a single model re-reading its own draft cannot produce it at all. Divergence is also the only detector that needs no aiming — it finds the assumptions nobody knew to question — which is why the prompt's level decides what the panel can catch.

Run it as the bundled workflow — the judge's comparison comes back schema-valid or not at all, and blinding is code, not discipline:

    Workflow({ scriptPath: "<this skill's dir>/panel.js",
               args: { task: <one self-contained prompt> } })

The prompt is each panelist's whole world: the problem, the constraints, the repo pointers, the template — never your preferred solution. Panelists handed your bet return two copies of it, and the contradiction that would have surfaced a better shape never appears. Write it at the level the user's grill answers set: intent-level when the request was a candidate (panelists free to spec a different move), request-level only when the ask is truly fixed. If a panelist would need your session context, the prompt is missing something.

Synthesize from the returned comparison — yours, never a vote: keep agreements weighed by their evidence; settle each contradiction by the stronger evidence; fold in what only one panelist saw. What no panelist addressed, and the assumptions they split on, go to the user as open questions. Land the returned object beside the phase's working state, so the disagreement behind the final stays readable.
