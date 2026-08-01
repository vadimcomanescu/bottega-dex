# P0 threshold suppressed actionable review findings

What happened: the P0-only default could suppress a confidently found P1 or P2 defect before the reviewer reported it.

The rule: classification filters noise after review. Every structured and independent review runs at P2 through the sanitized helper, and the malicious smoke harness must pass in the same environment before the first clean result of a session is trusted.

Enforced: `plugins/bottega-dex/skills/code-review/SKILL.md`, `plugins/bottega-dex/skills/maestro/SKILL.md`, `README.md`, `AGENTS.md`, and `tests/plugin-contract.test.ts`.
