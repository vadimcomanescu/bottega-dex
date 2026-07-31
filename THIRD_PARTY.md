# Third-party material

## Autoreview review engine

- Upstream: `openclaw/agent-skills`, under `skills/autoreview`.
- Pinned at `fe588b1` (synced 2026-07-31; previously `98122a3`). `scripts/autoreview_test.py` and the changed fixture files are byte-identical to that revision. `scripts/autoreview` and `tests/test_autoreview_hardening.py` start from that revision and carry the local context-line security adaptation below. This sync adds the TruffleHog secret preflight and deletion-side redaction.
- Local adaptations: `plugins/bottega-dex/skills/code-review/SKILL.md` retains Bottega Dex's Codex Sol-to-Terra fallback, Claude review defaults, model-run rules, and Dex-specific paths. It takes the portable P0-default and TruffleHog/deletion-redaction contract from the upstream advancement. `plugins/bottega-dex/skills/code-review/scripts/autoreview` adds a narrow fail-closed scan for unchanged unified-diff context lines, which are not present in the TruffleHog snapshot additions but are still sent to a review engine. `plugins/bottega-dex/skills/setup/SKILL.md` verifies `trufflehog` as a required review dependency and never installs it automatically.
- Sync: replace the listed vendor artifacts and changed fixtures as whole files, reconcile only the portable upstream contract hunks into the Dex skill, retain the Dex-specific review rules, and reapply the context-line security check with its regression test.
