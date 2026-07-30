# Merge governance

Use this reference only when the repository has no documented landing procedure. Finish with one exact proposal for approval before changing any repository file, setting, label, or workflow.

## Queue first

Inspect the repository's GitHub plan and available capabilities. Prefer GitHub's native merge queue when it is available. Ensure CI also runs for `merge_group` so the queued merge receives the required checks.

When native queue is unavailable, inspect the current Mergify configuration. Configure its queue through `merge_protections_settings.auto_merge_conditions`, not the deprecated `autoqueue` form. Inject the ruleset or branch-protection required checks, and make `hold` a queue condition so ordinary checks remain green while a held pull request stays out of the queue.

The queue and its ruleset require a pull request, allow squash only, and have no bypass actors. Set zero approvals only after confirming the repository is owner-authored. Leave strict up-to-date checking off because the queue tests the latest base.

Add a check workflow before requiring it. Remove its requirement before deleting its workflow.

## Auto-merge fallback

When no queue is available, have the account that opens a pull request arm GitHub auto-merge in the same run. Do not arm it from a workflow token. Add a required hold check triggered by `opened`, `reopened`, `synchronize`, `labeled`, and `unlabeled`, and make it report on every trigger.

Do not merge directly. The approved queue or opener-armed auto-merge lands the pull request when its requirements pass.
