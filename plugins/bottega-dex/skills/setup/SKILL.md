---
name: setup
description: Reconcile a machine and repository with Bottega Dex by finding its existing maps and owners, filling only actual gaps, and proposing GitHub conventions and labels for approval. Use only when the user explicitly invokes Bottega Dex setup for a repository.
---

# Setup

Reconcile a machine and repository with Bottega Dex without replacing the repository's own documentation architecture. This procedure is safe to rerun. Configure Codex and the Claude CLI that carries cross-family reads, then make the existing agent map route to the repository's issue-tracker and domain owners. Read [architect](../architect/SKILL.md) before you start the repository work.

Do not install tools, edit files, change repository settings, or mutate GitHub before showing the exact change and receiving the user's approval.

## 1. Configure the harness

Check the Codex-native harness. Anything missing, report it rather than installing it silently.

- **Requirements.** Verify `git`, Node.js 24 or later, `gh`, and `trufflehog`. The review engine's secret preflight requires the TruffleHog binary and never installs it itself.
- **Skill discovery.** Run `codex plugin list --json` and confirm `bottega-dex@bottega-dex` is installed and enabled. Report its installed version. When it is absent, walk me through these commands rather than symlinking anything:

  ```bash
  codex plugin marketplace add vadimcomanescu/bottega-dex
  codex plugin add bottega-dex@bottega-dex
  ```

  Do not claim the installed version is current by comparing it with files from the same installed plugin. Checking for an update requires a separately approved marketplace refresh.
- **Claude CLI.** Verify `claude` is installed and logged in with `claude auth status`. The design cross-read and one review engine go through it. Do not make a paid model call only to inspect authentication.
- **GitHub CLI.** Run `gh auth status`. Missing issue, label, ruleset, or repository-setting permissions are findings, not reasons to broaden access silently.

## 2. Find the existing owners

Resolve symlinks before reading. Find the repository's equivalent owners by what they govern, not by a prescribed path. An existing map route or owner doc wins wherever it lives, including under `docs/internal/` rather than `docs/agents/`. Finish with a named owner or `nowhere` for every item below.

- The canonical agent map: root `AGENTS.md` and `CLAUDE.md`, their symlink state, the exact `<!-- bottega-dex:setup v1 begin -->` or `<!-- bottega-dex:setup v2 begin -->` block when either exists, and the map's routes. This is separate from `CONTEXT-MAP.md`, which maps bounded contexts and is not an agent map.
- The issue-tracker owner: GitHub remote, issue and label permissions, tracker conventions, labels, and any repository-declared triage capability or triage owner.
- The domain owner: the doc a consumer reads for domain vocabulary, relevant contexts, and decisions, including declared root or system and context-local ADR homes. It is meaningful even where no `CONTEXT.md`, `CONTEXT-MAP.md`, or `docs/adr/` exists. Read only the contexts and decisions relevant to the repository or work at hand.
- The project's commands: test, lint, format, typecheck, build, and run, whether the canonical map states them, and `.gitignore`.
- The end-to-end suite where the repository ships a user-facing surface: the flows it drives and how its runner names a subset.
- The default branch's merge governance: rulesets or branch protection, auto-merge, and automation that merges or arms auto-merge.
- Any index the repository declares for its own agent skills.

## 3. Settle only missing choices

Present the findings, then ask one question at a time only where the repository cannot settle it.

- **Canonical map.** When both root files are independent, ask which is canonical. When one symlinks the other, its target is the map. When neither exists, default to `AGENTS.md` and let me veto it. Create the other filename as a symlink only when it has no material of its own.
- **Tracker location.** Ask only when no GitHub remote settles it. One GitHub remote means GitHub Issues.
- **Context count and area labels.** Ask only when the code suggests multiple bounded contexts whose names the tree does not settle. A single-context repository needs no area labels.
- **Claim and force-push rules.** Propose a create-only branch claim only when the repository says multiple agents take tracker work and no concurrency-safe claim exists. Preserve an existing force-push rule. When it conflicts with the create-only claim, put the conflict to me as an approval decision.

## 4. Propose actual gaps

Show the exact changes for approval. A conforming repository receives no file or GitHub changes. Do not add a marker, an agent-skills heading, or a second table merely to identify setup.

- **Routes and managed text.** First reconcile an existing v1 block as setup-owned routes, not as a second owner. Replace it with one `<!-- bottega-dex:setup v2 begin -->` and `<!-- bottega-dex:setup v2 end -->` block when setup-owned text remains, or preserve every needed route in the repository's existing map and remove the block. Never leave both versions. Keep every existing equivalent map route and owner doc. Only when a missing route needs setup-owned text, create or update the one v2 block in place. It routes to the existing issue-tracker and domain owners without restating them, and records the non-map symlink. When no equivalent owner exists, use `docs/agents/issue-tracker.md` and `docs/agents/domain.md` as the fallback owners. The tracker owner records the GitHub remote, concrete read, assign, comment, and close operations, any approved branch claim, and a pointer to the repository landing procedure without copying it. The domain owner tells consumers where vocabulary, relevant contexts, and declared root or system and context-local ADRs live. It creates no glossary, context map, or ADR scaffold. The glossary vocabulary governs new output, and a relevant ADR conflict is surfaced for a decision.
- **Migrations.** When the reading in step 2 finds real domain terms outside the vocabulary home declared by the domain owner, propose moving them to that home. A new Bottega Dex-owned layout uses the relevant `CONTEXT.md`. When that reading finds a qualifying decision outside the ADR home declared by the domain owner, propose moving it there. Update every reference in the same approved change. Existing formats win, and a new artifact has material to contain.
- **Commands.** Add a commands section to the canonical map only when it has no equivalent owner: test, lint, format, typecheck, build, and run. Verify every available command from a disposable worktree, never the user's checkout, before you write it. For a category the project does not provide, state that it is not provided instead of inventing a command. When a discovered command fails in the fresh worktree, report its exact failure as a finding and leave it unwritten rather than calling it unavailable. For an available run command, start it, wait for readiness, stop it, and confirm its processes and ports are released. Remove the disposable worktree after recording the results. The map is the commands' one home.
- **Map symlink.** When only one root map exists, create the other as its symlink. When both independent maps have material, bring their merge to me before writing.
- **End-to-end coverage.** When a product flow has no named executable check, draft the missing spec in the suite's own conventions for my approval. Where the suite cannot run, file one issue naming the uncovered flows. Do not write a duplicate prose inventory.
- **Issue tracker.** Reuse an equivalent tracker owner and its existing claim protocol. Bottega Dex routes only to GitHub and does not import a tracker or triage engine. Add a triage mapping only when the repository declares or surfaces a compatible triage capability, reusing its equivalent owner. Without that capability, omit the mapping and route. Where multiple agents take tracker work, no concurrency-safe claim exists, and I approve the claim, document this exact create-only branch claim:

  ```bash
  git push -u origin <branch> --force-with-lease=refs/heads/<branch>:
  ```

  The empty expected value requires the ref not to exist, so exactly one creation wins. A rejected push means another agent owns the branch. Assignment is the human-visible signal, not the lock, because concurrent assignment, label, and comment writes can all succeed. The claim releases when the branch is deleted on merge.
- **Merge governance.** Reuse the repository's documented procedure. Where it has none, use the [merge-governance reference](references/merge-governance.md) to inspect the available queue and form an exact proposal. Wait for my approval before changing repository files, settings, labels, or workflows.
- **Ignore and labels.** Add `.bottega/` to `.gitignore` only when missing. Create approved `area:*` labels and `hold` with GitHub get-or-create, then read them back. Existing labels stay as they are.

## 5. Apply

Apply only what I approved, exactly as shown. Finish when every proposed edit is applied or declined. A declined edit remains a reported gap for the next reconciliation.

## 6. Report

Report what changed, what I declined, and what only I can fix: missing GitHub issue or label permissions, no discoverable project gate, an app that cannot boot from a fresh worktree, or broken links in a repository-declared agent-skill index.

## Idempotency

Read state from the repository. A setup-owned route becomes repository-owned once written, so a rerun validates it and proposes a diff rather than overwriting it.
