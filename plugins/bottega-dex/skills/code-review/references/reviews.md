# Standards and Spec reviews

Run the Standards and Spec reviews in parallel as separate vendored autoreview helper invocations against the same frozen target. Each active review uses P2, streamed output, its own prompt file outside the reviewed repository, and its own JSON report outside the reviewed repository. The outer review worker retains read-only target-repository access to invoke the helper and verify findings. The helper builds the review bundle, runs the TruffleHog preflight, applies deletion-side redaction, and gives each helper-created isolated model session only that bundle and its prompt. The review worker never passes a raw diff, deleted revision, or repository access into either isolated session. A preflight or helper failure leaves that review unverified and it cannot contribute to a clean result.

## Standards review

The task running this skill identifies every applicable repository authority that governs the changed files, owner boundaries, relevant sibling surfaces, public, security, or product contracts, or named test interfaces and reads its content at the frozen target base, never from the current checkout. Every repository contract that governs named test interfaces is part of that set and is read at the frozen target base, never from the current checkout. Authority discovery is not limited to interface contracts. It follows the repository's scope and precedence rules and includes every applicable root or nested agent map, review doctrine, ownership rule, test-interface contract, and [smell-baseline.md](smell-baseline.md) from the loaded skill. The external prompt includes that frozen content, not merely authority names or paths. It also includes only the neutral review-boundary facts shared with the Spec review: target and base, architectural owner boundary, relevant sibling surfaces, public, security, and product contracts, changed-file and non-test LOC measurements, named test interfaces supplied by the orchestrator or caller, and the threat-model sentence when relevant. The measurements describe the change but do not cap a root-cause repair. If a governing authority is absent at the frozen base, the prompt explicitly states `absent at frozen base: <path>` and omits its content. Proposed contract changes remain only in the helper's sanitized bundle. Proposed changes to other authorities stay there too. The Standards prompt never includes the request, build spec, verbatim request, violated invariant, intended behavior, diff content, or deleted revision. The review reports violations of documented conventions, ownership, and test-interface discipline. It does not redesign the task.

Before either prompt is invoked, the task decides whether the change has a relevant threat-model boundary. When it does, the exact same threat-model sentence is required in both the Standards and Spec prompt files; neither helper invocation starts without it. The sentence remains a neutral review-boundary fact and does not add the request, specification, or intended behavior to the Standards prompt.

```bash
"$AUTOREVIEW" <same-frozen-target-arguments> --engine codex --max-priority P2 --stream-engine-output \
  --model gpt-5.6-sol --thinking high \
  --prompt "$(cat "$STANDARDS_REVIEW_PROMPT")" --json-output "$STANDARDS_REVIEW_REPORT"
```

## Spec review

The Spec prompt alone explicitly contains the run's build spec or verbatim request and the violated invariant established by discovery or review setup. It also receives the shared neutral review-boundary facts and changed-file and non-test LOC measurements, so it can judge the authorized owner-boundary neighborhood without treating the first patch as a hard scope cap. When a threat-model boundary is relevant, the Spec prompt must include the same required threat-model sentence as the Standards prompt. The build specification and violated invariant are not frozen-base authority, but the prompt contains no diff content or deleted revision. The helper supplies the redacted change bundle. It reports what the spec requires that is missing, what the change does that nobody asked for, and what looks implemented but wrong. Every finding quotes the spec line it judges.

```bash
"$AUTOREVIEW" <same-frozen-target-arguments> --engine codex --max-priority P2 --stream-engine-output \
  --model gpt-5.6-sol --thinking high \
  --prompt "$(cat "$SPEC_REVIEW_PROMPT")" --json-output "$SPEC_REVIEW_REPORT"
```

When a standalone review has no supplied spec or verbatim implementation request, the Spec review records `no spec available` and stops without launching its helper invocation. It is non-applicable and does not claim a clean Spec result; that status does not block a standalone clean engine result. A Maestro run always supplies its spec.

## Standalone Codex model selection

Standalone Standards and Spec reviews start with Codex `gpt-5.6-sol` at `high`. Only when the account cannot access Sol, use the documented one-time `gpt-5.6-terra` access fallback with the same frozen target, prompt boundary, and report boundary. Before trusting either model's clean engine result, run the malicious smoke harness with that actual selected model and thinking configuration pinned. This access fallback does not change a Maestro run: its mandatory Sol and Claude Opus panel, plus its Standards and Spec Sol reviews, remain fixed.

Standards and Spec findings use the same verification and scope classification as engine findings, including the check that settles a finding when one exists. A finding is in scope only when its fix serves the authorized invariant and its architectural owner-boundary neighborhood without changing the task's product contract; otherwise it is a follow-up or escalation. Engine, Standards, and Spec reruns cover changes made by accepted repairs.
