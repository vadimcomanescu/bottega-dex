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
// frames and acceptance checks sit between blocks, never inside one. Three
// forgeries block beyond a plain mismatch: a `## Scenario —` heading the
// renderer never produced (a signed promise no feature file carries), a
// ```gherkin fence (a second copy of scenario text nothing verifies), and a
// missing block. The repo side is always re-rendered from the files, so a
// hand-written walkthrough surfaces as a diff, not a silent divergence.
//
// Exit 0 clean · 1 mismatch, forgery, or unrenderable feature · 2 usage.

import { readFileSync } from "node:fs";
import { renderFiles } from "./gate-render.mjs";

const lines = (text) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

const [, , hostedPath, ...files] = process.argv;
if (!hostedPath || files.length === 0) {
  console.error("usage: gate-diff.mjs <hosted.md> <feature-file...>");
  process.exit(2);
}

const hostedText = readFileSync(hostedPath, "utf8");
if (/^```gherkin/m.test(hostedText)) {
  console.error("forgery: raw gherkin fence on the gate doc — scenario text renders only through gate-render");
  process.exit(1);
}
const hosted = lines(hostedText);

let blocks;
try {
  blocks = renderFiles(files).map(lines);
} catch (e) {
  console.error(`unrenderable: ${e.message}`);
  process.exit(1);
}

let cursor = 0;
for (const block of blocks) {
  const [heading] = block;
  const at = hosted.indexOf(heading, cursor);
  if (at === -1) {
    console.error(`missing or out-of-order walkthrough: ${heading}`);
    process.exit(1);
  }
  for (let i = 0; i < block.length; i++) {
    if (hosted[at + i] !== block[i]) {
      console.error(
        `mismatch under ${heading}:\n--- hosted\n${hosted[at + i] ?? "(end of doc)"}\n--- rendered from features\n${block[i]}`
      );
      process.exit(1);
    }
  }
  cursor = at + block.length;
}

const docHeadings = hosted.filter((l) => l.startsWith("## Scenario — ")).length;
if (docHeadings !== blocks.length) {
  console.error(
    `forgery: hosted doc carries ${docHeadings} scenario section(s), the feature files render ${blocks.length}`
  );
  process.exit(1);
}

console.log(`gate-diff clean: ${blocks.length} walkthrough(s) across ${files.length} feature file(s)`);
process.exit(0);
