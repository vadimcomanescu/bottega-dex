# Codex dispatch

Every codex worker is one `codex exec` invocation, fully specified so it runs identically on any host: `--ignore-user-config` always (the machine's config, model, and notify hooks are ignored; auth still resolves from `CODEX_HOME`); model and effort verbatim from the routing table; the `--json` event stream (stdout, redirect it) and the `-o` final message both captured as evidence. Launch it as **tracked background Bash**; the harness re-invokes you when it exits. Never a polling loop, never an untracked shell. One bounded check completes the dispatch: confirm `thread.started` appears in the events file shortly after launch (a single `timeout`-bounded grep). If it is absent, kill and relaunch: a wedged exec sits alive at 0% CPU forever and never exits into the harness's notification. A failed invocation is reported with its stderr, never worked around. Directory trust never gates these runs (verified 2026-07-05: a fresh, never-trusted worktree under `--ignore-user-config` executes normally; no `trust_level` entry is needed and none would survive `--ignore-user-config` anyway).

One-turn dispatches (review, consultation):

```
codex exec --ignore-user-config -m <model> -c model_reasoning_effort=<effort> -s <sandbox> -C <worktree> --json -o <msg> < brief.md > <events>
```

Builders and reviewers take `-s danger-full-access`; consultation reads take `-s read-only`. Full access is a decision, not a convenience; do not "fix" it back. Claude workers run unsandboxed on the same host, so the run's trust boundary is the trusted repo plus the worktree, and sandboxing only the codex family adds no safety while breaking the worker: `workspace-write` denies every socket (no localhost bind, no dev server, no database, no integration suite; verified 2026-07-11) and denies shared-gitdir writes (no commits). Its one repair knob, `sandbox_workspace_write.network_access`, is silently ignored on macOS, so it cannot make a dispatch run identically on any host. The sandbox returns only as role enforcement where the worker must not write: consultation reads. If bottega ever runs on a repo the user does not trust, the sandbox comes back, for both families.

## What every brief carries

- The three brief lines from `skills/run` (the safety rule, no piped test commands, name every test you edit), verbatim.
- Skills and files by absolute path. `$CLAUDE_PLUGIN_ROOT`, slash commands, and subagents do not exist for a codex worker; a brief naming any of them stalls the worker. Bulk work a Claude worker would fan out to subagents, a codex brief chunks inline.
- The gate commands verbatim. The worker runs its own gate, including anything that binds (dev server, integration suite), and watches it pass. Green stays something the worker saw itself.
- An output contract ending in a fenced JSON block (verdict, files touched, evidence paths, anomalies, decisions the brief did not determine), so the `-o` message is parsed like every other worker's report instead of hand-read as prose. Reviewers are the exception: their contract is the schema, below.

## Codex reviewer preparation

Before every codex reviewer dispatch, have a disposable copy of the run worktree created at the head SHA under review (a sonnet dispatch, or your own turns on a small run). Run the reviewer from the disposable copy with `-s danger-full-access`: read-only starves the suites and probes reviewing demands, and disposability, not the sandbox, keeps the reviewer's hands off the product tree. Remove the copy after the round.

A reviewer dispatch adds `--output-schema <install root>/skills/reviewing/references/report.schema.json` (absolute path, like everything else here) to the `exec` line, so the `-o` message is the schema-enforced review report itself. Before accepting it, check the echoed identity against the brief: `round`, `reviewer.family`, `reviewer.model`, and all three `target` SHAs must match what you dispatched. The schema proves shape, not identity; a mismatch on either is a failed dispatch to diagnose, never a report to repair.

## The builder brief

A codex builder is one `exec` turn that owns the whole slice, same as a Claude worker: write the failing tests, watch them fail, implement to green, commit. The brief carries the run's commit message format, and the worker commits its own work by explicit path per `skills/implementing`. The worktree and branch are pre-created (a sonnet dispatch, or your own shell); nothing commits for the worker and nothing writes implementation code for it. The turn runs from inside the slice worktree.

## Resuming a codex thread

Review findings go back to the builder by `codex exec resume <thread-id>`; the id is the `thread_id` field of the `thread.started` event in the events file. Never `--resume` or `--last`, which select by cwd and pick the wrong session under parallel slices. `resume` drops exactly two of `exec`'s flags; every other flag is repeated verbatim. Both dropped flags matter:

- no `-s`: the sandbox defaults to read-only. Pass `-c sandbox_mode=danger-full-access` or the turn is a silent no-op that still exits 0.
- no `-C`: the writable root and the builder's file paths follow the process cwd. Run from inside the slice worktree.

```
codex exec resume <thread-id> --ignore-user-config -m <model> -c model_reasoning_effort=<effort> -c sandbox_mode=danger-full-access --json -o fix-msg.txt - < brief-fix.md > fix-events.jsonl
```

(`-` is resume's read-the-brief-from-stdin marker.) The thread is context reuse, not a requirement: it lives only in that host's `CODEX_HOME` and dies with the worker. A dead thread means a fresh `exec` with a self-contained brief carrying the findings and the worker's prior report.
