---
name: signoff
description: Run a user gate — the collaborative spec document where the user reads the spec with its storyboards, comments from any device, watches revisions land in place, and signs. Loaded by the maestro at every user decision point; spec sign-off is the canonical gate.
---

# Sign-off

*The user appears twice; both times they deserve a surface, not a wall. A gate is read as a flow, annotated in place, answered in place, and signed without leaving the page.*

## One surface

One collaborative document at one URL, on a hosted doc service both sides reach from anywhere by outbound HTTPS alone — the Proof web API: `POST proofeditor.ai/share/markdown`, no account, no install. Opening the gate **is** publishing this doc. Never a second surface or side channel: no separate visuals page, no chat paste-backs, no tunnels to local servers. Whether spec text may go to a third-party service is the user's call — ask once per repo at the first gate and record the answer in `.bottega/gates/surface`; a non-hosted surface is permitted only when that record holds the user's explicit refusal to publish (or their at-the-machine request). A sign-off page already sitting in the target repo is a relic, not an answer; confidentiality is the user's to state, never yours to infer. The one local form is this skill's bundled canvas — `assets/gate.html` + `gate-server.mjs` over loopback — never a page found in the repo.

The bundled canvas is deliberately reduced: it omits Direction and Testing and uses its own local approval controls; it is an at-the-machine fallback, never the hosted gate template.

## The document

The gate doc renders the commission — the spec doc (`docs/specs/<YYYY-MM-DD>-<feature-slug>.md`, authored per `skills/spec`) and the `features/*.feature` files it points at. At assembly, read `references/gate-doc.md` and instantiate its hosted document skeleton; fill its placeholders, copy its standing header verbatim, and never re-word it. The standing header is system explanation, never spec content. Scenario Gherkin is shown verbatim from its feature file — Gherkin is written for humans; slicing into per-scenario blocks and re-indenting are licensed, editing is not. The spine does not appear — interfaces, slices, and seams are designed after signing; the Direction is the one piece of shared architecture understanding the user signs.

Frames are produced by a dispatched seat following `skills/storyboarding`, which owns admissibility — captures of the launched product or of prototypes rendered from its real parts, never composed imagery, sources archived in the gate record. This skill owns their presentation only: inline data-URIs, numbered captions as comment anchors, each caption naming its source (**product**, a named build, or **prototype**).

Bind presence once (`name: Bottega Maestro`, `X-Agent-Id: ai:bottega-maestro`). Record `slug` + `accessToken`, the markdown source, and the frames in `.bottega/gates/<feature-slug>/` — gitignored working state; a later session on this machine resumes the same doc from it, and any other machine resumes from the hosted doc's URL, which the user holds. The repo files are the source: an accepted change lands there first — scenario text in `features/*.feature`, everything else in the spec doc — then the identical narrow block edit goes to the hosted doc: one action, two writes; the doc can be lost without losing anything, the repo copy cannot. The sign freezes `features/*.feature` only — never the hosted doc, and never the spec doc, which the Close step is licensed to rewrite after delivery.

## The conversation loop

From gate-open until decision, poll `state?kinds=comment` under the standing deadline-and-wake discipline — a user comment is dispatch-grade work. Answer **every** comment where it was made: `comment.reply` — agree, push back, or ask the sharpening question. A comment closes one of two ways: it changes the contract, or it gets a reply saying why not, `resolve: true`, and a line in the decisions log — silence on a comment is a dropped user instruction. Apply changes as narrow block edits (`/edit/v2` from a fresh `snapshot`; `find_replace` before `replace_block`; whole-doc rewrite never); anchor your own comments to prose or a heading — the user watches them land live in their open doc; many small comment-scoped edits beat one big revision, and a comment should become a visible change in minutes. Feedback arriving through the session conversation instead is never wrong: answer it in the doc, so the document carries the whole conversation wherever it happened. A comment orphaned by an edit (its quoted text gone) is reconciled against the rewritten content, never silently dropped; a comment that rejects a premise cascades — everything downstream of only that premise is revised in the same pass, so the user never re-comments per dependent scenario. A comment containing `SIGNED <feature-slug>` is the go signal: acknowledge in-doc (reply + resolve), then the cascade: the sign commit — the spec doc's `**Status:**` flips to signed and it lands in one commit with `features/*.feature`, the contract's last legitimate write. A clerk runs it and reports; the maestro verifies the report, never re-performs the steps.

## After signing — the same doc is the run's status surface

The gate doc keeps working through phase 2: a short status block — wave, slices green / in review / blocked, open escalations — updated at every integrate, so the user watches the run from the URL that signed it, from any device. Mid-run escalations that need the user (a split the spine revealed, a fable-tier request, a blocked seat) land there as comments on that block — same loop as the gate, never a new surface.
