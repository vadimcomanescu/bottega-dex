import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const PLUGIN = join(ROOT, "plugins", "bottega-dex");
const MAESTRO = readFileSync(join(PLUGIN, "skills", "maestro", "SKILL.md"), "utf8");
const DISCOVER = readFileSync(join(PLUGIN, "skills", "discover", "SKILL.md"), "utf8");
const ORCHESTRATE = readFileSync(
  join(PLUGIN, "skills", "orchestrate", "SKILL.md"),
  "utf8",
);
const REVIEW = readFileSync(
  join(PLUGIN, "skills", "code-review", "SKILL.md"),
  "utf8",
);
const OPEN = readFileSync(join(PLUGIN, "skills", "open", "SKILL.md"), "utf8");
const QA = readFileSync(join(PLUGIN, "skills", "qa", "SKILL.md"), "utf8");
const CLOSE = readFileSync(join(PLUGIN, "skills", "close", "SKILL.md"), "utf8");
const ADAPTER = readFileSync(join(PLUGIN, "scripts", "claude-exec"), "utf8");

describe("integrated review flow", () => {
  it("runs the requested maestro phases in order without spec or plan", () => {
    const phases = [
      "## 1. Open",
      "## 2. Discover",
      "## 3. Orchestrate",
      "## 4. Review",
      "## 5. QA",
      "## 6. Open the pull request",
    ];
    const indexes = phases.map((phase) => MAESTRO.indexOf(phase));

    expect(indexes.every((index) => index >= 0)).toBe(true);
    expect(indexes).toEqual([...indexes].sort((left, right) => left - right));
    const orchestrateBody = ORCHESTRATE.split("# Orchestrate\n\n")[1]!.trim();
    expect(MAESTRO).toContain(orchestrateBody);
    expect(MAESTRO).not.toContain("[orchestrate](../orchestrate/SKILL.md)");
    expect(MAESTRO).toMatch(/Do not insert a separate specification or planning phase/i);
    expect(MAESTRO).not.toMatch(/^## \d+\. (Spec|Plan)$/m);
    expect(DISCOVER).toMatch(/directly to `maestro`/i);
    expect(ORCHESTRATE).not.toMatch(/code-review|pull request|maestro/i);
  });

  it("reviews the complete frozen work with blind Sol and Opus 5 seats", () => {
    expect(REVIEW).toMatch(/complete integrated|integrated diff/i);
    expect(REVIEW).toContain('model: "gpt-5.6-sol"');
    expect(REVIEW).toContain("claude-opus-5");
    expect(REVIEW).toMatch(/parallel/i);
    expect(REVIEW).toMatch(/separate disposable detached worktrees/i);
    expect(REVIEW).toMatch(/Neither reviewer sees the other report/i);
    expect(REVIEW).toMatch(/tracked change invalidates both reports/i);
    expect(REVIEW).not.toMatch(/\bcodex exec\b|codex-exec/);
  });

  it("opens only when both review routes are ready and closes only the accepted head", () => {
    expect(OPEN).toContain("gpt-5.6-sol");
    expect(OPEN).toContain("claude auth status");
    expect(OPEN).toContain("report.schema.json");
    expect(QA).toContain("review/accepted.json");
    expect(QA).toContain("qa/accepted.json");
    expect(QA).toMatch(/never product code/i);
    expect(CLOSE).toContain("review/accepted.json");
    expect(CLOSE).toContain("qa/accepted.json");
    expect(CLOSE).toContain("gpt-5.6-sol");
    expect(CLOSE).toContain("claude-opus-5");
  });

  it("keeps the external adapter review-only and pins Claude Opus 5", () => {
    expect(ADAPTER).toContain('model: "claude-opus-5"');
    expect(ADAPTER).toContain('effort: "high"');
    expect(ADAPTER).not.toContain("panelist:");
    expect(ADAPTER).not.toContain("judge:");
  });
});
