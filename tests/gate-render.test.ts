// gate-render is the shipped deterministic rendering: feature files in,
// plain-English walkthrough blocks out. Keywords strip, the first Examples
// row instantiates, remaining rows land on the *also proven with* line, and
// anything it cannot carry faithfully is a loud error, never a silent
// omission.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
// @ts-expect-error plain .mjs module, typed by its tests
import { parse, renderScenario } from "../skills/signoff/assets/gate-render.mjs";

const GATE_RENDER = join(
  import.meta.dirname,
  "..",
  "skills",
  "signoff",
  "assets",
  "gate-render.mjs",
);

const render = (text: string): string[] => parse(text).map(renderScenario);

const cleanups: string[] = [];
afterEach(() => {
  while (cleanups.length > 0) rmSync(cleanups.pop()!, { recursive: true, force: true });
});

describe("gate-render", () => {
  it("strips keywords, numbers steps, capitalizes the sentence", () => {
    const [block] = render(`Feature: Saved searches

  Scenario: Save a search
    Given you're signed in as a shopper
    When you save the search "red sneakers"
    Then "red sneakers" appears under Saved searches
`);
    expect(block).toBe(`## Scenario — Save a search

1. You're signed in as a shopper
2. You save the search "red sneakers"
3. "red sneakers" appears under Saved searches`);
  });

  it("instantiates the first Examples row and proves the rest on one line", () => {
    const [block] = render(`Feature: Search

  Scenario Outline: Results honor the query
    When you search for "<query>"
    Then every result matches "<query>"

    Examples:
      | query           |
      | red sneakers    |
      | size 44 sandals |
`);
    expect(block).toBe(`## Scenario — Results honor the query

1. You search for "red sneakers"
2. Every result matches "red sneakers"

*Also proven with: query "size 44 sandals".*`);
  });

  it("omits the also-proven line when one row is all there is", () => {
    const [block] = render(`Feature: Search

  Scenario Outline: Results honor the query
    When you search for "<query>"

    Examples:
      | query        |
      | red sneakers |
`);
    expect(block).not.toContain("Also proven with");
  });

  it("prepends Background steps to every scenario", () => {
    const blocks = render(`Feature: Saved searches

  Background:
    Given you're signed in as a shopper

  Scenario: Save a search
    When you save the search "red sneakers"

  Scenario: Remove a saved search
    When you remove "red sneakers"
`);
    for (const block of blocks) {
      expect(block).toContain("1. You're signed in as a shopper");
    }
  });

  it("refuses a docstring instead of mangling it", () => {
    expect(() =>
      render('Feature: F\n\n  Scenario: S\n    Given a payload\n      """\n      raw\n      """\n'),
    ).toThrow(/docstring/);
  });

  it("refuses a step data table instead of mangling it", () => {
    expect(() =>
      render("Feature: F\n\n  Scenario: S\n    Given these rows\n      | a | b |\n"),
    ).toThrow(/data table/);
  });

  it("refuses a placeholder with no Examples column", () => {
    expect(() =>
      render(
        "Feature: F\n\n  Scenario Outline: S\n    When you search for <query>\n\n    Examples:\n      | q |\n      | x |\n",
      ),
    ).toThrow(/no matching Examples column/);
  });

  it("CLI renders files sorted by path, scenarios in file order", () => {
    const dir = mkdtempSync(join(tmpdir(), "bottega-gate-render-"));
    cleanups.push(dir);
    writeFileSync(join(dir, "b.feature"), "Feature: B\n\n  Scenario: Second\n    When you act\n");
    writeFileSync(join(dir, "a.feature"), "Feature: A\n\n  Scenario: First\n    When you act\n");
    const result = spawnSync(
      "node",
      [GATE_RENDER, join(dir, "b.feature"), join(dir, "a.feature")],
      { encoding: "utf-8" },
    );
    expect(result.status).toBe(0);
    expect(result.stdout.indexOf("## Scenario — First")).toBeLessThan(
      result.stdout.indexOf("## Scenario — Second"),
    );
  });
});
