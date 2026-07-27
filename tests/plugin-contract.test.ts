import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const PLUGIN = join(ROOT, "plugins", "bottega-dex");

const UPSTREAM_SKILL = `---
name: orchestrate
description: Coordinate multiple agents on large-scope tasks. Use whenever the work is substantial; trivial tasks do not require this skill.
---

# Orchestrate

Remain available to the user while delegating substantive work. Run narrow, read-only scouts in parallel with \`reasoning_effort: "low"\` and \`fork_turns: "none"\`. Use \`reasoning_effort: "medium"\` for routine implementation and \`"high"\` for difficult work. Give each agent distinct ownership, prevent overlapping assignments, and instruct leaf workers not to delegate. Integrate the results and keep approvals with the user.
`;

function filesUnder(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(path, entry.name);
    return entry.isDirectory() ? filesUnder(entryPath) : [relative(PLUGIN, entryPath)];
  });
}

function json(path: string) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function sha256(text: string) {
  return createHash("sha256").update(text).digest("hex");
}

describe("Codex plugin package", () => {
  it("contains the complete maestro workflow and Claude adapter", () => {
    expect(filesUnder(PLUGIN).sort()).toEqual([
      ".codex-plugin/plugin.json",
      "scripts/claude-exec",
      "scripts/exec-common.js",
      "skills/close/SKILL.md",
      "skills/close/references/qa-evidence.md",
      "skills/code-review/SKILL.md",
      "skills/code-review/references/report.schema.json",
      "skills/code-review/references/reviewer.md",
      "skills/discover/SKILL.md",
      "skills/maestro/SKILL.md",
      "skills/orchestrate/SKILL.md",
      "skills/qa/SKILL.md",
      "skills/start/SKILL.md",
    ]);
  });

  it("keeps the orchestrate skill identical to the selected upstream source", () => {
    const skill = readFileSync(
      join(PLUGIN, "skills", "orchestrate", "SKILL.md"),
      "utf8",
    );
    expect(skill).toBe(UPSTREAM_SKILL);
  });

  it("keeps the imported supporting procedures Codex-valid", () => {
    const start = readFileSync(join(PLUGIN, "skills", "start", "SKILL.md"), "utf8");
    const discover = readFileSync(
      join(PLUGIN, "skills", "discover", "SKILL.md"),
      "utf8",
    );
    const qa = readFileSync(join(PLUGIN, "skills", "qa", "SKILL.md"), "utf8");
    const close = readFileSync(join(PLUGIN, "skills", "close", "SKILL.md"), "utf8");
    const qaEvidence = readFileSync(
      join(PLUGIN, "skills", "close", "references", "qa-evidence.md"),
      "utf8",
    );

    expect(start).toMatch(/^name: start$/m);
    expect(start).not.toContain("user-invocable");
    expect(start).toContain("## 1. Settle release and ownership");
    expect(start).toMatch(/land on green, or hold for you/i);
    expect(start).toContain("## 5. Confirm the review and delivery routes");
    expect(start).toContain("gh auth status");
    expect(discover).toMatch(/^name: discover$/m);
    expect(discover).not.toContain("user-invocable");
    expect(qa).toMatch(/^name: qa$/m);
    expect(qa).not.toContain("user-invocable");
    expect(qa).toContain("qa/accepted.json");
    expect(close).toMatch(/^name: close$/m);
    expect(close).not.toContain("user-invocable");
    expect(close).toContain("references/qa-evidence.md");
    expect(close).toContain("../code-review/SKILL.md");
    expect(close).toContain("review/accepted.json");
    expect(close).toMatch(/After the labeled PR exists and before arming auto-merge/i);
    expect(close).toMatch(/poll its required checks for up to five minutes/i);
    expect(sha256(qaEvidence)).toBe(
      "2a24d58732beba3788e048a0c6f03c0e7aaef733dfe89f3ace454cfd8ac01a56",
    );
  });

  it("publishes the plugin through the marketplace", () => {
    const marketplace = json(join(ROOT, ".agents", "plugins", "marketplace.json"));
    expect(marketplace.plugins).toEqual([
      expect.objectContaining({
        name: "bottega-dex",
        source: { source: "local", path: "./plugins/bottega-dex" },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
        category: "Coding",
      }),
    ]);

    const manifest = json(join(PLUGIN, ".codex-plugin", "plugin.json"));
    expect(manifest).toMatchObject({
      name: "bottega-dex",
      version: "0.8.0",
      skills: "./skills/",
    });
    expect(manifest.interface.defaultPrompt).toEqual([
      "$bottega-dex:maestro Take this task through discovery, orchestration, dual review, QA, and a pull request.",
    ]);
  });
});
