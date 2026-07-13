---
name: implementing
description: Internal Bottega Dex builder method for one test-first slice inside a fixed interface.
---

# Implementing

1. Read the brief: slice intent, interface contract, owned files, host commands, and the absolute path to this method.
2. Work test-first. Write the smallest failing test for the next behavior, observe the intended assertion fail, then make it pass with the least code that works. Verify unfamiliar library calls against the installed version.
3. Repeat until focused tests are green. Run the full suite. Redirect output to a file and check the exit code; never pipe it.
4. Commit. Stage owned files by explicit path, never `git add -A`.
5. Return one JSON object: `status` (`green` or `stuck`), the red and green evidence, files touched, tests edited, commands and results, commit SHA, decisions the brief did not determine, and anything noticed outside the owned files.

The architecture and interface in the brief are fixed. If the interface cannot work, stop and report instead of redesigning around it. A missing decision is a question, not a guess. An edge case wholly behind the interface is yours: choose the conservative behavior and report it.

Never skip a test or weaken one to reach green. The only exception is an assertion whose behavior the interface contract explicitly changes. Name that edit and quote the contract line that requires it. Three failed fix attempts is stuck, and stuck is a valid report.

When sibling slices run in parallel, do not touch paths outside your owned list. When building alone, touch what the slice needs and name every extra path. One invocation owns one slice.
