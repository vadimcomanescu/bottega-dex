# Run start — the mechanic brief

Everything between SIGNED and the first dossier is fully specifiable, so it is one
self-contained mechanic brief, sandboxed to the run worktree. The maestro verifies the
report (contract committed, suite RED, exit codes), never re-performs the steps.
The user never runs an installer. Like every command-running brief, this one
carries the worker rail (`skills/execute`, Standing rules), verbatim.

The brief, in order:

1. **Worktree and branch.** Create the run worktree at `.bottega/wt/run/` on a new
   branch `bottega/<feature-slug>` off trunk. Check the target isn't already inside
   a worktree; never nest.
2. **Toolchain.** If the host has no `.bottega/aps.lock`, install the
   acceptance-pipeline-kit: `install.sh --version <release> --bin-dir .bottega/bin`
   (the shared parser/mutator binaries, language-agnostic), plus the kit package
   matching the host language:
   - TypeScript: `@aps-kit/typescript`
   - Python: `aps-kit` (pip git-subdirectory)
   - Go and Rust: the kit's packages for each
   Pin the hashes into `.bottega/aps.lock`. A host outside that language set is a
   refusal: stop, report, and the maestro tells the user the executable-acceptance
   promise cannot be kept on this repo. A lock with no binaries (fresh worktree or
   clone; `.bottega/bin` is never committed) reinstalls to the pinned hashes.
3. **Bare-checkout provisioning.** Treat the fresh worktree as a bare checkout:
   dependencies installed, env values copied by named variable — the brief lists
   the variables the suite reads, from the maestro's read of the host loader, and
   the mechanic writes only those into the worktree's env file, never a whole `.env*`
   from the checkout; a variable holding a real credential goes to the maestro
   before the copy, never a silent inherit. Otherwise the RED gate lies.
4. **Wire acceptance.** Generate the test entrypoints from `features/*.feature`,
   wire the suite, run it, and confirm it fails RED (the features are unimplemented;
   a passing or erroring-for-tooling-reasons suite is a defect to report, not RED).
5. **Baseline.** Start `.bottega/run/` empty — anything already there (a dead
   run's baseline or conventions file that Close never reaped) is debris to
   delete, never inherited. Then prove the pre-existing-failure baseline once:
   run the full host suite, record failures to `.bottega/run/baseline.json`
   (test id + one-line failure). Dossiers point at it; no slice seat ever re-proves it.
6. **Commit the contract.** Commit the generated acceptance wiring on the run
   branch, following the commit grammar.
7. **Report.** Exit codes for every step, the RED evidence path, the baseline path.
