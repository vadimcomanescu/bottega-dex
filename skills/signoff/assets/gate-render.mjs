#!/usr/bin/env node
// The gate doc's scenario rendering — one shipped deterministic function, so
// "the walkthrough the user signs" and "the feature files the sign commit
// freezes" can be compared mechanically (gate-diff) instead of by trust.
//
//   gate-render.mjs <feature-file...>
//
// Each scenario renders as a plain-English walkthrough block:
//
//   ## Scenario — <name>
//
//   1. <step, keyword stripped, first letter capitalized>
//   2. …
//
//   *Also proven with: <header> "<value>", … · <next row>.*
//
// Scenario Outlines instantiate the first Examples row into the steps; the
// remaining rows become the *also proven with* line — the mutation-bearing
// values stay on the signing surface, the machinery (keywords, placeholders,
// tables) does not. The `Feature:` line is file plumbing, like indentation
// was under the fence rendering: the walkthrough is the contract.
//
// Steps are authored in second person (skills/spec), so stripping the keyword
// yields a sentence, never a fragment. Anything this renderer cannot carry
// faithfully — docstrings, step data tables, Rule: blocks — is a loud error,
// never a silent omission: restructure the feature, don't hand-render it.
//
// Exit 0 clean · 1 unrenderable feature · 2 usage.

import { readFileSync } from "node:fs";

const STEP = /^(Given|When|Then|And|But|\*)\s+(.*)$/;
const HEAD = /^(Feature|Background|Scenario Outline|Scenario|Examples|Rule):\s*(.*)$/;

const fail = (msg) => {
  throw new Error(msg);
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const parseRow = (line) =>
  line
    .slice(1, line.lastIndexOf("|"))
    .split("|")
    .map((c) => c.trim());

// Parse one feature file into scenarios: { name, steps, rows } where rows is
// the Examples table ([headers, ...values]) or null for a plain Scenario.
export function parse(text) {
  const scenarios = [];
  let background = [];
  let current = null; // { name, steps, outline, rows }
  let inExamples = false;
  let target = null; // where bare steps land: background or current.steps

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#") || line.startsWith("@")) continue;
    if (line.startsWith('"""') || line.startsWith("```"))
      fail("docstring steps are unrenderable — restructure the feature");

    const head = line.match(HEAD);
    if (head) {
      const [, kind, name] = head;
      inExamples = false;
      if (kind === "Feature") continue; // plumbing, not promise
      if (kind === "Rule") fail("Rule: blocks are unrenderable — restructure the feature");
      if (kind === "Background") {
        target = background;
        continue;
      }
      if (kind === "Examples") {
        if (!current?.outline) fail("Examples outside a Scenario Outline");
        if (current.rows) fail(`scenario "${current.name}" carries two Examples tables`);
        current.rows = [];
        inExamples = true;
        continue;
      }
      current = { name, steps: [], outline: kind === "Scenario Outline", rows: null };
      scenarios.push(current);
      target = current.steps;
      continue;
    }

    if (line.startsWith("|")) {
      if (!inExamples) fail("step data tables are unrenderable — restructure the feature");
      current.rows.push(parseRow(line));
      continue;
    }

    const step = line.match(STEP);
    if (!step) fail(`unrenderable line: ${line}`);
    if (target === null) fail(`step before any scenario: ${line}`);
    target.push(step[2].trim());
  }

  return scenarios.map((s) => ({ ...s, steps: [...background, ...s.steps] }));
}

// Render one parsed scenario into its walkthrough block.
export function renderScenario({ name, steps, outline, rows }) {
  if (steps.length === 0) fail(`scenario "${name}" has no steps`);
  let proven = "";
  if (outline) {
    if (!rows || rows.length < 2)
      fail(`scenario outline "${name}" needs an Examples table with at least one value row`);
    const [headers, first, ...rest] = rows;
    steps = steps.map((s) =>
      s.replace(/<([^>]+)>/g, (_, p) => {
        const i = headers.indexOf(p.trim());
        if (i === -1) fail(`scenario outline "${name}" uses <${p}> with no matching Examples column`);
        return first[i];
      })
    );
    if (rest.length > 0) {
      const line = rest
        .map((row) => headers.map((h, i) => `${h} "${row[i]}"`).join(", "))
        .join(" · ");
      proven = `\n\n*Also proven with: ${line}.*`;
    }
  } else if (rows) {
    fail(`scenario "${name}" has Examples but is not a Scenario Outline`);
  }
  const numbered = steps.map((s, i) => `${i + 1}. ${capitalize(s)}`).join("\n");
  return `## Scenario — ${name}\n\n${numbered}${proven}`;
}

// Files sorted by path, scenarios in file order — the one sequence the spec
// doc, the gate doc, and gate-diff all share.
export const renderFiles = (files) =>
  [...files].sort().flatMap((f) => parse(readFileSync(f, "utf8")).map(renderScenario));

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("usage: gate-render.mjs <feature-file...>");
    process.exit(2);
  }
  try {
    console.log(renderFiles(files).join("\n\n"));
  } catch (e) {
    console.error(`unrenderable: ${e.message}`);
    process.exit(1);
  }
}
