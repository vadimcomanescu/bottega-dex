import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const PLUGIN = join(ROOT, "plugins", "bottega-dex");

function json(path: string) {
  return JSON.parse(readFileSync(path, "utf8"));
}

describe("Codex plugin package", () => {
  it("publishes one canonical marketplace entry", () => {
    const marketplace = json(join(ROOT, ".agents", "plugins", "marketplace.json"));
    expect(marketplace.name).toBe("bottega-dex");
    expect(marketplace.plugins).toEqual([
      expect.objectContaining({
        name: "bottega-dex",
        source: { source: "local", path: "./plugins/bottega-dex" },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
        category: "Coding",
      }),
    ]);
  });

  it("has an installable manifest with real publisher metadata", () => {
    const manifest = json(join(PLUGIN, ".codex-plugin", "plugin.json"));
    expect(manifest.name).toBe("bottega-dex");
    expect(manifest.version).toMatch(/^0\.1\.0(?:\+codex\.[0-9-]+)?$/);
    expect(manifest.author.name).toBe("Vadim Comanescu");
    expect(manifest.repository).toBe("https://github.com/vadimcomanescu/bottega-dex");
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.interface.defaultPrompt).toBeInstanceOf(Array);
  });

  it("defines the Sol Ultra orchestrator and the fixed worker routes", () => {
    const runSkill = readFileSync(join(PLUGIN, "skills", "run", "SKILL.md"), "utf8");
    expect(runSkill).toContain("GPT-5.6 Sol at Ultra");
    expect(runSkill).toContain("gpt-5.6-luna");
    expect(runSkill).toContain("gpt-5.6-sol");
    expect(runSkill).toContain("claude-exec");
    expect(runSkill).toContain("cross-family review");
  });

  it("ships default Codex hooks that resolve from the installed plugin root", () => {
    const hooks = json(join(PLUGIN, "hooks", "hooks.json"));
    const serialized = JSON.stringify(hooks);
    expect(serialized).toContain("${PLUGIN_ROOT}");
    expect(serialized).not.toContain("CLAUDE_PLUGIN_ROOT");
  });
});
