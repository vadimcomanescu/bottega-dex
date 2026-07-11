# Slice integration — the mechanic protocol

The slice lifecycle's mechanics are mechanic work. Apply each at its named moment;
an ownership breach, merge conflict, or new suite failure is a report to the
orchestrator, never a judgment the mechanic makes.

1. **Cross-check ownership.** Before parallel builder dispatches, compare the
   briefs' owned-files lists. An overlap without a written ordering blocks those
   dispatches.
2. **Provision.** Create each parallel slice worktree at
   `.bottega/wt/<feature-slug>/<slice>/` from the run branch and duplicate the run worktree's
   installed dependencies cheaply. Never install them from scratch.
3. **Check the diff.** Before integration, diff the slice from its branch point
   and compare every changed path with its owned-files list. Any out-of-list path
   is a finding; stop before the merge and report it.
4. **Merge.** In the run worktree, merge only the reviewed green slice tip. Keep
   its RED and green commits intact and create the `bottega: integrate <slice>`
   commit even when Git could fast-forward. A conflict goes back to the orchestrator;
   the mechanic never resolves it by editing product code.
5. **Verify the integration.** Run the full host suite on the run branch, compare
   its failures with `.bottega/run/<feature-slug>/baseline.json`, and report the exit code plus
   every failure beyond that baseline.
6. **Sweep.** Once the integration report is verified, remove the slice worktree
   and its duplicated dependencies. Leave no `.bottega/wt/<feature-slug>/<slice>/` entry behind.
