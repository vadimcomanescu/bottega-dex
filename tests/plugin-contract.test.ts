import { existsSync, readFileSync } from "node:fs";
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

  it("has a release-ready 0.3.0 manifest", () => {
    const manifest = json(join(PLUGIN, ".codex-plugin", "plugin.json"));
    expect(manifest.name).toBe("bottega-dex");
    expect(manifest.version).toMatch(/^0\.3\.0(?:\+codex\.[0-9-]+)?$/);
    expect(manifest.author.name).toBe("Vadim Comanescu");
    expect(manifest.repository).toBe("https://github.com/vadimcomanescu/bottega-dex");
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.interface.defaultPrompt).toBeInstanceOf(Array);
  });

  it("defines routing as a workflow preference, not installed agent config", () => {
    const run = readFileSync(join(PLUGIN, "skills", "run", "SKILL.md"), "utf8");
    const readme = readFileSync(join(ROOT, "README.md"), "utf8");
    const productText = `${run}\n${readme}`;

    expect(productText).toMatch(/GPT-5\.6.*Ultra/i);
    expect(productText).toMatch(/Luna|gpt-5\.6-terra/i);
    expect(productText).toMatch(/Sol|gpt-5\.6/i);
    expect(productText).toMatch(/native (Codex )?subagents/i);
    expect(productText).toMatch(/Claude/i);
    expect(productText).toContain("claude-exec");
    expect(productText).not.toMatch(/CLIProxyAPI/i);
    expect(productText).not.toContain("$bottega-dex:setup");
    expect(productText).not.toMatch(/custom-agent|custom agent/i);
    expect(existsSync(join(PLUGIN, "skills", "setup"))).toBe(false);
  });

  it("keeps the run skill concise enough to leave judgment to Codex", () => {
    const run = readFileSync(join(PLUGIN, "skills", "run", "SKILL.md"), "utf8");
    const body = run.replace(/^---[\s\S]*?---\s*/, "");
    expect(body.trim().split(/\s+/).length).toBeLessThanOrEqual(900);
  });
});
