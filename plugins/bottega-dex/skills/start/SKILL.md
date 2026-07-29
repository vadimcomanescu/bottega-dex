---
name: start
description: Prepare a Bottega Dex run by settling ownership and release intent, isolating its branch and worktree, loading repository commands and merge procedure, and confirming GitHub publication.
---

# Start

Prepare the run before any dispatch: owned, isolated, commands and merge procedure in hand, GitHub publication checked. Discovery and every later phase work inside what you start here.

## 1. Settle release and ownership

Settle the release answer before mutation. A request that says land or merge means `land`; a request that says hold means `hold`. When it says neither, ask the user once: land on green, or hold for you. Never infer or default the answer.

When the request names a tracker issue, read its assignee. If it is assigned to an account other than the one you operate as, stop and report that. Otherwise assign it to your own account. Assignment is the human-visible signal, never the lock: labels and comments are ordinary writes on which two tasks can both succeed. The atomic claim is the create-only remote branch push below, and deleting that branch after merge releases it. The PR that delivers the issue closes it. An issue-driven run embeds the issue number in its slug, so one issue maps to one branch. An existing branch for the work means it is already claimed: stop and report. Name the slug from the request's own words, since discovery has not run yet. Continue an existing run only when I point you at its branch. You are through this step once the work is yours, or you have stopped the run and reported why.

## 2. Isolate

First sweep finished work. A `.bottega/run/` entry or worktree whose PR has merged is done, so delete its run directory, worktree, and branches, local and remote. Then work from inside a worktree on branch `bottega/<slug>`. When the runtime's worktree support is available, create and enter the worktree through it. Otherwise use `git worktree add` and change directory into it. Every command for the rest of the run runs from inside the worktree, so my checkout stays untouched and the run's changes reach main only through the PR. Continuing an existing run, recreate the worktree from its branch. Creating a new branch, push it upstream immediately as a create-only update:

```
git push -u origin bottega/<slug> --force-with-lease=refs/heads/bottega/<slug>:
```

The empty expected value means the remote ref must not exist, so exactly one creation wins. A rejected push means another task owns the branch: stop and report. You are through this step once your working directory is the worktree and its branch is upstream.

## 3. Write the owner file

Write the current Codex task id to `.bottega/run/<slug>/owner` before the run's first dispatch so another task can identify the owner. When the runtime does not expose an id, generate a unique ownership token and report it in the conversation. Write the release answer the start settled, `land` or `hold`, to `.bottega/run/<slug>/release`. Close reads that file before the PR opens. Resuming in a later task, rewrite the owner file before dispatching anything. Write the release file too when the run predates it, and ask me when no answer was ever settled. Both files are set once the owner file identifies this task and the release file carries the run's answer.

## 4. Read the commands and merge procedure

Read the project's commands (format, lint, typecheck, test, build, run) from its agent map, `AGENTS.md` or `CLAUDE.md`. When both exist, follow the repository's precedence instead of assuming they are synchronized. The map is the commands' one home: a brief quotes them from it, and never defines them elsewhere. Discover a missing or broken command once, and write it back to the map as part of the run's diff. The same rule covers any operating fact a worker had to dig for: how the app boots from a worktree, seed data, migration steps. Read every command the run will brief from the map before you move on.

Read the repository's documented pull-request and merge procedure from the same map and the authoritative file it routes to. Record whether opening an eligible non-draft PR enters a merge queue, the opener must arm GitHub auto-merge, or another repository-owned mechanism lands it; how `hold` blocks that mechanism; and what state proves the PR is queued, held, or waiting. Do not infer a procedure from available GitHub buttons or from another repository. If the map does not settle it, report the gap now because close cannot safely choose a merge action later.

## 5. Confirm GitHub publication

Confirm `gh auth status` and that the run can read its target repository and base branch. Missing access or an unavailable GitHub CLI: tell me now and continue, recording the publication gap. You are through this step once publication is ready, or I know what is wrong with it.
