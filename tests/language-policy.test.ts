import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const FILES = [
  "README.md",
  "AGENTS.md",
  "plugins/bottega-dex/skills/run/SKILL.md",
  "plugins/bottega-dex/skills/implementing/SKILL.md",
  "plugins/bottega-dex/skills/reviewing/SKILL.md",
  "plugins/bottega-dex/skills/panel/SKILL.md",
  "plugins/bottega-dex/skills/codebase-design/SKILL.md",
  "plugins/bottega-dex/skills/setup/SKILL.md",
  "plugins/bottega-dex/skills/run/references/agents/mechanic.md",
  "plugins/bottega-dex/skills/run/references/agents/builder.md",
  "plugins/bottega-dex/skills/run/references/agents/reviewer.md",
  "plugins/bottega-dex/skills/run/references/agents/qa.md",
  "plugins/bottega-dex/skills/panel/references/agents/panelist.md",
  "plugins/bottega-dex/skills/panel/references/agents/panel-judge.md",
];

describe("language policy", () => {
  it.each(FILES)("keeps %s in plain engineering English", (path) => {
    const text = readFileSync(join(ROOT, path), "utf8");
    expect(text).not.toContain(String.fromCodePoint(0x2014));
    expect(text).not.toMatch(/\bbearing\b/i);
    expect(text).not.toMatch(/\bledger\b/i);
  });
});
