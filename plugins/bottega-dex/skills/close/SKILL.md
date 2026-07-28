---
name: close
description: Publish a Bottega Dex run after mandatory dual review and QA. Used by maestro to confirm the accepted head, publish evidence, file follow-ups, open the pull request, watch checks, and report its real terminal state.
---

# Close

Take the reviewed, QA-verified head to a PR that lands on sight: open, readable, its checks green, its merge state clean, its deferred work filed. The launch decided the release: the run's recorded answer, `.bottega/run/<slug>/release`, says whether the PR lands on green or holds for the user, and a host repository that arms its own auto-merge may land a green PR while close watches. A run never merges around a red or human gate and never approves its own PR; it arms auto-merge on the PR it opens where the repository's own merging procedure makes arming the opener's act, and what decides whether an armed PR lands stays the repository's required checks and the `hold` label. A requirement only a person can satisfy before the PR is ready ends the run with that action named to the user. Review feedback after the PR opens returns through the bundled [code-review skill](../code-review/SKILL.md) as claimed findings. Fix accepted issues with one or more subagents depending on the size, respecting the repository's implementation methodologies, then review and QA the updated work again.

Run the phases in order; a followup and its evidence must exist before the PR body links them.

## Writing for a reader outside the run

Everything close writes for someone outside the run (the PR body, each followup issue) obeys one rule:

> Write simply and concisely, for a reader who was not in the run. Define every non-standard term where it is used, or link the file, ADR, or issue that defines it. Never use a label the document does not itself define. When you cite a prior decision, link its record. State what the diff cannot show; cut what the diff already shows.

## 1. Confirm the head

The head accepted by autoreview, the head QA verified, and the head the PR will publish are one SHA. Close has changed no tracked file. A mismatch returns to the run, never patched here.

## 2. Push and mark reviewed

Push the branch and post the `bottega/review` success status on the accepted head, naming the base reviewed by autoreview, before the PR opens, so it arrives already carrying its reviewed marker.

## 3. Publish evidence

Put QA's evidence where the PR can read it, per [references/qa-evidence.md](references/qa-evidence.md).

## 4. File followups

Each review or QA finding classified follow-up, and each item the run deferred, becomes one tracker issue in the project's repo, filed before the PR opens so the body links it. Each issue stands on its own for a reader who was not in the run: what is wrong, where, why it was deferred, and the evidence.

Filing is close's whole part here; the head is already pushed. The rule work below is the run's, done before the head freezes; what the repository has no home for arrives here as an issue. A decision the run made on the user's behalf that is hard to reverse, surprising without context, and the result of a real trade-off gets one ADR in the repository's decision home, one paragraph saying what was decided and why, in the same diff; what an outside reading concluded lands in that paragraph with its URL, never as a committed research or findings file. A failure the run diagnosed and fixed that a future run could repeat also gets a record in `docs/lessons/` (what happened, the rule, and where the rule is enforced), and the run puts the rule where the repository enforces it best: a deterministic invariant becomes a check in the project's tooling, failing with the violated invariant and the repair; contextual judgment becomes a rule in the repository's review doctrine near the code it governs; with neither home, the followup issue carries it, and a recurring gap is raised there for the owner to decide its home. A new rule usually has existing violations in the tree: fix the ones in the run's scope and file one issue for the rest.

## 5. Open the PR

Compose the body to a file and open it with `gh pr create -F <file>`, never inline. First read the release answer from `.bottega/run/<slug>/release` itself, never from memory of it: `land` and `hold` are the only two values, and a file that is missing or carries anything else stops the run here, reported to the user: the answer is never inferred and never defaulted, and a lost answer read as land would open an unlabeled PR into whatever arms auto-merge. When the answer is hold, make the label exist first (`gh label create hold --description "Blocks the merge until a person removes it" || true`, then confirm with `gh label list`), and add `--label hold` on the same create call, so the PR opens carrying the label; a repo that refuses the label stops the run before PR creation, reported to the user. After the labeled PR exists and before arming auto-merge, poll its required checks for up to five minutes, at intervals no shorter than ten seconds, until GitHub reports the hold check; a pending or absent result inside that window means wait, not missing enforcement. Confirm the reported check is red because the `hold` label is present. If no enforcing required check appears within the window, leave that PR labeled and unarmed, stop, and report the missing enforcement to the user.

Then arm the PR, with the same credentials that opened it, where the repository's own merging procedure (its agent map routes to it) makes arming the opener's act: `gh pr merge --auto --squash <PR-URL>` right after the create call, on both release answers, since an armed held PR blocks on the hold check just confirmed. Where the repository arms its own instead, arm nothing and say so in the report. A refusal stops the run here, except the one refusal that is the arm's own outcome: a PR with nothing left to wait on cannot be armed, and `gh` merges it on the spot in that same call, which is merge on green and not a merge around a red gate; where `gh` reports that refusal instead of merging, `gh pr merge --squash <PR-URL>` finishes it.

On an issue-born run, close the issue with the PR through a closing keyword. The body carries, written for that outside reader:

- what changed and why;
- the original request, discovery's settled scope, and the decisions that constrained orchestration;
- the evidence proving each requested outcome;
- every decision made on the user's behalf, the one most likely to draw a different answer first;
- who built and who reviewed: models, rounds, findings, verdicts, refutations;
- the orchestrator's architecture acceptance;
- the QA evidence, embedded or linked per the evidence reference, and its limits: the scenarios returned `NOT VERIFIED` and any claimed behavior no evidence covers.

A Followups section links the issues just filed and nothing else. Keep tool, model, and company attribution badges and footers out.

## 6. Watch and report

After the PR opens, watch every check to completion as a tracked terminal command (`gh pr checks <PR> --watch`), excluding the `bottega/review` status you posted, your own marker, not a project check, and on a hold run one more, recognized by the label rather than by a name the run never learns: on a PR carrying the `hold` label, the red required check whose failure names that label is the brake working, never a failure to repair; any other red on a held PR still sorts below. Distinguish a PR with no checks from one with a failing check. Read the merge state with it (`gh pr view <PR> --json state,mergeable,mergeStateStatus`) when the PR opens and again whenever the watch ends. A `state` of `MERGED` means the host repository's auto-merge landed the PR during the watch; go straight to the report below. `mergeable` returns only `MERGEABLE`, `CONFLICTING`, or `UNKNOWN`; `UNKNOWN` means GitHub has not finished computing it, so ask again rather than act on it. `mergeStateStatus` carries what `mergeable` cannot show: `CLEAN` is ready to merge, `BEHIND` is behind the base, `BLOCKED` is branch protection refusing, so read which requirement is unmet and sort it below.

Sort what the watch and the merge state return by remedy, not by cause. The first question is always whether a change to the diff can clear it:

- Run work: a code change clears it. Fix it with one or more subagents depending on the size, respecting the repository's implementation methodologies. For `CONFLICTING` and `BEHIND`, merge the base branch into the run branch and resolve it. Push the repaired, re-reviewed, and re-verified head, publish its fresh QA evidence, update the PR body's evidence links, then watch its checks and merge state again.
- Waiting on a person: no code change clears it and someone's action does. A required human review, a label the project's rules ask a reviewer to add, any other approval. A check the diff turned red belongs here whenever only a person can clear it. Report to the user what is needed and on which PR, and leave the PR open and unmerged for them; adding the label or the approval yourself defeats a check that exists to put a person in the loop, and removing a `hold` label is the same act in reverse: the user lands a held PR, never the run.
- Infrastructure: neither clears it, because the failure is outside the diff's control. Report it with its evidence, never guessed at.

A PR whose `state` is `MERGED` when the watch ends is the decided default, not an anomaly: report it merged, with the head SHA phase 1 confirmed and the evidence links, and sweep the run's working state (`.bottega/run/<slug>/`, the worktree, the run branch) in this same session, working from the project's main checkout, never from inside the worktree: a worktree cannot remove itself, and its branch cannot be deleted while a worktree holds it. With the PR still open, its checks green, and the merge state `CLEAN`, report it ready: the PR, the head SHA phase 1 confirmed, the evidence links, and what lands it, read rather than guessed: `gh pr view <PR> --json autoMergeRequest` says what lands it: armed means green lands it, and null where phase 5 armed it means the arm did not take, so re-arm and report a second failure as the run's own, never as work left to the user. A held PR never reaches that state while the label is present: its hold check is red and its merge state `BLOCKED` on purpose, so with every other check green report it held instead of ready, with the same PR, head SHA, and evidence links, and that the user removing the `hold` label is what lands it. Close ends with the PR merged and the state swept, with the PR open and ready or held, or with the PR open and the human action it waits on named to the user. An open PR's working state stands until the merge: a session that observes the merge deletes it, and `start` sweeps the state of any run whose PR has merged.
