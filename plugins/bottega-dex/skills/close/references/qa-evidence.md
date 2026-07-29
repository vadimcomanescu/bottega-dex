# QA evidence publication

Publish each scenario's actual QA evidence to the evidence repository and link it from the pull request body.

Use one private repository per GitHub owner, `<owner>/bottega-evidence`, holding every run's evidence files and nothing else. It carries no workflows, so a push builds nothing anywhere. Create it on first use (`gh repo create <owner>/bottega-evidence --private`). Commit the run's files under `<project>/<run-slug>/` on the default branch and push with the same credentials already used for GitHub. History only grows, so a commit-pinned link remains stable.

Publish the artifacts QA actually captured for each scenario: text snapshots for behavior, screenshots for appearance, raw output for encoding, and recordings when the driving tool produced them. Never stage or synthesize evidence after the drive. When a recording exists, render a reviewable GIF and keep the full recording beside it. ffmpeg with a palette pass, 8 to 12 fps, and about 960px width keeps UI text readable at a few megabytes. Split a long drive by scenario.

Link each artifact under the scenario's verdict with a commit-pinned blob URL. State `NOT VERIFIED` and its blocker where no direct drive was safe or possible. The pull request must not claim behavior beyond the published evidence.
