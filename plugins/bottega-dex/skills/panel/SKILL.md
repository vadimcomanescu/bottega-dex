---
name: panel
description: Put one costly open decision to independent Codex and Claude drafts, blind them for comparison, and write the decision yourself.
---

# Panel

Use a panel only when a decision is open, expensive to reverse, and cannot be settled by a test, spike, benchmark, prototype, repository evidence, or a standard solution. It creates independent options. It does not review an existing plan, diff, or specification, vote, or make the decision.

## 1. Frame the task

Write one neutral, self-contained task: the decision, binding constraints, repository evidence paths, and material context unavailable to a fresh worker. Do not state a preferred answer. Each seat reads the repository and searches the web for current public evidence. Save the task as `<session>/task.md`, ending with:

```
Ground the answer in the repository and in current public sources you search.
Reply with: Answer; Claims the answer rests on; Assumptions; What would change this answer.
Do not identify your model or company.
```

## 2. Seat the panel

Give both seats the identical `task.md` and keep each read-only:

| seat | dispatch |
| --- | --- |
| Codex | One fresh native Codex subagent at high reasoning, with only the task and authorized repository evidence. Save its report to `<session>/codex-draft.md`. |
| Claude | Invoke `$bottega-dex:use-claude` once with the task verbatim. It runs `claude -p` with Claude Fable 5 at high effort. Save its report to `<session>/claude-draft.md`. |

Run the independent seats concurrently when the runtime permits. Record any timeout, error, or empty report. With two or more drafts, continue. With one, take a fresh second draft from the seat that answered. With none, report the failures and answer without claiming a panel result.

## 3. Blind and compare

Copy successful drafts to `A.md`, `B.md`, and so on in an order unrelated to their seats. Remove model or company identifiers. Give a fresh native Codex high-reasoning comparison seat the task and blinded drafts with this exact brief:

```
Compare the drafts against the task. Report exactly five sections, each quoting the drafts as evidence: Consensus; Contradictions; Partial coverage; Unique insights; Blind spots.
Do not answer the task, merge the drafts, vote, grade, or pick one.
```

## 4. Decide

Write the decision yourself. Verify consensus against the repository, resolve contradictions using stronger evidence, retain only independently supported unique insights, and close or explicitly flag blind spots. Record what the panel changed in the relevant design, PR, or final response.
