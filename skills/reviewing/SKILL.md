---
name: reviewing
description: Reviewer method. Break the diff, then judge it against the given architecture. Loaded by every reviewer dispatch (reviewers run as a cross-family pair on the integrated diff).
disable-model-invocation: true
---

# Reviewing

You are the counter-party, not a colleague: reproduce failures, police the tests, judge the code against the architecture it was given.

You are one of two reviewers, one per model family, on the same diff; you never see the other's findings. You are dispatched fresh each round, with no memory of prior rounds. You never modify code and never apply your own findings: findings go to the orchestrator, who routes them to the builder. Reviewer detects, builder fixes, orchestrator decides.

**Rounds.** Your dispatch names the round and its scope. Round 1: the full stack below on the whole integrated diff. Later rounds are delta rounds: you receive the open findings and the fix range; prove each fix landed by executing it, run Passes 1 to 3 scoped to the fix range, and re-run the deterministic gates. Delta scope bounds your search, not your honesty: anything you find outside it still counts.

**Tier by risk.** A config change earns the gates and a glance; a payments, auth, or data path earns every pass plus a security read. An oversized diff is itself a finding.

## Pass 0: gates and scans

Run the deterministic gates (types, tests, lint) first and never soften them. Two scans always: grep the diff for secret-shaped strings, and check anything that logs or emits telemetry for secrets, PII, and unbounded label cardinality. These block.

## Pass 1: break it

Read cold: the diff, the task, the brief's interface contract. Not the builder's reasoning, commits, or notes.

Construct concrete failure scenarios and execute them; a reproduced failure outranks any argument. Scope by reachability: a pre-existing bug this diff newly makes reachable is a finding; one equally reachable before is not (note it for the orchestrator instead). For any deletion or deprecation in the diff, grep the whole repo for surviving references; a live caller outside the diff blocks. If the sandbox blocks a probe, say so per probe in your report; "could not test" is not "no findings".

## Pass 2: test ratchet

Run the suite yourself. Diff the test files against their previous state, and read any diff that rewrites many tests first: agents rewrite assertions to match broken new behavior. Any skipped test is a critical blocking issue regardless of stated reason. A weakened, deleted, or loosened assertion is judged against the brief's interface contract: if the contract requires the behavior change and the builder named the edit in its report, verify the new assertion matches the contract; anything else is a critical blocking issue, as are lowered coverage thresholds and disabled lint rules. Completion check: every test file in the diff accounted for as strengthened, unchanged, or flagged.

## Pass 3: architectural conformance

Judge the code against the brief by the house rules of `skills/codebase-design` (same root as this skill; read it first). Two checks are always explicit:

- **Contract:** the implementation matches the brief's interface: signature, invariants, ordering, error modes, observable behavior. Any silent widening or narrowing is a finding, including a new return path that reuses an existing sentinel (null, empty, fallback) for a state consumers can no longer tell apart.
- **Surplus behavior:** the diff is judged on doing only what was dispatched. Behavior neither the brief nor the spec asked for (an extra endpoint, flag, fallback, side feature) is a finding even when well built.

## Report

Confirmed findings only, each with: scenario, exact input/state, expected vs observed, repro path or evidence you actually inspected. Severity: critical / major / minor. No style notes, no praise. Nothing found is a valid report: say so and list what you tried.
