---
name: setup
description: Reconcile a machine and repository with Bottega Dex once, covering Codex plugin discovery, Claude CLI authentication, the repository's agent map and commands, domain documentation, tracker conventions, merge governance, and GitHub labels. Use only when the user explicitly invokes Bottega Dex setup for a repository.
---

# Setup

Reconcile a machine and a repo with Bottega Dex, once. Configure Codex and the Claude CLI that carries the run's cross-family reads, then bring the project to the shape [architect](../architect/SKILL.md) defines: its domain docs and its documentation architecture. Read that skill before you start the repo work.

Do not install tools, edit files, change repository settings, or mutate GitHub before showing the exact change and receiving the user's approval.

## 1. Configure the harness

Check the Codex-native harness. Anything missing, report it rather than installing it silently.

- **Requirements.** Verify `git`, Node.js 24 or later, and `gh`.
- **Skill discovery.** Run `codex plugin list --json` and confirm `bottega-dex@bottega-dex` is installed and enabled. Report its installed version. When it is absent, walk me through the marketplace and plugin install commands from the README rather than symlinking anything. Do not claim the installed version is current by comparing it with files from the same installed plugin. Checking for an update requires a separately approved marketplace refresh.
- **Claude CLI.** Verify `claude` is installed and logged in (`claude auth status`). The design cross-read and one review engine go through it. Do not make a paid model call only to inspect authentication.
- **GitHub CLI.** Run `gh auth status`. Missing issue, label, ruleset, or repository-setting permissions are findings, not reasons to broaden access silently.

## 2. Discover what the repo already has

Resolve symlinks first, then read. Never search by a fixed list of filenames. For each part of the shape below, find where it lives today, whatever it is called and wherever it sits. You are done when every part has either the home you located or a stated "nowhere":

- The map: the root agent docs, whether one symlinks the other, and any existing `bottega-dex:setup` managed block.
- Domain terms: whatever currently defines the repo's vocabulary, in any file or doc section.
- Decisions: wherever design decisions are recorded today, including prose sections of README-class docs.
- Tracker conventions, the GitHub remote, its labels, and whether `gh` is authenticated with issue and label permissions.
- The project's commands (test, lint, format, typecheck, build, run), whether the canonical map states them, and `.gitignore`.
- The end-to-end suite where the repo ships a user-facing surface: which flows it drives, and how a subset of them is named to its runner.
- The default branch's merge governance: rulesets or branch protection, the auto-merge setting, and any automation that merges or arms auto-merge.
- Any index the repo declares for its own agent skills.

## 3. Decide, one at a time

Present the findings, then walk only the decisions the repo cannot answer, one per exchange, waiting for each answer:

- **Canonical map**: which of `AGENTS.md` and `CLAUDE.md` is the map. Ask only when both exist as independent files. When one symlinks the other, its target is the map. When neither exists, default to `AGENTS.md` and present the choice so I can veto it in one read. The non-map filename only ever exists as a symlink to the map, so both harnesses load the one copy.
- **Tracker location**, only when no remote settles it. A single GitHub remote settles it (GitHub Issues on that remote).
- **Context count**, when the code suggests more than one bounded context.
- **Area labels**, only when the repo has more than one bounded context whose names the tree does not settle. A single-context repo has none.

## 4. Propose the edits

For every gap between the found state and the shape, show me the exact edit that closes it. Move content that already exists rather than inventing any, so you never create an empty glossary, ADR scaffold, or owner doc.

- **The managed block** in the canonical map, delimited by versioned markers (`<!-- bottega-dex:setup v1 begin -->` and `<!-- bottega-dex:setup v1 end -->`) so a rerun updates only its own block. It routes to each fact's home and never restates it, and it records the symlink when the non-map file links the map.
- **A commands section** in the canonical map when the map does not already state them: the project's test, lint, format, typecheck, build, and run commands. Verify every available command from a disposable worktree, never the user's checkout, before you write it. For a category the project does not provide, state that it is not provided instead of inventing a command. When a discovered command fails in the fresh worktree, report its exact failure as a finding and leave it unwritten rather than calling it unavailable. For an available run command: start it, watch for readiness, stop it, and confirm its processes and ports are released. Remove the disposable worktree after recording the results. The map is the commands' one home, so runs read them from it and fix them there when one breaks.
- **The map symlink** when only one of `CLAUDE.md` and `AGENTS.md` exists: create the other as a symlink to it.
- **Migrations.** Move discovered term definitions into the relevant `CONTEXT.md`. Move discovered decision records that meet the ADR bar into `docs/adr/`. A committed research, findings, or reading note is not a record at all, so the decision it reached becomes one ADR paragraph and the note is deleted. Two files claiming the same authority merge into one home. Every reference updates in the same change. Formats follow [architect](../architect/SKILL.md) and its references. When a source and its target both hold material, put the merge to me before you write.
- **The missing end-to-end specs** when a flow the product cannot ship broken has no check the suite runs and names on its own (a tag, or whatever naming its runner offers). Draft them in the suite's own conventions for me to correct before they land. Where the harness cannot run that suite, file one issue naming the uncovered flows instead. Runs scope QA from that named set, so the suite is where these flows are named and you write no prose inventory of them.
- **Owner docs** for tracker conventions, always reusing an existing equivalent home instead of creating a second one. When no equivalent exists, propose `docs/agents/issue-tracker.md` as the first owner. Where the repo takes tracker work with more than one agent, the conventions include the claim: an issue is claimed by creating its branch on origin with a create-only push, `git push -u origin <branch> --force-with-lease=refs/heads/<branch>:`, whose empty expected value means the ref must not exist. Exactly one creation wins, and the loser's push is rejected. Ref creation is the one operation GitHub performs atomically. Assigning, labelling, and commenting are plain writes: two agents that read the same instant both succeed, so assignment is proposed as the human-visible signal and never the lock. The claim releases when the branch is deleted on merge. Where you find a claim label or claim-comment protocol, show an edit that removes it.
- **A merge-governance proposal** when the default branch has none. A merge queue is the preferred shape: it tests each PR against the default branch it will actually land on, and it makes the `hold` brake a queue condition, so a held PR keeps its green checks while the queue's summary names the hold, and red keeps one meaning. GitHub's own queue needs an organization-owned public repository or GitHub Enterprise Cloud (https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue). Where the plan lacks it, Mergify's queue is free for up to five users on private repositories. It reads the ruleset's required checks as queue conditions, so the ruleset stays the one home of what green means and the queue config file never restates the gate list. Either way the ruleset carries the project's gates as required checks, squash merges, no bypass actors, and zero required approvals while the owner authors the PRs, because an author cannot approve their own PR. The strict up-to-date requirement stays off, since the queue itself tests against the moved base. Changing a required check is ordered. To add one, land the workflow on the default branch before the ruleset requires it. To remove one, stop the live ruleset requiring it before you delete the reporting workflow. Either order inverted deadlocks every open PR on an unreported context. Where no queue is adoptable at all, the fallback stands: auto-merge allowed, armed by the account that opens the PR in the same breath as `gh pr create`, never a workflow holding a long-lived token. Two things rule out arming from a workflow: a merge made with `GITHUB_TOKEN` starts no workflow run on the default branch (https://docs.github.com/en/actions/concepts/security/github_token), and a token the owner has to mint by hand leaves the arming step skipping green until someone notices. In the fallback the `hold` brake is a required check that fails while the label is present, its workflow triggered on `pull_request` types `opened, reopened, synchronize, labeled, unlabeled`. The default trigger set omits the last two, and without them removing the label never re-runs the check. How a green PR lands is then the repository's own decision, written in its own documented procedure, which runs read from its map, so propose the shape and keep no second copy of the procedure. Where you find automation that merges a PR directly, show an edit that removes it.
- **A `.bottega/` entry in `.gitignore`** when missing.
- **The approved `area:*` labels, plus the `hold` label a held PR carries**, each created with `gh` as get-or-create and read back. The `area:*` labels organize the backlog for people, and the method never reads them. Never rename or delete an existing label.

## 5. Apply

Apply only what was approved, exactly as shown, and finish when every proposed edit is either applied or explicitly declined. A declined edit leaves its gap open on purpose, so record it in the report as remaining work and expect a rerun to propose it again.

## 6. Report

Report what you wrote, what was declined, and the findings that remain mine to fix. Distinguish local verification from remote repository state.

## Findings (the genuinely un-writable)

Report these and leave the fix to me:

- `gh` lacks issue or label permissions on the remote.
- No project gate command is discoverable. Report that and never invent one.
- The app does not boot from a fresh worktree. QA drives the shipped interface from the run's worktree, so every run inherits this gap until the project fixes it.
- An index the repo declares for its own agent skills has broken links. Never create such an index or rewrite its shape.

## Leaves alone

Leave CI, the project's own hooks, gate design, technology skills, MCP config, and triage state machines exactly as you found them.

## Idempotency

Read your state from the repository. A doc setup created becomes repo-owned, so a rerun validates it and proposes a diff rather than overwriting it. A rerun on a conforming repo makes zero file and zero GitHub changes, and says so.
