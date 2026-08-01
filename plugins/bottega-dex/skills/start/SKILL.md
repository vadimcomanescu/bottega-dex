---
name: start
description: Prepare a Bottega Dex run by settling ownership and release intent, isolating its branch and worktree, loading repository commands and the complete landing and disarm procedure, and confirming GitHub publication.
---

# Start

Prepare the run before any dispatch: owned, isolated, commands and landing procedure in hand, GitHub publication checked. Discovery and every later phase work inside what you start here.

## 1. Settle release and ownership

Settle the release answer before mutation. A request that says land or merge means `land`; a request that says hold means `hold`. When it says neither, ask the user once: land on green, or hold for you. Never infer or default the answer.

Name the slug from the request's own words, since discovery has not run yet. When the request names a tracker issue, read the issue-tracker owner routed by the agent map when that route exists. Follow its claim procedure without changing the user's checkout. When the claim creates or names a branch, reserve that claim from the isolated worktree in the next step and use the claimed branch for this run. When the claim uses only tracker state, complete it now. When no claim procedure exists, read the assignee. If it is assigned to another account, stop and report that. Otherwise assign it to your own account and use `bottega/<slug>`. Assignment is the human-visible signal, not the lock. Labels and comments are ordinary writes on which two tasks can both succeed. The PR that delivers the issue closes it. An existing branch for the work means it is already claimed unless the tracker owner says otherwise. Continue an existing run only when I point you at its branch. You are through this step once the claim method and run branch are settled, or you have stopped the run and reported why.

## 2. Isolate

First sweep finished work. A `.bottega/run/` entry or worktree whose PR has merged is done, so delete its run directory, worktree, and branches, local and remote. Then work from inside a worktree on the tracker owner's claimed branch, or `bottega/<slug>` when the run has no tracker-owned branch. When the runtime's worktree support is available, create and enter the worktree through it. Otherwise use `git worktree add` and change directory into it. Every command for the rest of the run runs from inside the worktree, so my checkout stays untouched and the run's changes reach main only through the PR. Continuing an existing run, recreate the worktree from its branch. When the tracker procedure already created the branch remotely, do not create or rename it again. Otherwise push the new branch upstream immediately as a create-only update, substituting the run branch for `<branch>`:

```
git push -u origin <branch> --force-with-lease=refs/heads/<branch>:
```

The empty expected value means the remote ref must not exist, so exactly one creation wins. A rejected push means another task owns the branch: stop and report. After the push wins a tracker branch claim, complete any assignment or other human-visible signal its owner requires. Preserve the tracker owner's force-push rule. When that rule conflicts with this create-only update and the tracker owner does not settle the exception, stop and report the conflict instead of overriding it. You are through this step once your working directory is the worktree, its branch is upstream, and its claim signals are complete.

## 3. Write the owner file

Write the current Codex task id to `.bottega/run/<slug>/owner` before the run's first dispatch so another task can identify the owner. When the runtime does not expose an id, generate a unique ownership token and report it in the conversation. Write the release answer the start settled, `land` or `hold`, to `.bottega/run/<slug>/release`. Close reads that file before the PR opens. Resuming in a later task, rewrite the owner file before dispatching anything. Write the release file too when the run predates it, and ask me when no answer was ever settled. Both files are set once the owner file identifies this task and the release file carries the run's answer.

## 4. Read the commands and landing procedure

Read the project's commands (format, lint, typecheck, test, build, run) from its agent map, `AGENTS.md` or `CLAUDE.md`. When both exist, follow the repository's precedence instead of assuming they are synchronized. When no map or command owner exists, discover the commands from the repository, verify them, and add the missing owner or route to the run's diff. The map is the commands' one home: a brief quotes them from it, and never defines them elsewhere. Discover a missing or broken command once, and write it back to the map as part of the run's diff. The same rule covers any operating fact a worker had to dig for: how the app boots from a worktree, seed data, migration steps. Read every command the run will brief from the map before you move on.

The landing procedure is one of those project-owned facts, so read it beside the commands from the same map and the authoritative file it routes to. Capture for Close: the brake that keeps a PR out of landing, whether the repository enforces that brake, what arms landing (the opener, a queue that takes eligible non-draft PRs, or a repository-owned mechanism requiring no opener action), and the deciding check or queue signal. For every mechanism that can land the PR, also capture the exact disarm or withdrawal action used when hold enforcement cannot be proved and the readback that proves the PR terminally ineligible for that mechanism. This includes disabling a GitHub auto-merge arm when present, withdrawing a queue or repository-owned enrollment, and making the PR draft only when the project names draft as its safe withdrawal state. Do not infer any action or proof from available GitHub buttons or another repository. If any applicable arm, disarm, withdrawal, or terminal-ineligibility proof is missing or ambiguous, report it now and mark Close blocked: Close must not guess how a PR lands or how to stop it from landing.

## 5. Confirm GitHub publication

Confirm `gh auth status` and that the run can read its target repository and base branch. Missing access or an unavailable GitHub CLI: tell me now and continue, recording the publication gap. You are through this step once publication is ready, or I know what is wrong with it.
