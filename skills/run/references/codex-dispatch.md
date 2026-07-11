# Codex dispatch

Every codex worker is one `codex exec` invocation, fully specified so it runs identically on any host: `--ignore-user-config` always (the machine's config, model, and notify hooks are ignored — auth still resolves from `CODEX_HOME`); model and effort verbatim from the routing table; the `--json` event stream (stdout — redirect it) and the `-o` final message both captured as evidence. Launch it as **tracked background Bash** — the harness re-invokes you when it exits; never a polling loop, never an untracked shell. One bounded check completes the dispatch: confirm `thread.started` appears in the events file shortly after launch (a single `timeout`-bounded grep) — absent, kill and relaunch, because a wedged exec sits alive at 0% CPU forever and never exits into the harness's notification. A failed invocation is reported with its stderr, never worked around. Directory trust never gates these runs — verified 2026-07-05: a fresh, never-trusted worktree under `--ignore-user-config` executes normally; no `trust_level` entry is ever needed and none would survive `--ignore-user-config` anyway.

One-turn dispatches (review, consultation):

```
codex exec --ignore-user-config -m <model> -c model_reasoning_effort=<effort> -s <sandbox> -C <worktree> --json -o <msg> < brief.md > <events>
```

Builders and reviewers take `-s danger-full-access`; consultation reads take `-s read-only`. Full access is a decision, not a convenience — do not "fix" it back. Claude workers run unsandboxed on the same host, so the run's trust boundary is the trusted repo plus the worktree, and sandboxing only the codex family adds no safety while breaking the worker: `workspace-write` denies every socket (no localhost bind, no dev server, no database, no integration suite; verified 2026-07-11) and denies shared-gitdir writes (no commits). Its one repair knob, `sandbox_workspace_write.network_access`, is silently ignored on macOS, so it cannot make a dispatch run identically on any host. The sandbox returns only as role enforcement where the worker must not write: consultation reads, and the `codex review` tool's `read-only` pin in `skills/reviewing`. If bottega ever runs on a repo the user does not trust, the sandbox comes back — for both families.

## What every brief carries

- The safety rule (`skills/run`, Standing rules), verbatim.
- Skills and files by absolute path. `$CLAUDE_PLUGIN_ROOT`, slash commands, and subagents do not exist for a codex worker — a brief naming any of them stalls the worker. Bulk work a Claude worker would fan out to subagents, a codex brief chunks inline.
- The gate commands verbatim. The worker runs its own gate — including anything that binds (dev server, integration suite) — and watches it pass; green stays something the worker saw itself.
- An output contract ending in a fenced JSON block — verdict, files touched, evidence paths, anomalies — so the `-o` message is parsed like every other worker's report, never hand-read prose.

## Codex reviewer preparation

Before every codex reviewer dispatch, have a disposable copy of the slice worktree
created at the reviewed green tip (a mechanic brief, or your own turns on a small
run). Tools named by `skills/reviewing` that a codex worker cannot run — the
Claude harness's `/code-review` — are pre-run on the dispatcher's side and land in
the brief as findings files. Run the reviewer from the disposable copy with
`-s danger-full-access`: read-only starves the suites and probes reviewing demands,
and disposability, not the sandbox, keeps the reviewer's hands off the product
tree. Sweep the copy after the round.

## The builder brief

A codex builder is one `exec` turn that owns the whole slice, same as a Claude worker: write the RED tests, watch them fail, commit RED, implement to green, commit — the brief carries the run's commit grammar and the worker commits its own work by explicit path per `skills/implementing`. The mechanic still pre-creates the worktree and branch; it never commits for the worker and never writes implementation code. The turn runs from inside the slice worktree.

## Resuming a codex thread

Review findings go back to the builder by `codex exec resume <thread-id>` — the id is the `thread_id` field of the `thread.started` event in the events file. Never `--resume`/`--last`, which select by cwd and pick the wrong session under parallel slices. `resume` drops exactly two of `exec`'s flags; every other flag is repeated verbatim. Both dropped flags matter:

- no `-s`: the sandbox defaults to read-only — pass `-c sandbox_mode=danger-full-access` or the turn is a silent no-op that still exits 0;
- no `-C`: the writable root and the builder's file paths follow the process cwd — run from inside the slice worktree.

```
codex exec resume <thread-id> --ignore-user-config -m <model> -c model_reasoning_effort=<effort> -c sandbox_mode=danger-full-access --json -o fix-msg.txt - < brief-fix.md > fix-events.jsonl
```

(`-` is resume's read-the-brief-from-stdin marker.) The thread is context reuse, not a requirement: it lives only in that host's `CODEX_HOME` and dies with the worker. A dead thread means a fresh `exec` with a self-contained brief carrying the findings and the worker's prior report.
