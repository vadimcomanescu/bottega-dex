---
name: signoff
description: Run a patron gate — the collaborative spec document where the patron reads the spec with its storyboards, comments from any device, watches revisions land in place, and signs. Loaded by the maestro at every patron decision point; spec sign-off is the canonical gate.
---

# Sign-off

*The patron appears twice; both times they deserve a surface, not a wall. A gate is read as a flow, annotated in place, answered in place, and signed without leaving the page.*

## One surface

One collaborative document at one URL, on a hosted doc service both sides reach from anywhere by outbound HTTPS alone — the Proof web API: `POST proofeditor.ai/share/markdown`, no account, no install. Opening the gate **is** publishing this doc. Never a second surface or side channel: no separate visuals page, no chat paste-backs, no tunnels to local servers. Whether spec text may go to a third-party service is the patron's call — ask once per repo at the first gate and record the answer in `.bottega/gates/surface`; a non-hosted surface is permitted only when that record holds the patron's explicit refusal to publish (or their at-the-machine request). A sign-off page already sitting in the target repo is a relic, not an answer; confidentiality is the patron's to state, never yours to infer. The one local form is this skill's bundled canvas — `assets/gate.html` + `gate-server.mjs` over loopback — never a page found in the repo.

## The document

Structured markdown: intent; **one section per scenario** — its Gherkin fenced, its storyboard frames beneath, inline as data-URI images (the service blocks external image URLs), each with a numbered caption (`*Frame 2.1 — …*`) — doc services take no comments on image blocks, so the caption is the frame's comment anchor; the domain glossary (a wrong noun at the gate is a wrong contract); non-goals; the decisions log. The header states the patron's two moves: comment to change anything, comment `SIGNED <id>` to sign. Architecture does not appear — the spine is designed after signing; a tech-direction note publishes later as a non-blocking read, never as gate content.

Never compose, draw, generate, or reconstruct storyboard imagery. Every frame is a browser screenshot of the launched product or of a launched prototype built from the product's real pages, components, and styles — a standalone SVG, generated image, or token-derived mockup is not admissible even if a browser rendered it — and the caption says which: the **product**, a named build, the only admissible source for what the app does or did (a build you cannot launch leaves that claim as prose); or a **prototype**, the proposed change placed into those real pages and rendered, a wholly new screen being a throwaway page assembled from the same parts. Frames render through the product's own components and styles — tokens or brand colors alone are not enough; phone-first flows at phone width — and prototype sources land in the gate record: a frame nobody can re-render is testimony, not evidence.

Bind presence once (`name: Bottega Maestro`, `X-Agent-Id: ai:bottega-maestro`). Record `slug` + `accessToken`, the markdown source, and the frames in `.bottega/gates/<spec-id>/` — any later session, on any machine, resumes the same doc from them; whether they ride the run branch follows the repo's confidentiality (the token is read access to the doc). `bottega sign` hashes the repo files (`docs/specs/…`, `features/…`), never the hosted doc — so every accepted change lands in the repo file as well as in the doc, and at `SIGNED` the two must say the same thing: the patron read the doc, the lock hashes the files. The doc can be lost without losing anything; the repo copy cannot.

## The conversation loop

From gate-open until decision, poll `state?kinds=comment` under the standing deadline-and-wake discipline — a patron comment is dispatch-grade work. Answer **every** comment where it was made: `comment.reply` — agree, push back, or ask the sharpening question. A comment closes one of two ways: it changes the contract, or it gets a reply saying why not, `resolve: true`, and a line in the decisions log — silence on a comment is a dropped patron instruction. Apply changes as narrow block edits (`/edit/v2` from a fresh `snapshot`; `find_replace` before `replace_block`; whole-doc rewrite never) — the patron watches them land live in their open doc; many small comment-scoped edits beat one big revision, and a comment should become a visible change in minutes. Mirror every comment, reply, and edit summary into `.bottega/gates/<spec-id>/thread.jsonl` — the run's evidence trail never lives only on a third-party service. Feedback arriving through the session conversation instead is never wrong: record it in the mirror and answer it in the doc, so the document carries the whole conversation wherever it happened. A comment containing `SIGNED <id>` is the go signal: acknowledge in-doc (reply + resolve), then proceed to `bottega sign`.

## After signing — the same doc is the run's status surface

The gate doc keeps working through phase 2: a short status block — wave, slices green / in review / blocked, open escalations — updated at every integrate, so the patron watches the run from the URL that signed it, from any device. Mid-run escalations that need the patron (a split the spine revealed, a fable-tier request, a blocked seat) land there as comments on that block — same loop as the gate, never a new surface.
