# Commission 0001 — the commission lock CLI

**Status:** closed · **Acceptance:** was `features/commission-lock.feature` (delivered 2026-07; the CLI it commissioned was removed on 2026-07-08 — the lock never held more than git and PR review already hold, see the simplify PR)

## Intent

Bottega's first mechanical guarantee: once the user signs a commission, the feature files *are* the contract and nothing may change them unnoticed. This commission delivers the `bottega` CLI — `sign` freezes the contract, `verify` polices it — the guard every downstream gate calls.

## Non-goals

- No `init`/scaffold command. Installation is documented, not automated.
- No git hooks shipped. Hosts wire `verify` into their own gates.
- One commission lock per repo. No multi-commission bookkeeping.
- No Windows support.

## Acceptance

`features/commission-lock.feature` — the signed copy is canonical; prose here is commentary.

## Decisions log

- **Maestro-signed as delegate.** The user asked for autonomous delivery of bottega itself; sign-off is flagged for review at delivery instead of blocking on it.
- **Exit codes 0/1/2** (clean / drift / unsigned) — distinct so a host gate can tell "never signed" from "tampered".
- **The lock is deterministic** — no timestamp, no machine paths. Git history records when and where; determinism keeps handlers and mutation runs stable.
- **Lock lives at `.bottega/commission.lock`**, following the runtime-dir convention validated in the June playgrounds (`aps.lock`, `verify/<sha>/`, `wt/<slice>/`).

### Added during the run (flagged for user review)

- **Exit 3 = corrupt lock.** The adversary produced tampered locks (bad JSON, wrong version, duplicate paths, traversal paths) that either crashed verify or verified clean. Corrupt is now its own loud state — exit 3, `corrupt lock: <reason>` on stderr — because mapping tamper onto "unsigned, re-sign" (exit 2) would invite exactly the laundering the lock exists to prevent. The signed scenarios pin only 0/1/2 for their three states; 3 is additive.
- **The mutator's cache never touches the signed file — RESOLVED.** After a run, the APS mutator writes a comment block (stamp + manifest) into the feature file it read. Per the mutator spec this block is a differential-mutation cache — a speed optimization for re-runs, "must not be trusted" when stale — so it is scratch, never contract. Because `verify` compares the file's exact bytes against the signed hash, a cache block appended to the signed file would be reported as tampering. Resolution, matching both the spec and the June playground convention (feature files committed clean): the mutator runs against a copy (`FEATURE=build/acceptance-mutation/<file>`), the manifest is archived to `.bottega/verify/<sha>/` as evidence, and the signed file is never written. Codified in the maestro skill.
- **Repo created private, flipped public on user instruction** (2026-07-02).
- **Single slice, no worktree.** One file-disjoint slice in a fresh repo; worktree isolation buys nothing here. Parallel slices get worktrees per the skill.
- **Examiner pass ran against the delivered CLI** — walked every signed scenario by executing `node bin/bottega.js` in fresh temp repos, transcript archived in `.bottega/verify/<sha>/examiner-transcript.txt`.
