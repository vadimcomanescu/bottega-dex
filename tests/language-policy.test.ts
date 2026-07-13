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
];

describe("language policy", () => {
  it.each(FILES)("keeps %s in plain engineering English", (path) => {
    const text = readFileSync(join(ROOT, path), "utf8");
    expect(text).not.toContain("—");
    expect(text).not.toMatch(/\bbearing\b/i);
    expect(text).not.toMatch(/\bledger\b/i);
  });
});
