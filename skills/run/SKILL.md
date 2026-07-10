---
name: run
description: Run the whole bottega loop in one sitting — triage, commission → autonomous build → evidenced delivery. Invoke when the user asks for a full bottega run, via /bottega:run or in their own words; never proactively — a run costs hours of autonomous fleet work, gated by the sign-off inside. Work too small to commission exits to /bottega:patch; the halves run separately as /bottega:spec (signs without running) and /bottega:execute (runs what is signed).
argument-hint: "[--unattended] <task, or issue URL>"
---

# Run — triage, commission, then execute

One command, two skills in sequence; this file owns only the seams between them.

0. **Triage** — a bug fix, a small improvement, anything with no contract a user would sign: follow `skills/patch` and stop. The commission machinery below exists to pin a signable contract; work without one skips it whole. When in doubt, commission.
1. **Commission** — follow `skills/spec`: the interview, the contract, the storyboards, the gate via `skills/signoff`, through `SIGNED <feature-slug>` and its cascade. Pointed at a commission that is already signed and unexecuted, skip straight to 2 — a signed commission is never re-opened.
2. **Execute** — on SIGNED, follow `skills/execute` from its entry check: the run, the delivery PR, the spec close-out.

Invoked unattended — `--unattended` in the arguments, or the user's explicit equivalent in their own words, usually pointing at a GitHub issue — step 1 runs the unattended path in `skills/spec` (the sign cascades without the user) and step 2 follows as ever.

Everything binding — the maestro-tier seat rule, the routing table, the fences — lives in those skills; nothing here overrides them.
