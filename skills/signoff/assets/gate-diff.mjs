#!/usr/bin/env node
// The SIGNED cascade's one mechanical check — invoked verbatim, never
// re-authored per commission: the walkthroughs the user signed on the hosted
// gate doc are the shipped renderer's reading of the feature files the sign
// commit freezes.
//
//   gate-diff.mjs <hosted.md> <feature-file...>
//
// Only the commission's own feature files are passed — a host may hold
// earlier signed commissions the gate doc rightly omits. Each scenario's
// rendered block (gate-render.mjs, same normalization: lines trimmed, blanks
// dropped) must appear contiguously in the hosted doc, blocks in order —
// frames and acceptance checks sit between blocks, never inside one. Four
// forgeries block beyond a plain mismatch: a walkthrough-shaped line (a
// numbered step or an *Also proven with* line) continuing a matched block
// inside its section, a heading that apes the scenario shape without being a
// rendered heading byte-for-byte (lookalike dashes and levels included), a
// fence carrying Gherkin under any tag or none (a second copy of scenario
// text nothing verifies), and a missing or out-of-order block. The repo side
// is always re-rendered from the files, so a hand-written walkthrough
// surfaces as a diff, not a silent divergence.
//
// Exit 0 clean · 1 mismatch, forgery, or unrenderable feature · 2 usage.

import { readFileSync } from "node:fs";
import { renderFiles } from "./gate-render.mjs";

const STEPISH = /^\d+[.)]\s/;
const PROVENISH = /^\*also proven with:/i;
const ANY_HEADING = /^#{1,6}\s/;
const SCENARIO_HEADINGISH = /^#{1,6}\s*Scenario\s*[—–-]/;
const GHERKIN_LINE =
  /^\s*(?:(?:Feature|Rule|Background|Scenario(?: Outline)?|Examples):|(?:Given|When|Then|And|But)\s+\S)/;

const lines = (text) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

const die = (msg) => {
  console.error(msg);
  process.exit(1);
};

const [, , hostedPath, ...files] = process.argv;
if (!hostedPath || files.length === 0) {
  console.error("usage: gate-diff.mjs <hosted.md> <feature-file...>");
  process.exit(2);
}

const hostedText = readFileSync(hostedPath, "utf8");

// Fence sweep on the raw text: any fenced block — tagged, untagged, indented —
// that names or contains Gherkin is a second copy of scenario text nothing
// verifies.
{
  let inFence = false;
  let info = "";
  let body = [];
  const gherkinFence = () =>
    /gherkin|cucumber|feature/i.test(info) || body.some((l) => GHERKIN_LINE.test(l));
  for (const raw of hostedText.split("\n")) {
    const open = raw.match(/^\s{0,3}(?:```|~~~)\s*(\S*)/);
    if (open) {
      if (inFence && gherkinFence())
        die("forgery: fenced Gherkin on the gate doc — scenario text renders only through gate-render");
      inFence = !inFence;
      info = open[1] ?? "";
      body = [];
    } else if (inFence) {
      body.push(raw);
    }
  }
  if (inFence && gherkinFence())
    die("forgery: fenced Gherkin on the gate doc — scenario text renders only through gate-render");
}

const hosted = lines(hostedText);

let blocks;
try {
  blocks = renderFiles(files).map(lines);
} catch (e) {
  die(`unrenderable: ${e.message}`);
}

let cursor = 0;
for (const block of blocks) {
  const [heading] = block;
  const at = hosted.indexOf(heading, cursor);
  if (at === -1) die(`missing or out-of-order walkthrough: ${heading}`);
  for (let i = 0; i < block.length; i++) {
    if (hosted[at + i] !== block[i]) {
      die(
        `mismatch under ${heading}:\n--- hosted\n${hosted[at + i] ?? "(end of doc)"}\n--- rendered from features\n${block[i]}`
      );
    }
  }
  // Nothing walkthrough-shaped may continue the block inside its section —
  // an appended step or proven line reads as renderer output and is a signed
  // promise no feature file carries.
  for (let j = at + block.length; j < hosted.length && !ANY_HEADING.test(hosted[j]); j++) {
    if (STEPISH.test(hosted[j]) || PROVENISH.test(hosted[j])) {
      die(`forgery: line continues the walkthrough of "${heading}" but no feature file carries it:\n${hosted[j]}`);
    }
  }
  cursor = at + block.length;
}

// Every heading that apes the scenario shape — any level, any dash — must be
// one of the rendered headings, byte for byte, exactly once each.
const rendered = new Set(blocks.map((b) => b[0]));
const suspects = hosted.filter((l) => SCENARIO_HEADINGISH.test(l));
const impostor = suspects.find((l) => !rendered.has(l));
if (impostor) die(`forgery: scenario heading the renderer never produced:\n${impostor}`);
if (suspects.length !== blocks.length) {
  die(
    `forgery: hosted doc carries ${suspects.length} scenario heading(s), the feature files render ${blocks.length}`
  );
}

console.log(`gate-diff clean: ${blocks.length} walkthrough(s) across ${files.length} feature file(s)`);
process.exit(0);
