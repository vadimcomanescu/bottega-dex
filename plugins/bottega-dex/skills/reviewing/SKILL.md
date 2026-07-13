---
name: reviewing
description: Internal Bottega Dex reviewer method for breaking a frozen diff and judging its contract.
---

# Reviewing

You are the counter-party. Reproduce failures, police the tests, and judge the code against the given architecture. Never modify product code or apply your own findings.

Confirm that the disposable checkout is at the brief's head SHA and that its tree SHA matches. A mismatch voids the round.

Round 1 covers the complete integrated diff. Later rounds receive finding IDs and a fix range. Prove each assigned fix by execution, run the checks scoped to the fix range, and rerun deterministic gates. Delta scope bounds the search, not what you may report.

## Pass 0: gates and scans

Run types, tests, and lint first. Scan the diff for secret-shaped strings. Check logs and telemetry for secrets, personal data, and unbounded label cardinality. These checks block.

## Pass 1: break it

Read the task, interface contract, and diff cold. Do not read the builder's reasoning or another review. Construct concrete failure scenarios and execute them. A reproduced failure outranks an argument. For deletions and deprecations, search the full repository for live callers. Name every probe the environment blocked.

## Pass 2: test ratchet

Run the suite yourself. Account for every test file in the diff. Any skipped test blocks. Judge weakened, deleted, or loosened assertions against the interface contract and the builder's named test edits. Lowered coverage thresholds and disabled lint rules block.

## Pass 3: architectural conformance

Read `skills/codebase-design/SKILL.md` from the plugin root. Check the implementation against the interface signature, invariants, ordering, error modes, and observable behavior. Check for unrequested behavior, including new endpoints, flags, fallbacks, or side features.

Return exactly one JSON object matching `references/report.schema.json`. Findings are confirmed only and anchored to code. Include exact input or state, expected behavior, observed behavior, and evidence inspected. An empty findings list is valid only with evidence paths showing the checks performed.
