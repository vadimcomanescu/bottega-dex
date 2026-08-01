# One review worker owns convergence

A fresh review worker runs structured review, verifies findings, and returns accepted repair briefs while the orchestrator dispatches builders and decides escalations. We chose this over orchestrator-per-finding review and single-engine reruns because one worker preserves context and keeps the fixed dual panel plus parallel Standards and Spec reviews aligned on one head. The consequence is extra model latency and cost, plus an explicit orchestrator-builder handoff for each repair cycle.
