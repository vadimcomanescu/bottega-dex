---
name: close
description: Publish a Bottega Dex run after mandatory dual whole-diff review and any QA required for a user-facing surface or product behavior change. Used by maestro to confirm the accepted head, publish evidence, file follow-ups, open the pull request, watch checks, and report its real terminal state.
---

# Close

Take the reviewed head to a PR that lands through the repository's documented merge procedure: open, readable, its checks green, its deferred work filed. When QA ran, take the QA-verified version of that same head. The launch decided the release: the run's recorded answer, `.bottega/run/<slug>/release`, says whether the PR lands on green or holds for the user.

The repository owns how green work lands. In a merge-queue repository, opening an eligible non-draft PR is the arm and close runs no merge command; the queue tests the work against the base it will actually land on. A `hold` label is then a queue condition, so a held PR stays out of the queue while its project checks remain green. In the documented fallback, the opener arms GitHub auto-merge and a required hold check turns red while the label is present. Follow the procedure start read from the repository's agent map, never choose between these paths from memory, and never approve or directly merge the PR.

A requirement only a person can satisfy before the PR is ready ends the run with that action named to the user. Review feedback after the PR opens returns through the bundled [code-review skill](../code-review/SKILL.md) as claimed findings. Fix accepted issues with one or more subagents depending on the size, respecting the repository's implementation methodologies, then review the updated work again. When QA ran, rerun the affected QA scenarios on the updated head.

Run the phases in order; a followup and its evidence must exist before the PR body links them.

## Writing for a reader outside the run

Everything close writes for someone outside the run (the PR body, each followup issue) obeys one rule:

> Write simply and concisely, for a reader who was not in the run. Define every non-standard term where it is used, or link the file, ADR, or issue that defines it. Never use a label the document does not itself define. When you cite a prior decision, link its record. State what the diff cannot show; cut what the diff already shows.

## 1. Confirm the head

The head accepted by autoreview and the head the PR will publish are one SHA. When QA ran, the head QA verified is that same SHA. Close has changed no tracked file. A mismatch returns to the run, never patched here.

## 2. Push and mark reviewed

Push the branch. Post the `bottega/review` success status on the accepted head, naming the base reviewed by autoreview, before the PR opens, so it arrives already carrying its reviewed marker.

## 3. Publish evidence

When QA ran, put its evidence where the PR can read it, per [references/qa-evidence.md](references/qa-evidence.md).

## 4. File followups

Each review or QA finding classified follow-up, and each item the run deferred, becomes one tracker issue in the project's repo, filed before the PR opens so the body links it. Each issue stands on its own for a reader who was not in the run: what is wrong, where, why it was deferred, and the evidence.

Filing is close's whole part here; the head is already pushed. The rule work below is the run's, done before the head freezes; what the repository has no home for arrives here as an issue. A decision the run made on the user's behalf that is hard to reverse, surprising without context, and the result of a real trade-off gets one ADR in the repository's decision home, one paragraph saying what was decided and why, in the same diff; what an outside reading concluded lands in that paragraph with its URL, never as a committed research or findings file. A failure the run diagnosed and fixed that a future run could repeat also gets a record in `docs/lessons/` (what happened, the rule, and where the rule is enforced), and the run puts the rule where the repository enforces it best: a deterministic invariant becomes a check in the project's tooling, failing with the violated invariant and the repair; contextual judgment becomes a rule in the repository's review doctrine near the code it governs; with neither home, the followup issue carries it, and a recurring gap is raised there for the owner to decide its home. A new rule usually has existing violations in the tree: fix the ones in the run's scope and file one issue for the rest.

## 5. Open the PR

Compose the body to a file and open it with `gh pr create -F <file>`, never inline. First read the release answer from `.bottega/run/<slug>/release` itself, never from memory of it. `land` and `hold` are the only two values. If the file is missing or carries anything else, stop the run here and report it to the user. Read the repository's merge procedure again from its agent map and authoritative procedure before creating the PR. It must say whether an eligible non-draft PR enters a queue, the opener arms GitHub auto-merge, or another named mechanism owns landing. A missing or ambiguous procedure stops the run before PR creation.

When the answer is hold, make the label exist first (`gh label create hold --description "Blocks the merge until a person removes it" || true`, then confirm with `gh label list`). Add `--label hold` on the same create call, so the PR never exists unheld. A repo that refuses the label stops the run before PR creation and is reported to the user.

After creation, follow the documented mechanism:

- **Merge queue:** run no merge command. For a land run, confirm the queue's status or summary recognizes the PR as queued or eligible for automatic entry. For a hold run, confirm the queue's status or summary names the unmet `hold` condition and the PR stays out of the queue; for Mergify this is the Mergify summary. Project checks remain ordinary checks and are not expected to turn red. A procedure that promises automatic entry while its summary asks for a manual queue command is broken: leave the PR open, stop, and report the configuration failure instead of queueing it by hand.
- **Opener-armed auto-merge fallback:** run `gh pr merge --auto --squash <PR-URL>` with the same credentials that opened the PR. On a hold run, arm immediately after creation, before polling. If the PR remains open after the arm, confirm `gh pr view <PR> --json autoMergeRequest` is non-null on both land and hold runs; re-arm once when it is null and report a second failure as the run's own. After the arm is present, poll its required checks for up to five minutes, at intervals no shorter than ten seconds, until GitHub reports the hold check; confirm that the hold check is red because the label is present. If no enforcing required check appears within the window, run `gh pr merge --disable-auto <PR-URL>`, confirm with `gh pr view <PR> --json autoMergeRequest` that `autoMergeRequest` is null, then leave the PR labeled and unarmed, stop, and report the missing enforcement. If disabling auto-merge fails or `autoMergeRequest` remains non-null, stop and report that the fail-closed recovery failed; never report the PR as safely held. If the auto-merge command finds nothing left to wait on and the PR lands in that call, accept the resulting merged state; never follow it with a direct merge command.
- **Another repository-owned mechanism:** perform only the opener action its documented procedure assigns, or none when opening the PR is the whole action. Record what owns landing for the report.

On an issue-born run, close the issue with the PR through a closing keyword. The body carries, written for that outside reader:

- what changed and why;
- the original request, discovery's settled scope, and the decisions that constrained orchestration;
- the evidence proving each requested outcome;
- every decision made on the user's behalf, the one most likely to draw a different answer first;
- who built and who reviewed: models, rounds, findings, verdicts, refutations;
- the orchestrator's architecture acceptance;

When QA ran, the body also carries the QA evidence, embedded or linked per the evidence reference, and its limits: the scenarios returned `NOT VERIFIED` and any claimed behavior no evidence covers.

A Followups section links the issues just filed and nothing else. Keep tool, model, and company attribution badges and footers out.

## 6. Watch and report

After the PR opens, watch every project check to completion as a tracked terminal command (`gh pr checks <PR> --watch`), excluding the `bottega/review` status you posted. Project checks validate the change; the hold check and queue summary are merge-control signals handled separately below. Also watch the repository's documented merge mechanism: a queue-owned PR includes the queue status or summary and the speculative updated-base checks it starts; those checks can run on a queue-generated SHA without changing the reviewed PR head. Distinguish a PR with no checks from one with a failing check. Read the merge state with it (`gh pr view <PR> --json state,mergeable,mergeStateStatus`) when the PR opens and again whenever the watch or queue state changes.

On a held queue PR, a neutral or completed queue summary naming `hold` is the brake working and the project checks stay green. On a held fallback PR, the red required check whose failure names `hold` is the brake working. Any other red still sorts below. A `state` of `MERGED` means the documented mechanism landed the PR; go straight to the report below. `mergeable` returns only `MERGEABLE`, `CONFLICTING`, or `UNKNOWN`; `UNKNOWN` means GitHub has not finished computing it, so ask again rather than act on it. Read `mergeStateStatus` in the context of the documented mechanism: `BLOCKED` can be an intentional queue hold, and `BEHIND` alone is not a repair request when a queue is already testing the work against the moved base.

Sort what the watch and the merge state return by remedy, not by cause. The first question is always whether a change to the diff can clear it:

- Run work: a code change clears it. Fix it with one or more subagents depending on the size, respecting the repository's implementation methodologies. Resolve `CONFLICTING`. In an opener-armed fallback, also bring a `BEHIND` branch up to date when the repository requires it; under a queue, let the queue test the speculative updated-base commit and return work only for a real conflict or a queue/check failure attributable to the diff. Push the repaired and re-reviewed head. When QA ran, publish its fresh evidence and update the PR body's evidence links. Then watch its checks and merge state again.
- Waiting on a person: no code change clears it and someone's action does. A required human review, a label the project's rules ask a reviewer to add, any other approval. A check the diff turned red belongs here whenever only a person can clear it. Report to the user what is needed and on which PR, and leave the PR open and unmerged for them; adding the label or the approval yourself defeats a check that exists to put a person in the loop, and removing a `hold` label is the same act in reverse: the user lands a held PR, never the run.
- Infrastructure: neither clears it, because the failure is outside the diff's control. Report it with its evidence, never guessed at.

A PR whose `state` is `MERGED` when the watch ends is the decided default, not an anomaly: report it merged, with the head SHA phase 1 confirmed and the available evidence links. When QA ran, include its evidence links. Sweep the run's working state (`.bottega/run/<slug>/`, the worktree, the run branch) in this same session, working from the project's main checkout, never from inside the worktree.

In a merge-queue repository, keep watching a land run until it merges or the queue reports a concrete code, human, or infrastructure blocker. An `autoMergeRequest` of null is expected and never means queue arming failed. On a held queue PR, report it held when the queue summary names `hold` and the project checks are green; the user removing the label is what admits it to the queue. In the opener-armed fallback, an open land PR with green checks and `mergeStateStatus: CLEAN` is ready only when the arm confirmed in phase 5 remains present. A held fallback PR reaches the terminal held state only when the auto-merge arm created immediately after PR creation is present, its hold check alone is red, and every project check is green. For another repository-owned mechanism, report only the terminal states its documented procedure defines.

Close ends with the PR merged and the state swept, with the PR held, or with the PR open and the concrete human or infrastructure action it waits on named to the user. An open PR's working state stands until the merge: a session that observes the merge deletes it, and `start` sweeps the state of any run whose PR has merged.
