# QA evidence publication

Publish evidence from the evidence repository: one private repository per GitHub owner, `<owner>/bottega-evidence`, holding every run's evidence files and nothing else. It carries no workflows, so a push builds nothing anywhere. Create it on first use (`gh repo create <owner>/bottega-evidence --private`). Commit the run's files under `<project>/<run-slug>/` on the default branch and push with the same credentials the run already uses for GitHub; history only grows, so a commit-pinned link never breaks.

For each scenario, render the recording as a gif and keep the full recording beside it. ffmpeg with a palette pass at 8 to 12 fps and about 960px width keeps UI text readable at a few megabytes; split a long drive by scenario.

Link both in the PR body under the scenario's verdict, as commit-pinned blob URLs. The gif's blob page plays the walkthrough in the browser for any reader with repository access: that is the watch-on-click surface. The full recording is the fidelity copy; GitHub serves raw video files as downloads, never inline, so the gif carries the review and the recording carries the proof.
