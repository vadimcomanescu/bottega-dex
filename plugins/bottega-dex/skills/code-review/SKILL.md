---
name: code-review
description: Review completed work through the vendored autoreview engine with GPT-5.6 Sol and Claude Opus 5. Use after orchestration and the repository's decisive test gate, and rerun after review fixes.
---

# Code review

Review the completed integrated diff through Bottega's vendored autoreview engine. Read and follow [the autoreview contract](references/autoreview.md); the helper and its test harness live in `scripts/`.

Resolve the base to a commit SHA, then run the panel from the task worktree:

```bash
AUTOREVIEW="<this-skill-directory>/scripts/autoreview"
"$AUTOREVIEW" --mode branch --base <base-sha> --reviewers codex,claude \
  --model codex=gpt-5.6-sol --thinking codex=high \
  --model claude=claude-opus-5 --thinking claude=high
```

Verify every finding against the code. Fix accepted issues with one or more subagents depending on their size, respecting the repository's implementation methodologies. After a fix, run the affected proof and the same dual autoreview command again at the new head. Complete when autoreview exits clean with no accepted or actionable finding.
