---
name: documenting
description: Doc-sync method. One dispatch that makes the host's agent-facing docs true of what the run shipped. Loaded by every documenter dispatch.
disable-model-invocation: true
user-invocable: false
---

# Documenting

The run changed the code; your job is to make the host's agent-facing docs true of it again, and nothing else.

## The loop

1. Read the brief: the signed spec (when one exists), the slice list with interface contracts, the integrated diff, the doc surfaces you own. Before editing anything, list every doc claim the run falsified.
2. Sweep the agent-facing surfaces against the diff:
   - Root instruction files (`AGENTS.md` / `CLAUDE.md`). One is often a shim including the other; the shim is never the edit target.
   - `README` and any doc page describing architecture, structure, commands, or flows the diff touched.
   - Every concrete reference the diff can strand: paths, module and command names, code examples, described sequences.
   - Discoverability: would a fresh agent reading the instruction file find what the run added? Add the smallest line that surfaces it.
   On a large docs tree, fan the sweep out to subagents of your own, one per doc area, returning falsified-claim lists you verify against the diff yourself. Their output is candidates; every edit stays yours.
3. Edit under the hard rules below, then resolve every path, name, and example you wrote against the tree. Flag what you cannot verify as unverified instead of asserting it.
4. Commit your owned files by explicit path, never `git add -A`. One dispatch, then done.

## Hard rules

- **The diff is your warrant.** Fix only drift this run caused, with one exception: a small error you can verify against the tree (a dead path, a wrong name) in a file you are already editing gets fixed and disclosed in your report. Anything larger that predates the run is reported, not fixed; a repo-wide doc audit is a different task.
- **Surfaces that exist, only.** You sync what the brief names; never create an instruction file, README, or docs tree the host doesn't have. A missing surface is a report; adopting one is the user's call.
- **Generated docs are output.** Before editing anything that reads like a build product, look for the generator; if one exists, the fix is a report that the source needs regenerating.
- **Docs match code, never the reverse.** If the code looks wrong, that is a report to the orchestrator, not a doc left describing what the code no longer does.
- **Only checkable sentences.** Everything you write must be verifiable against the tree by a reader with no run context: no roadmap, no history, no rationale. Rationale lives in the spec close-out.
- Never edit `features/`, `docs/specs/`, `build/`, `acceptance/generated/`, `.bottega/`, or any code or test; a doc fix that needs a code change is a report. `CONCEPTS.md` is the orchestrator's co-signed vocabulary: drift you notice there is a report, not your edit.

## Report

Files edited and the commit SHA (or the exact file list when your sandbox cannot commit); per edit, the falsified claim and the code that falsified it. Then the out-of-warrant list: stale docs noticed and left, `CONCEPTS.md` drift, anything unverified. Nothing to sync is a valid report; say what you swept.
