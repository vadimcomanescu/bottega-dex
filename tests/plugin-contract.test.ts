import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const PLUGIN = join(ROOT, "plugins", "bottega-dex");
const README = readFileSync(join(ROOT, "README.md"), "utf8");
const AGENTS = readFileSync(join(ROOT, "AGENTS.md"), "utf8");

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

describe("Codex plugin package", () => {
  it("contains the complete maestro workflow and Claude adapter", () => {
    const files = filesUnder(PLUGIN).sort();
    expect(files).toEqual(expect.arrayContaining([
      ".codex-plugin/plugin.json",
      "scripts/claude-exec",
      "scripts/exec-common.js",
      "skills/bro/SKILL.md",
      "skills/bro/agents/openai.yaml",
      "skills/close/SKILL.md",
      "skills/close/references/qa-evidence.md",
      "skills/code-review/SKILL.md",
      "skills/code-review/LICENSE",
      "skills/code-review/references/smell-baseline.md",
      "skills/code-review/scripts/autoreview",
      "skills/code-review/scripts/autoreview_test.py",
      "skills/code-review/scripts/test-review-harness",
      "skills/code-review/scripts/test-review-harness.py",
      "skills/code-review/scripts/test-review-harness.ps1",
      "skills/code-review/tests/test_autoreview_hardening.py",
      "skills/architect/SKILL.md",
      "skills/architect/references/ADR-FORMAT.md",
      "skills/architect/references/CONTEXT-FORMAT.md",
      "skills/architect/references/LICENSE",
      "skills/discover/SKILL.md",
      "skills/implement/SKILL.md",
      "skills/maestro/SKILL.md",
      "skills/orchestrate/agents/openai.yaml",
      "skills/orchestrate/SKILL.md",
      "skills/panel/SKILL.md",
      "skills/qa/SKILL.md",
      "skills/start/SKILL.md",
      "skills/use-claude/SKILL.md",
    ]));
    expect(files).not.toContain("skills/code-review/references/autoreview.md");
    expect(files).not.toContain("skills/code-review/references/report.schema.json");
    expect(files).not.toContain("skills/code-review/references/reviewer.md");
  });

  it("keeps the orchestrate skill identical to the selected upstream source", () => {
    const skill = readFileSync(
      join(PLUGIN, "skills", "orchestrate", "SKILL.md"),
      "utf8",
    );
    expect(skill).toBe(UPSTREAM_SKILL);
    expect(skill).not.toContain("user-invocable: false");

    const metadata = readFileSync(
      join(PLUGIN, "skills", "orchestrate", "agents", "openai.yaml"),
      "utf8",
    );
    expect(metadata).toContain('display_name: "Orchestrate"');
    expect(metadata).toContain(
      'default_prompt: "Use $bottega-dex:orchestrate ',
    );
  });

  it("exposes bro as an independently invocable skill", () => {
    const bro = readFileSync(join(PLUGIN, "skills", "bro", "SKILL.md"), "utf8");
    const metadata = readFileSync(
      join(PLUGIN, "skills", "bro", "agents", "openai.yaml"),
      "utf8",
    );

    expect(bro).toMatch(/^name: bro$/m);
    expect(bro).not.toContain("disable-model-invocation");
    expect(bro).toContain("Restate your last message");
    expect(bro).toContain("ASD-STE100 Simplified Technical English");
    expect(bro).not.toMatch(/certif(?:y|ied|ication)/i);
    expect(metadata).toContain('display_name: "Bro"');
    expect(metadata).toContain('default_prompt: "Use $bottega-dex:bro ');
  });

  it("keeps the imported supporting procedures Codex-valid", () => {
    const start = readFileSync(join(PLUGIN, "skills", "start", "SKILL.md"), "utf8");
    const discover = readFileSync(
      join(PLUGIN, "skills", "discover", "SKILL.md"),
      "utf8",
    );
    const qa = readFileSync(join(PLUGIN, "skills", "qa", "SKILL.md"), "utf8");
    const architect = readFileSync(
      join(PLUGIN, "skills", "architect", "SKILL.md"),
      "utf8",
    );
    const implement = readFileSync(
      join(PLUGIN, "skills", "implement", "SKILL.md"),
      "utf8",
    );
    const panel = readFileSync(join(PLUGIN, "skills", "panel", "SKILL.md"), "utf8");
    const useClaude = readFileSync(
      join(PLUGIN, "skills", "use-claude", "SKILL.md"),
      "utf8",
    );
    const close = readFileSync(join(PLUGIN, "skills", "close", "SKILL.md"), "utf8");
    const qaEvidence = readFileSync(
      join(PLUGIN, "skills", "close", "references", "qa-evidence.md"),
      "utf8",
    );

    expect(start).toMatch(/^name: start$/m);
    expect(start).not.toContain("user-invocable");
    expect(start).toContain("## 1. Settle release and ownership");
    expect(start).toMatch(/land on green, or hold for you/i);
    expect(start).toMatch(/atomic claim is the create-only remote branch push/i);
    expect(start).toContain("## 4. Read the commands and merge procedure");
    expect(start).toMatch(/opening an eligible non-draft PR enters a merge queue/i);
    expect(start).toContain("## 5. Confirm GitHub publication");
    expect(start).toContain("gh auth status");
    expect(discover).toMatch(/^name: discover$/m);
    expect(discover).not.toContain("user-invocable");
    expect(discover).toContain('`fork_turns: "none"`');
    expect(discover).toMatch(/low reasoning for a narrow read-only scout/i);
    expect(architect).toMatch(/^name: architect$/m);
    expect(architect).not.toContain("user-invocable");
    expect(architect).toContain("references/CONTEXT-FORMAT.md");
    expect(implement).toMatch(/^name: implement$/m);
    expect(implement).not.toContain("user-invocable");
    expect(panel).toMatch(/^name: panel$/m);
    expect(panel).toContain("Claude Fable 5 at high effort");
    expect(useClaude).toMatch(/^name: use-claude$/m);
    expect(useClaude).not.toContain("user-invocable");
    expect(useClaude).toContain("claude -p --safe-mode --model claude-fable-5 --effort high");
    expect(useClaude).toContain("--tools Read,WebSearch");
    expect(qa).toMatch(/^name: qa$/m);
    expect(qa).not.toContain("user-invocable");
    expect(qa).toMatch(/product code.*stay as you found them/i);
    expect(close).toMatch(/^name: close$/m);
    expect(close).not.toContain("user-invocable");
    expect(close).toContain("references/qa-evidence.md");
    expect(close).toContain("../code-review/SKILL.md");
    expect(close).toMatch(/head accepted by autoreview/i);
    expect(close).toMatch(/opening an eligible non-draft PR is the arm/i);
    expect(close).toMatch(/For Mergify this is the Mergify summary/i);
    expect(close).toMatch(/project checks remain ordinary checks and are not expected to turn red/i);
    expect(close).toMatch(/Opener-armed auto-merge fallback/i);
    expect(close).toMatch(/poll its required checks for up to five minutes/i);
    expect(close).toMatch(/non-null on both land and hold runs/i);
    expect(close).toMatch(/hold check and queue summary are merge-control signals/i);
    expect(close).toMatch(/An `autoMergeRequest` of null is expected/i);
    expect(close).not.toContain("gh pr merge --squash <PR-URL>");
    expect(qaEvidence).toMatch(/artifacts QA actually captured/i);
    expect(qaEvidence).toMatch(/recordings when the driving tool produced them/i);
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
    const packageJson = json(join(ROOT, "package.json"));
    const packageLock = json(join(ROOT, "package-lock.json"));
    expect(manifest).toMatchObject({
      name: "bottega-dex",
      version: "0.9.4",
      skills: "./skills/",
    });
    expect(packageJson.version).toBe("0.9.4");
    expect(packageLock.version).toBe("0.9.4");
    expect(packageLock.packages[""].version).toBe("0.9.4");
    expect(manifest.interface.defaultPrompt).toEqual([
      "$bottega-dex:maestro Take this task through adaptive delivery, dual review, any required QA, and a pull request.",
    ]);
  });

  it("documents the adaptive ordered workflow and selected Bottega snapshot", () => {
    expect(README).toContain("1de2acabd1004ebd9cae697e89f9b2889571bea9");
    expect(README).toContain(
      "start → discover → architect when needed → panel when its three conditions hold → Claude cross-read when reversal is costly → orchestrate → code-review → QA when user-facing behavior changes → close",
    );
    expect(README).toMatch(/Architect runs only when.*acceptance criteria.*slices need settling/i);
    expect(README).toMatch(/Claude cross-read runs only when.*costly to reverse/i);
    expect(README).toMatch(/QA runs only when.*user-facing surface or product behavior changed/i);
    expect(README).toMatch(/skip a later phase only when nothing.*unclear.*cheap to reverse/i);
    expect(README).toMatch(/isolated branch and worktree.*project gates.*whole-diff review.*pull request/i);
    expect(README).toMatch(/QA is required when.*user-facing surface or product behavior/i);
    expect(README).toMatch(/no user-facing surface or product behavior.*skips QA/i);
    expect(README).toMatch(/single builder.*structured whole-diff review will run/is);
    expect(README).toMatch(/SKILL.*prose exception.*fresh high-reasoning.*whole docs diff/is);
    expect(AGENTS).toMatch(/fixed phase order.*start.*discover.*architect.*panel.*use-claude.*orchestrate.*code-review.*qa.*close/is);
    expect(AGENTS).toMatch(/must re-enter a skipped phase/i);
    expect(AGENTS).toMatch(/QA is required when.*user-facing surface or product behavior/i);
    expect(AGENTS).toMatch(/SKILL.*prose exception.*fresh high-reasoning.*whole docs diff/is);
  });
});
