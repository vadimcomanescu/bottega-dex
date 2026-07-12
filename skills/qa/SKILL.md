---
name: qa
description: QA method. Drive the delivered artifact as a user and produce scenario-by-scenario evidence. Loaded by every QA dispatch.
disable-model-invocation: true
user-invocable: false
---

# QA

Green tests are the builder's claim; you are the counter-party who drives the real artifact and reports what you saw.

## The walk

1. Your script is the brief's drive plan: on a spec run, the signed scenarios (`features/*.feature`) plus the spec's Testing lines; on a run with no spec, the flows the brief names. Every line of it ("Also probed" included) gets a verdict. Expand every Scenario Outline row; the brief may narrow the script to what a re-drive affects.
2. For each: build the Given state with real files and data in a fresh temp dir outside the repo, execute the When steps against the real artifact (the actual CLI binary, the real app route, the running server; never a fixture, demo harness, or synthetic screenshot), and check each Then against what you observed.
3. Capture raw evidence per scenario: exact commands, stdout/stderr, exit codes; screenshots for anything rendered. The console counts: a scenario that behaves correctly while erroring underneath is a PASS with the errors attached as findings, never a silent PASS.
4. Record the drive itself, recorder armed before the first When step, one recording per expanded row: browser flows in a session recorder (`agent-browser record start <path>` ... `record stop`, or playwright's native capture), CLI flows in a terminal recorder (asciinema or vhs), desktop flows under screen capture. A recording is evidence only if it is the session that produced the verdict; one staged afterward is not. A surface with no capture channel is reported as unrecordable, never faked.
5. Verdict per scenario: PASS with evidence, FAIL with the exact divergence, or NOT VERIFIED with why you couldn't drive it. Never "should work".
6. Write everything into `.bottega/verify/<feature-slug>/qa/<short-sha>/` (the short sha of the commit you drove): the full transcript as `qa-transcript.txt`, recordings under `recordings/`. One directory per drive; a re-drive writes its own. Touch nothing else in the repo; commit nothing. Completion check: every scenario row has a verdict, its evidence, and its recording path (or the unrecordable reason).

## Hard rules

- Credentials are out of bounds even as confirmation: never read or dump cookies, tokens, or storage secrets to prove a behavior. Prove it from what the user can observe.

## Visible surfaces

Scroll it, resize it, read it: a feature that works but looks broken fails, reported with a screenshot. When the brief carries a signed storyboard strip, it is the visual target, compared at the level it promises: a capture strip promises the drawn change (put the shipped screenshot next to it and name the divergence); a wireframe strip promises structure only (every named element present, placed, and reachable as drawn). Where your runtime can dispatch one, have an unprimed second look (an agent shown only the target and the result, on the model your brief names) confirm or contest your verdict; otherwise say the verdict is single-sourced.
