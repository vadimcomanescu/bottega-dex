---
name: run
description: Take a task, bug, or issue to a reviewed, evidence-backed pull request with Bottega Dex. Invoke only when the user asks for a Bottega Dex run.
---

# Run

Take one request to a pull request. The current Codex task is the orchestrator and owns scope, design, routing, integration, review arbitration, and delivery. Run it on GPT-5.6 at Ultra, using the Sol route label when the client exposes it. If the client visibly shows a different route, stop and tell the user.

Use native subagents. Never launch another Codex process. Resolve this skill's directory once and pass absolute paths to worker prompts and schemas. A worker receives only its prompt, task brief, repository context, owned paths, verifier, and expected result.

Start every reviewer and panelist without inherited conversation history when supported. Builders receive only the turns needed for their brief. Request the route in each brief. If the native control does not expose model selection or metadata, record `host-routed` and do not claim an exact model.

## Routing

| Work | Route |
| --- | --- |
| Orchestration and final decisions | current GPT-5.6 Sol task, Ultra |
| Substantial mechanical or read-heavy lane | Luna high when exposed, otherwise GPT-5.6 Terra high |
| Building, review, and QA | GPT-5.6 Sol high |
| Independent second-family review and panel roles | Claude Opus through `scripts/claude-exec` |

Keep routine reads, commands, formatting, and small deterministic edits in this task. Delegate only a substantial bounded lane or an independent judgment. Run independent reads in parallel. Use one builder at a time and keep implementation writes sequential in the task worktree. Keep at most four workers live.

Use absolute paths:

```text
<plugin-root>/scripts/claude-exec --role <role> --cwd <worktree> --brief <brief.md> --out <report.json> --events <envelope.json> [--head <sha> --tree <sha>] --schema <schema.json>
```

The bracketed target pair is required for reviewer calls and omitted for panel calls.

## Flow

1. **Isolate and understand.** Read repository instructions, relevant code, history, product documents, remotes, and current git state. For edits, use one task branch and worktree so the user's checkout stays untouched. Record the delivery remote and GitHub `owner/repo` for the base branch. When remotes differ, never trust the CLI default repository. Pass `--repo <owner/repo>` to issue and pull request commands. Discover the repository's focused checks, decisive full gate, build, and run commands. For a substantial independent inventory, give a native worker `references/agents/mechanic.md`, an exact output, and a verifier. Check `claude --version`, `claude auth status`, and the adapter before work that depends on the mandatory cross-family review.

2. **Specify.** State the intended behavior, acceptance criteria, definition of done, and material defaults in the conversation. Ask only about choices that change scope, user-visible behavior, or an expensive decision. Wait for approval unless the user explicitly requested autonomous execution. Approval is always required before deploys, money movement, destructive actions, or shared and production data changes.

3. **Plan.** Follow `references/codebase-design.md` and the repository's own vocabulary. Plan vertical slices with a clear interface and verifier. When a public contract, persisted data shape, dependency choice, or module boundary is expensive to reverse and repository precedent does not settle it, use `references/panel.md`.

4. **Build.** Give a native builder `references/agents/builder.md`, one bounded slice, owned paths, acceptance criteria, and exact checks. Answer missing decisions through follow-up on the same agent. Integrate only verified work. Run focused checks while building and the repository's decisive full gate on the integrated head. Do not weaken tests or hide failures.

5. **Review.** Freeze the complete integrated diff by base, head, and tree SHA after the decisive gate passes. Round one always starts two cold reviewers in parallel against separate disposable checkouts of the same frozen target: one native Codex reviewer and one Claude reviewer through `scripts/claude-exec`. Give both the same task contract, repository instructions, changed-test justifications from builder reports, `references/agents/reviewer.md`, and `references/report.schema.json`. Neither sees builder reasoning, orchestrator conclusions, candidate findings, or the other report. Accept a report only when its family, round, and target SHAs match the dispatch. Use native model metadata only when exposed; for Claude, retain the adapter envelope and confirm Opus usage. Reproduce and arbitrate every finding with evidence, and reconcile both architecture verdicts against the plan's fixed decisions; missing coverage or unresolved disagreement blocks acceptance. Send a confirmed implementation fix to a builder; a design finding returns to Plan before any code change. After a fix, rerun the decisive gate, freeze the new SHAs, and recheck with one fresh cold reviewer from the family opposite the fixer, scoped to its check IDs and fix range. A changed specification, interface, or design decision invalidates the review: rerun round one on the new complete diff. Round three stops the review; a finding still open after two failed fixes stops that repair; either stop returns the work to redesign.

6. **QA.** After review is clean, give `references/agents/qa.md` the reviewed head and acceptance scenarios. Drive the real artifact. For visible or interactive changes, capture the smallest useful screenshot or recording. For nonvisual changes, use targeted runtime or command evidence. QA reports and never fixes. A failure returns to build, review, and QA.

7. **Deliver.** Update existing documentation only where the change made it false. Open a pull request with the behavior change, material decisions, checks run, both review records, QA evidence, and known limits. Link or close the source issue. Remove temporary worktrees and state after the pull request exists. The merge remains the user's final gate.

Resume from the branch, commits, checks, review reports, and pull request, never from conversational memory. If stopped, preserve useful verified work and report the exact state.
