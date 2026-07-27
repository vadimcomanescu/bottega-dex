---
name: start
description: Take on a Bottega Dex run before discovery or agent dispatch. Used by maestro to settle ownership, isolate the worktree and branch, record release intent, read project commands, and confirm pull-request publication is ready.
---

# Start

Prepare the run before discovery or dispatch: owned, isolated, commands in hand, pull-request publication ready.

## 1. Settle release and ownership

Settle the release answer before mutation. A request that says land or merge means `land`; a request that says hold means `hold`. When it says neither, ask the user once: land on green, or hold for you. Never infer or default the answer.

For a tracker issue, read its assignee. Assigned to an account other than the one this session operates as: stop and report. Otherwise assign it to this session's account; the PR that delivers the issue closes it. An issue-driven run embeds the issue number in its slug, so one issue maps to one branch, and an existing branch for the work means it is claimed: stop and report. The slug names the work as the request states it, since discovery has not run yet. Continue an existing run only when pointed at its branch. Complete when the release answer is settled and the work is yours, or the run has stopped with the reason.

## 2. Isolate

First sweep finished work: a `.bottega/run/` entry or worktree whose PR has merged is done; delete its run directory, worktree, and branches, local and remote. Then work from inside a worktree on branch `bottega/<slug>`: create it and enter it, through the harness's worktree tool when it has one (create, or enter by path one already made), otherwise by changing directory into it; every command for the rest of the run runs from inside the worktree. The user's checkout stays untouched, and the run's changes reach main only through the PR. Continuing an existing run, recreate the worktree from its branch. Creating a new branch, push it upstream immediately as a create-only update: `git push -u origin bottega/<slug> --force-with-lease=refs/heads/bottega/<slug>:` (the empty expected value means the remote ref must not exist, so exactly one creation wins). A rejected push means another session owns the branch: stop and report. Complete when your working directory is the worktree and its branch is upstream.

## 3. Write the owner file

Write `$CODEX_THREAD_ID` to `.bottega/run/<slug>/owner` before the run's first dispatch. It is the durable collision and continuation record for the active Codex task. Write the release answer to `.bottega/run/<slug>/release`, `land` or `hold`; close reads it before the PR opens. Resuming in a later task, rewrite the owner file before dispatching anything, and write the release file when the run predates it, asking the user when no answer was ever settled. Complete when the owner file names this task and the release file carries the run's answer.

## 4. Read the commands

Read the project's commands (format, lint, typecheck, test, build, run) from the repo's agent map (`AGENTS.md` or `CLAUDE.md`; setup keeps one a symlink of the other so Claude Code and the codex CLI read the one copy). The map is the commands' one home: a brief quotes them from it, never defines them elsewhere. A command missing or broken there is discovered once and written back to the map as part of the run's diff, and the same rule covers any operating fact a worker had to dig for: how the app boots from a worktree, seed data, migration steps. Complete when every command the run will brief is read from the map.

## 5. Confirm publication

Confirm `gh auth status` for the repository host and that the run can read its target repository and base branch. Complete when pull-request publication is ready or the user knows why it is not.
