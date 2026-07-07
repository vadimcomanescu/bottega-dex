#!/usr/bin/env node
// The SIGNED cascade's one mechanical check — invoked verbatim, never
// re-authored per commission: the scenario text the user signed on the hosted
// gate doc is the scenario text the sign commit freezes.
//
//   gate-diff.mjs <hosted.md> <feature-file...>
//
// Only the commission's own feature files are passed — a host may hold
// earlier signed commissions the gate doc rightly omits. The hosted doc's
// ```gherkin fences, concatenated in doc order, must carry every line of the
// given files (sorted by name, lines in file order). The rendering is
// licensed to slice a file into per-scenario fences and to re-indent;
// comparison is per-line, whitespace-trimmed, blank lines dropped — Gherkin
// indentation is presentation, line order is contract. The repo side is read
// as plain files, never parsed as fences, so a fence the doc mangled or
// dropped surfaces as a diff, not a silent omission.
//
// Exit 0 clean · 1 mismatch or defect · 2 usage.

import { readFileSync } from "node:fs";

const FENCE = /^```gherkin[^\n]*\n([\s\S]*?)\n```[ \t]*$/gm;

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

const hosted = [...readFileSync(hostedPath, "utf8").matchAll(FENCE)].flatMap((m) =>
  lines(m[1])
);
if (hosted.length === 0) {
  console.error("defect: no gherkin fences in the hosted doc");
  process.exit(1);
}

const repo = files.sort().flatMap((f) => lines(readFileSync(f, "utf8")));

const n = Math.min(hosted.length, repo.length);
for (let i = 0; i < n; i++) {
  if (hosted[i] !== repo[i]) {
    console.error(`mismatch at line ${i + 1}:\n--- hosted\n${hosted[i]}\n--- features\n${repo[i]}`);
    process.exit(1);
  }
}
if (hosted.length !== repo.length) {
  const [longer, extra] =
    hosted.length > repo.length
      ? ["hosted doc", hosted.slice(n)]
      : ["feature files", repo.slice(n)];
  console.error(`mismatch: ${longer} carries ${extra.length} extra line(s), first:\n${extra[0]}`);
  process.exit(1);
}
console.log(`gate-diff clean: ${repo.length} lines across ${files.length} feature file(s)`);
process.exit(0);
