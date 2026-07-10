---
name: patch
description: The small job — a bug fix, a small improvement, work with no contract a user would sign. Skips the commission and the gate entirely; keeps isolation, opposite-family review, and the PR. Invoke via /bottega:patch or when the user asks bottega for a fix or small improvement in their own words; never proactively. Feature-shaped work is refused and pointed at /bottega:spec.
argument-hint: "<task>"
---

# Patch — the small job

The commission machinery exists to pin a contract the user must read and sign. Work with no contract to sign — a bug fix, a small improvement, a cleanup — skips it whole: no spec doc, no `features/`, no gate, no QA reel, no mutation. Those prove a signed contract, and a patch has none. What a patch never skips: isolation, opposite-family review, the host's own test gate, the PR.

## Entry — is it a patch?

Feature-shaped work is refused, not shrunk: new user-visible behavior worth a scenario, a change the user would want to see before it ships, or work spanning more than ~2 seams goes to `/bottega:spec` (or `/bottega:run`). When in doubt, commission. The tripwire holds mid-patch: work that grows feature shape parks — say so and point at the spec, never finish it as a patch.

## The job

This is a maestro-seat skill. The routing table, the fable fence, the codex CLI check, and the standing rules of `skills/execute` bind every dispatch here; the route guard enforces them exactly as in a run.

1. **Isolation.** Branch `bottega/patch-<slug>` in a worktree under `.bottega/wt/patch/`; the user's checkout stays on trunk, and the PR is the only path there.
2. **Build.** Trivial and fully specified: build it in your own turns. Anything else: one builder seat with a self-contained brief — the defect or the improvement, the failing case first where a test can hold it, the seam it lives in. The host suite runs green either way; output redirected to a file and the exit code checked, never piped.
3. **Review.** As in `skills/execute` gate 6 — a fresh opposite-family reviewer per round (`skills/reviewing`), round 1 on the whole diff, findings back to the builder, you rule on every one — with no pilot and no conventions file. Review never collapses, whoever built it: your own diff gets the same opposite-family eyes. Still open after round 3 is a diagnosis, never another round.
4. **Deliver.** A PR: what was broken or lacking, what changed, the test that holds it, provenance (builder and reviewer, family and model, rounds, findings and verdicts), and any call the ask underdetermined, made and flagged. Push, open the PR, reap the worktree (the pushed branch holds everything); delete the local branch after the merge.

Underdetermined calls: make them and flag them in the PR — a patch is reviewed after, not asked before. The one rail rides in every command-running brief verbatim: *if a step would touch real users, real money, a deploy, or shared or production data, don't run it — report what the step needs and wait.*
