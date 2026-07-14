import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const PLUGIN = join(ROOT, "plugins", "bottega-dex");
const SKILLS = join(PLUGIN, "skills");
const RUN = join(SKILLS, "run");
const REFERENCES = join(RUN, "references");
const AGENTS = join(REFERENCES, "agents");

describe("minimal native Codex architecture", () => {
  it("exposes one workflow skill and no host-agent setup surface", () => {
    const skillDirs = readdirSync(SKILLS, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    expect(skillDirs).toEqual(["run"]);
    expect(existsSync(join(PLUGIN, "assets", "custom-agents"))).toBe(false);
    expect(existsSync(join(PLUGIN, "hooks"))).toBe(false);
    expect(existsSync(join(PLUGIN, "scripts", "claude-exec"))).toBe(true);
  });

  it("uses the native harness instead of a nested Codex process", () => {
    const productText = [
      join(ROOT, "README.md"),
      join(ROOT, "AGENTS.md"),
      join(RUN, "SKILL.md"),
    ].map((path) => readFileSync(path, "utf8")).join("\n");

    expect(productText).toMatch(/native (Codex )?subagents/i);
    expect(productText).not.toMatch(/\bcodex exec\b|codex-exec|worker-exec|panel-run/i);
    expect(existsSync(join(PLUGIN, "scripts", "codex-exec"))).toBe(false);
  });

  it("ships focused worker prompts without separate internal skills", () => {
    for (const role of [
      "mechanic",
      "builder",
      "reviewer",
      "qa",
      "panelist",
      "panel-judge",
    ]) {
      const path = join(AGENTS, `${role}.md`);
      expect(existsSync(path), path).toBe(true);
      const prompt = readFileSync(path, "utf8");
      expect(prompt).toMatch(/do not delegate/i);
      expect(prompt).toMatch(/return/i);
    }

    const builder = readFileSync(join(AGENTS, "builder.md"), "utf8");
    const reviewer = readFileSync(join(AGENTS, "reviewer.md"), "utf8");
    expect(builder).toMatch(/failing test|decisive verifier/i);
    expect(builder).not.toMatch(/implementing\/SKILL\.md/i);
    expect(reviewer).toMatch(/frozen diff/i);
    expect(reviewer).toMatch(/report\.schema\.json/i);
    expect(reviewer).not.toMatch(/reviewing\/SKILL\.md/i);
    expect(existsSync(join(REFERENCES, "report.schema.json"))).toBe(true);
    expect(existsSync(join(REFERENCES, "panel.md"))).toBe(true);
    expect(existsSync(join(REFERENCES, "panelist.schema.json"))).toBe(true);
    expect(existsSync(join(REFERENCES, "judge.schema.json"))).toBe(true);
  });

  it("parallelizes independent reads and cold review, not routine writes", () => {
    const run = readFileSync(join(RUN, "SKILL.md"), "utf8");
    expect(run).toMatch(/one builder at a time|sequential.*builder/i);
    expect(run).not.toMatch(/parallel builders|parallel writes/i);
    expect(run).toMatch(/parallel.*independent.*read|independent.*read.*parallel/i);
    expect(run).toMatch(/complete integrated diff|whole integrated diff/i);
    expect(run).toMatch(/Codex.*Claude|Claude.*Codex/i);
    expect(run).toMatch(/same frozen|identical frozen|same.*base.*head.*tree/i);
    expect(run).toMatch(/never skip|mandatory|always/i);
    expect(run).toMatch(/panel\.md/i);
    expect(run).toMatch(/head change.*invalidates|fix.*invalidates.*review/i);
    expect(run).toMatch(/candidate findings/i);
    expect(run).toContain("references/agents/mechanic.md");
    expect(run).toMatch(/--role.*--cwd.*--brief.*--out.*--events.*--head.*--tree.*--schema/is);
    expect(run).toMatch(/no inherited conversation|without inherited conversation/i);
    expect(run).toMatch(/host-routed|do not claim.*model/i);
    expect(run).toContain("--repo");
  });
});
