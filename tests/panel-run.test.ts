import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const SCRIPT = join(
  import.meta.dirname,
  "..",
  "plugins",
  "bottega-dex",
  "scripts",
  "panel-run",
);

describe("panel-run", () => {
  it("defines exactly two blind drafts and one compare-only judge", () => {
    const result = spawnSync("node", [
      SCRIPT,
      "--cwd", "/tmp/repo",
      "--task", "/tmp/task.md",
      "--dir", "/tmp/panel",
      "--out", "/tmp/panel.json",
      "--dry-run",
    ], { encoding: "utf8" });
    expect(result.status).toBe(0);
    const plan = JSON.parse(result.stdout);
    expect(plan.draftRoles).toEqual(["codex-panelist", "claude-panelist"]);
    expect(plan.judgeRole).toBe("claude-judge");
    expect(plan.blinding).toContain("Draft A");
    expect(plan.blinding).toContain("Draft B");
  });

  it("constructs the judge brief without provider identities", () => {
    const source = readFileSync(SCRIPT, "utf8");
    const judgeTemplate = source.slice(
      source.indexOf("`Task:"),
      source.indexOf("const judgeOut"),
    );
    expect(judgeTemplate).toContain("Draft A:");
    expect(judgeTemplate).toContain("Draft B:");
    expect(judgeTemplate).not.toMatch(/codex-panelist|claude-panelist|gpt-5\.6|opus/i);
  });
});
