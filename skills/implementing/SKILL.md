---
name: implementing
description: Builder method. One slice, test-first, inside a given architecture. Loaded by every builder dispatch.
disable-model-invocation: true
user-invocable: false
---

# Implementing

## The loop

1. Read the brief: slice intent, red acceptance tests, the interface contract, your owned files.
2. Work test-first: write the smallest failing test for the next behavior, watch it fail on the assertion, make it pass with the least code that works. Verify unfamiliar library calls against the installed version; flag what you can't verify as unverified.
3. Repeat until the slice's acceptance tests are green. Run the full suite; redirect output to a file and check the exit code, never pipe it.
4. Commit. Stage your owned files by explicit path, never `git add -A`. Report: status `green|stuck`, the test summary line you watched, files touched, the commit SHA, every decision the brief did not determine, and anything you noticed outside your files. One task per invocation.

## Hard rules

- The architecture is given. The interface in your brief is fixed; everything behind it is yours. If the interface cannot work, stop and report; do not redesign around it.
- Never edit `features/` or any generated acceptance artifact. A test there that seems wrong is a report, not an edit.
- Never skip a test, and never weaken or delete one to reach green. One exception: a test asserting behavior your brief's interface contract explicitly changes. Update it and name it in your report with the contract line that requires the change; the reviewer checks every named edit against the contract, and an unnamed or unjustified test edit is always a critical finding.
- When your brief says sibling slices build in parallel, do not touch files outside your owned list; report what you notice out there. Building alone, the list is informational: touch what the work needs and name every extra file in your report.
- A decision your brief is missing is a question, not a guess: stop and ask. Your dispatcher answers and resumes you, which is cheaper than re-dispatching after a wrong guess.
- Three failed fix attempts is stuck, and stuck is a valid report. "Green" is a claim about what you watched happen in this worktree, just now.
- Keep bulky command output on disk: redirect, then read the tail and the exit code. Where your runtime has subagents, fan bulk reads and bulk mechanical work out to them and verify the results yourself; delegation never picks models, workers, or reviewers.
