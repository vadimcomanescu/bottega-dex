// gate-diff is the sign-blocking fence: the hosted gate doc's walkthrough
// blocks must equal gate-render's reading of the feature files, block for
// block, in order. Frames and checks between blocks are licensed; edited
// steps, stale sections, gherkin fences, and dropped or reordered
// walkthroughs are not. It checks drift, never deceit — the adversarial
// forgery layer was deliberately removed.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const GATE_DIFF = join(
  import.meta.dirname,
  "..",
  "skills",
  "signoff",
  "assets",
  "gate-diff.mjs",
);

const FEATURE = `Feature: Saved searches

  Scenario: Save a search
    Given you're signed in as a shopper
    When you save the search "red sneakers"
    Then "red sneakers" appears under Saved searches

  Scenario Outline: Search results honor the query
    When you search for "<query>"
    Then every result matches "<query>"

    Examples:
      | query           |
      | red sneakers    |
      | size 44 sandals |
`;

const HEADER = `# Gate doc

Standing header prose, never compared.
`;

const BLOCK_SAVE = `## Scenario — Save a search

1. You're signed in as a shopper
2. You save the search "red sneakers"
3. "red sneakers" appears under Saved searches
`;

const SECTION_SAVE_EXTRAS = `
*Frame 1.1 — the save control, prototype.*

**Acceptance checks**
- sign out and back in: "red sneakers" still listed under Saved searches
`;

const BLOCK_QUERY = `## Scenario — Search results honor the query

1. You search for "red sneakers"
2. Every result matches "red sneakers"

*Also proven with: query "size 44 sandals".*
`;

// The gate doc carries the renderer's blocks with frames and checks between
// them — never inside one.
const HOSTED_CLEAN = `${HEADER}
${BLOCK_SAVE}${SECTION_SAVE_EXTRAS}
${BLOCK_QUERY}`;

const cleanups: string[] = [];
afterEach(() => {
  while (cleanups.length > 0) rmSync(cleanups.pop()!, { recursive: true, force: true });
});

function gateDir(hosted: string): string {
  const dir = mkdtempSync(join(tmpdir(), "bottega-gate-diff-"));
  cleanups.push(dir);
  mkdirSync(join(dir, "features"));
  writeFileSync(join(dir, "features", "saved-searches.feature"), FEATURE);
  writeFileSync(join(dir, "hosted.md"), hosted);
  return dir;
}

function runDiff(dir: string) {
  return spawnSync(
    "node",
    [GATE_DIFF, join(dir, "hosted.md"), join(dir, "features", "saved-searches.feature")],
    { encoding: "utf-8" },
  );
}

describe("gate-diff", () => {
  it("passes the renderer's blocks with frames and checks between them", () => {
    const result = runDiff(gateDir(HOSTED_CLEAN));
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
  });

  it("blocks an edited step", () => {
    const result = runDiff(
      gateDir(HOSTED_CLEAN.replace('You save the search "red sneakers"', 'You save the search "blue sneakers"')),
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/mismatch/);
  });

  it("blocks an edited also-proven value", () => {
    const result = runDiff(gateDir(HOSTED_CLEAN.replace("size 44 sandals", "size 43 sandals")));
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/mismatch/);
  });

  it("blocks a rendering that dropped a scenario", () => {
    const withoutLast = HOSTED_CLEAN.slice(0, HOSTED_CLEAN.indexOf("## Scenario — Search results"));
    const result = runDiff(gateDir(withoutLast));
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/missing or out-of-order walkthrough/);
  });

  it("blocks blocks presented out of order", () => {
    const swapped = `${HEADER}
${BLOCK_QUERY}
${BLOCK_SAVE}${SECTION_SAVE_EXTRAS}`;
    const result = runDiff(gateDir(swapped));
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/missing or out-of-order walkthrough/);
  });

  it("blocks a stale scenario section no feature file carries", () => {
    const stale = `${HOSTED_CLEAN}\n## Scenario — Bulk export\n\n1. You export every saved search\n`;
    const result = runDiff(gateDir(stale));
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/stale/);
  });

  it("blocks a raw gherkin fence", () => {
    const withFence = `${HOSTED_CLEAN}\n\`\`\`gherkin\nScenario: Save a search\n\`\`\`\n`;
    const result = runDiff(gateDir(withFence));
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/gherkin fence/);
  });

  it("passes an innocuous code fence", () => {
    const withFence = `${HOSTED_CLEAN}\n\`\`\`bash\nnpm test\n\`\`\`\n`;
    const result = runDiff(gateDir(withFence));
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
  });

  it("blocks a doc with no walkthroughs at all", () => {
    const result = runDiff(gateDir("# Gate doc\n\nprose only\n"));
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/missing or out-of-order walkthrough/);
  });
});
