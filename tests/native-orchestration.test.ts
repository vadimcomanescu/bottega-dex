import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const PLUGIN = join(ROOT, "plugins", "bottega-dex");
const PRODUCT_FILES = [
  join(ROOT, "README.md"),
  join(ROOT, "AGENTS.md"),
  join(PLUGIN, "skills", "run", "SKILL.md"),
  join(PLUGIN, "skills", "run", "references", "dispatch.md"),
  join(PLUGIN, "skills", "panel", "SKILL.md"),
];
const RUN_ROLES = ["mechanic", "builder", "reviewer", "qa"];
const PANEL_ROLES = ["panelist", "panel-judge"];

describe("native Codex orchestration", () => {
  it("contains no nested Codex process launch contract", () => {
    const text = PRODUCT_FILES.map((path) => readFileSync(path, "utf8")).join("\n");
    expect(text).not.toMatch(/\bcodex exec\b|codex-exec|worker-exec|panel-run/i);
    expect(existsSync(join(PLUGIN, "scripts", "codex-exec"))).toBe(false);
    expect(existsSync(join(PLUGIN, "scripts", "worker-exec"))).toBe(false);
    expect(existsSync(join(PLUGIN, "scripts", "panel-run"))).toBe(false);
  });

  it("uses native subagents for Codex work and Claude only for cross-family calls", () => {
    const run = readFileSync(join(PLUGIN, "skills", "run", "SKILL.md"), "utf8");
    const panel = readFileSync(join(PLUGIN, "skills", "panel", "SKILL.md"), "utf8");
    expect(run).toMatch(/native Codex subagent/i);
    expect(run).toContain("gpt-5.6-luna");
    expect(run).toContain("gpt-5.6-sol");
    expect(run).toContain("claude-exec");
    expect(panel).toMatch(/native Codex subagent/i);
    expect(panel).toContain("claude-exec");
    expect(panel).toMatch(/panelist\.md.*the question.*panelist\.schema\.json/i);
    expect(panel).not.toMatch(/Give it this skill/i);
    expect(panel).toMatch(/identical role prompt, question, and schema/i);
    expect(panel).toMatch(/compare.*only/i);
    expect(panel).toMatch(/Do not include provider, model, or role identities/i);
  });

  it("ships explicit plugin-owned role prompts for every worker identity", () => {
    for (const role of RUN_ROLES) {
      const path = join(PLUGIN, "skills", "run", "references", "agents", `${role}.md`);
      expect(existsSync(path), path).toBe(true);
      const prompt = readFileSync(path, "utf8");
      expect(prompt).toMatch(/do not delegate/i);
      expect(prompt).toMatch(/stop/i);
      expect(prompt).toMatch(/return/i);
    }
    for (const role of PANEL_ROLES) {
      const path = join(PLUGIN, "skills", "panel", "references", "agents", `${role}.md`);
      expect(existsSync(path), path).toBe(true);
      const prompt = readFileSync(path, "utf8");
      expect(prompt).toMatch(/do not delegate/i);
      expect(prompt).toMatch(/stop/i);
      expect(prompt).toMatch(/return/i);
    }
  });

  it("dispatches role prompts without handing workers an orchestration skill", () => {
    const run = readFileSync(join(PLUGIN, "skills", "run", "SKILL.md"), "utf8");
    const dispatch = readFileSync(
      join(PLUGIN, "skills", "run", "references", "dispatch.md"),
      "utf8",
    );
    const panel = readFileSync(join(PLUGIN, "skills", "panel", "SKILL.md"), "utf8");
    expect(run).toContain("references/agents/builder.md");
    expect(run).toContain("references/agents/reviewer.md");
    expect(run).toContain("references/agents/qa.md");
    expect(dispatch).toMatch(/role prompt.*absolute path/i);
    expect(panel).toContain("references/agents/panelist.md");
    expect(panel).toContain("references/agents/panel-judge.md");
    expect(panel).not.toMatch(/Give it this skill/i);
  });
});
