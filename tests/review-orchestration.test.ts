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
const START = readFileSync(join(PLUGIN, "skills", "start", "SKILL.md"), "utf8");
const QA = readFileSync(join(PLUGIN, "skills", "qa", "SKILL.md"), "utf8");
const CLOSE = readFileSync(join(PLUGIN, "skills", "close", "SKILL.md"), "utf8");
const ADAPTER = readFileSync(join(PLUGIN, "scripts", "claude-exec"), "utf8");
const AUTOREVIEW = readFileSync(
  join(PLUGIN, "skills", "code-review", "references", "autoreview.md"),
  "utf8",
);

describe("integrated review flow", () => {
  it("runs the requested maestro phases in order", () => {
    const phases = [
      "## 1. Start",
      "## 2. Discover",
      "## 3. Orchestrate",
      "## 4. Review",
      "## 5. QA",
      "## 6. Close",
    ];
    const indexes = phases.map((phase) => MAESTRO.indexOf(phase));

    expect(indexes.every((index) => index >= 0)).toBe(true);
    expect(indexes).toEqual([...indexes].sort((left, right) => left - right));
    const orchestrateBody = ORCHESTRATE.split("# Orchestrate\n\n")[1]!.trim();
    expect(MAESTRO).toContain(orchestrateBody);
    expect(MAESTRO).not.toContain("[orchestrate](../orchestrate/SKILL.md)");
    expect(MAESTRO).not.toMatch(/\bwhole\b|specification or planning|bounded repair|durable state|Unproven means/i);
    expect(MAESTRO).toMatch(/one or more subagents depending on the size/i);
    expect(MAESTRO).toMatch(/respecting the repository's implementation methodologies/i);
    expect(DISCOVER).toMatch(/directly to `maestro`/i);
    expect(ORCHESTRATE).not.toMatch(/code-review|pull request|maestro/i);
  });

  it("reviews the integrated work through Bottega's autoreview panel", () => {
    expect(REVIEW).toContain("Run [autoreview](references/autoreview.md) on the completed work.");
    expect(REVIEW).not.toMatch(/--reviewers|--model|--thinking|verify every finding|fix accepted|rerun/i);
    expect(AUTOREVIEW).toMatch(/^name: autoreview$/m);
    expect(AUTOREVIEW).toContain("# Auto Review");
    expect(AUTOREVIEW).toContain("--reviewers codex,claude");
    expect(AUTOREVIEW).toContain("--model claude=claude-opus-5 --thinking claude=high");
  });

  it("leaves review mechanics to autoreview", () => {
    expect(START).not.toMatch(/autoreview|claude auth status/i);
    expect(START).toContain("gh auth status");
    expect(QA).toMatch(/product code stays untouched/i);
    expect(QA).toMatch(/one or more subagents depending on their size/i);
    expect(CLOSE).toMatch(/head accepted by autoreview/i);
  });

  it("keeps the external adapter review-only and pins Claude Opus 5", () => {
    expect(ADAPTER).toContain('model: "claude-opus-5"');
    expect(ADAPTER).toContain('effort: "high"');
    expect(ADAPTER).not.toContain("panelist:");
    expect(ADAPTER).not.toContain("judge:");
  });
});
