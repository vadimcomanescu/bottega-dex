# Run start — the acceptance toolchain brief

Everything between SIGNED and the first builder brief is fully specifiable, so it is one
self-contained brief — a mechanic's on a multi-slice run, the orchestrator's own turns on a
small one. The orchestrator verifies the report (spec committed, suite RED, exit codes),
never re-performs the steps. The user never runs an installer. Like every
command-running brief, this one carries the safety rule (`skills/run`, Standing rules),
verbatim.

The brief, in order:

1. **Worktree and branch.** Create the run worktree at `.bottega/wt/<feature-slug>/run/`
   on a new branch `bottega/<feature-slug>` off trunk. Check the target isn't already inside
   a worktree; never nest.
2. **Toolchain.** If the host has no `.bottega/aps.lock`, install the
   acceptance-pipeline-kit from github.com/vadimcomanescu/acceptance-pipeline-kit —
   its `install.sh --version <release> --bin-dir .bottega/bin` (the shared
   parser/mutator binaries, language-agnostic; `<release>` is the kit's latest
   published release, pinned in the lock from then on), plus the kit package
   matching the host language:
   - TypeScript: `@aps-kit/typescript`
   - Python: `aps-kit` (pip git-subdirectory)
   - Go and Rust: the kit's packages for each
   Pin the hashes into `.bottega/aps.lock`. A host outside that language set is a
   refusal: stop, report, and the orchestrator tells the user the executable-acceptance
   promise cannot be kept on this repo. A lock with no binaries (fresh worktree or
   clone; `.bottega/bin` is never committed) reinstalls to the pinned hashes.
3. **Bare-checkout provisioning.** Treat the fresh worktree as a bare checkout:
   dependencies installed, env values copied by named variable — the brief lists
   the variables the suite reads, from the orchestrator's read of the host loader, and
   the mechanic writes only those into the worktree's env file, never a whole `.env*`
   from the checkout; a variable holding a real credential goes to the orchestrator
   before the copy, never a silent inherit. Otherwise the RED gate lies.
4. **Wire acceptance.** Generate the test entrypoints from `features/*.feature`,
   wire the suite, run it, and confirm it fails RED (the features are unimplemented;
   a passing or erroring-for-tooling-reasons suite is a defect to report, not RED).
5. **Baseline.** `.bottega/run/<feature-slug>/` starts empty but for `owner` — the
   orchestrator's session binding, written before this brief and never the brief's to
   touch; anything else already there under this slug is a dead run's debris to
   delete, and another slug's directory is another run's, never touched. Record the
   pre-existing-failure baseline once: run the full host suite, write failures to
   `.bottega/run/<feature-slug>/baseline.json` (test id + one-line failure).
   Briefs point at it; no slice worker ever re-derives it.
6. **Commit the wiring.** Commit the generated acceptance wiring on the run
   branch, following the commit grammar.
7. **Report.** Exit codes for every step, the RED evidence path, the baseline path.
