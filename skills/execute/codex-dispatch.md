# Codex dispatch grammar

Every codex seat is one `codex exec` invocation, fully specified so it runs identically on any host: `--ignore-user-config` always (the machine's config, model, and notify hooks are ignored — auth still resolves from `CODEX_HOME`); model and effort verbatim from the routing table; the `--json` event stream (stdout — redirect it) and the `-o` final message both captured as evidence. The run blocks to completion: launch it as a background shell, collect both files. Launch liveness: `thread.started` must appear in the events file within a few minutes of launch; absent, kill and relaunch — a wedged exec sits alive at 0% CPU forever, and a seat deadline sized for the work is too slow a detector for a startup hang. A failed invocation is reported with its stderr, never worked around. Directory trust never gates these runs — probed 2026-07-05: a fresh, never-trusted worktree under `--ignore-user-config` executes normally; the trust prompt is an interactive-TUI concern, so no `trust_level` entry is ever needed and none would survive `--ignore-user-config` anyway.

One-turn seats (review, clerk mechanics):

```
codex exec --ignore-user-config -m <model> -c model_reasoning_effort=<effort> -s <sandbox> -C <worktree> --json -o <msg> < brief.md > <events>
```

Builders take `-s workspace-write`; consultation and clerk reads take `-s read-only`. A codex **reviewer** takes `-s workspace-write`; its isolation and instrument staging are in Codex reviewer preparation below. A **QA** seat takes `-s workspace-write -C` the run worktree — evidence lands under `.bottega/verify/<feature-slug>/` and fixtures in the temp dir, both inside that sandbox.

## What every brief carries

- Skills and files by absolute path. `$CLAUDE_PLUGIN_ROOT`, slash commands, and subagents do not exist for a codex seat — a brief naming any of them stalls the seat. Bulk work a Claude seat would fan out to subagents, a codex brief chunks inline.
- The gate commands verbatim, split into seat-run and clerk-run. The sandbox blocks localhost binds as well as gitdir writes, so any binding gate — dev server, browser, integration suite — is the clerk's by name, or the seat burns its turn on `listen EPERM` and ships code it never saw run.
- An output contract ending in a fenced JSON block — verdict, files touched, evidence paths, anomalies — so the `-o` message is parsed like every other seat's report, never hand-read prose.

## Codex reviewer preparation

Before every codex reviewer dispatch, a clerk creates a disposable copy of the
slice worktree at the reviewed green tip. The clerk pre-runs every instrument
named by `skills/reviewing` that the codex seat's harness lacks and puts the
resulting findings files in the dossier. Run the reviewer from the disposable
copy with `-s workspace-write`: read-only starves the suites and probes reviewing
demands, and disposability, not the sandbox, keeps the reviewer's hands off the
product tree. Sweep the copy after the round.

## The two-brief builder sequence

Codex sandboxes deny writes under a shared gitdir, so a codex builder in a slice worktree cannot commit — verified, never solved with `danger-full-access`. Builder briefs contain no git commands; the dispatching clerk owns every git step: pre-creates worktree and branch, then splits the build into two turns on one thread so the commit grammar survives. Authorship stays with the builder; the clerk never writes implementation code. Both turns run from inside the slice worktree.

**RED — failing tests.** The brief says tests only — no production code, stop at red: a RED turn that runs on to green leaves the clerk nothing true to commit, and the RED commit becomes a lie. Plain `exec`:

```
codex exec --ignore-user-config -m <model> -c model_reasoning_effort=<effort> -s workspace-write -C <worktree> --json -o red-msg.txt < brief-red.md > red-events.jsonl
```

The clerk verifies the tests fail on the assertion and commits RED. The thread id is the `thread_id` field of the `thread.started` event in `red-events.jsonl`.

**GREEN — implement to green.** Resume by that id — never `--resume`/`--last`, which select by cwd and pick the wrong session under parallel slices. `resume` drops exactly two of `exec`'s flags; every other flag is repeated verbatim. Both dropped flags are load-bearing:

- no `-s`: the sandbox defaults to read-only — pass `-c sandbox_mode=workspace-write` or the turn is a silent no-op that still exits 0;
- no `-C`: the writable root and the builder's file paths follow the process cwd — running from inside the slice worktree is what puts GREEN in the right tree.

```
codex exec resume <thread-id> --ignore-user-config -m <model> -c model_reasoning_effort=<effort> -c sandbox_mode=workspace-write --json -o green-msg.txt - < brief-green.md > green-events.jsonl
```

(`-` is resume's read-the-brief-from-stdin marker.) The clerk runs the gate and commits green.

The thread is context reuse, not a requirement: it lives only in that host's `CODEX_HOME` and dies with the seat. Reclaiming a seat that finished RED, dispatch GREEN as a fresh `exec` with a self-contained brief — RED is already committed.
