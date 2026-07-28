import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const PLUGIN = join(ROOT, "plugins", "bottega-dex");
const skill = (name: string) =>
  readFileSync(join(PLUGIN, "skills", name, "SKILL.md"), "utf8");

const MAESTRO = skill("maestro");
const DISCOVER = skill("discover");
const ORCHESTRATE = skill("orchestrate");
const REVIEW = skill("code-review");
const PANEL = skill("panel");
const USE_CLAUDE = skill("use-claude");
const QA = skill("qa");
const CLOSE = skill("close");
const ADAPTER = readFileSync(join(PLUGIN, "scripts", "claude-exec"), "utf8");

describe("Bottega Dex workflow", () => {
  it("follows Bottega's workflow and invokes orchestrate after the plan is ready", () => {
    const phases = [
      "[start](../start/SKILL.md)",
      "[discover](../discover/SKILL.md)",
      "[architect](../architect/SKILL.md)",
      "[panel](../panel/SKILL.md)",
      "[use-claude](../use-claude/SKILL.md)",
      "[orchestrate](../orchestrate/SKILL.md)",
      "[code-review](../code-review/SKILL.md)",
      "[qa](../qa/SKILL.md)",
      "[close](../close/SKILL.md)",
    ];
    const indexes = phases.map((phase) => MAESTRO.indexOf(phase));

    expect(indexes.every((index) => index >= 0)).toBe(true);
    expect(indexes).toEqual([...indexes].sort((left, right) => left - right));
    expect(MAESTRO).toMatch(/Then use \[orchestrate\]/);
    expect(MAESTRO).toMatch(/Its method is authoritative/);
    expect(MAESTRO).not.toMatch(/(?:Fable|Opus) (?:worker|builder|fixer)/i);
    expect(MAESTRO).toContain("Claude Fable 5 at high effort");
    expect(DISCOVER).toContain('`fork_turns: "none"`');
    expect(ORCHESTRATE).not.toMatch(/code-review|pull request|maestro/i);
  });

  it("routes work through native Codex subagents", () => {
    expect(MAESTRO).toContain('reasoning_effort: "medium"');
    expect(MAESTRO).toContain('`"high"` for difficult work');
    expect(MAESTRO).toMatch(/distinct ownership/i);
    expect(MAESTRO).toMatch(/leaf workers not to delegate/i);
    expect(MAESTRO).toMatch(/Remain available to the user/i);
    expect(MAESTRO).toMatch(/Keep approvals.*with the user/i);
  });

  it("uses direct Claude only for cross-reads and panels", () => {
    expect(USE_CLAUDE).toContain(
      "claude -p --safe-mode --model claude-fable-5 --effort high",
    );
    expect(USE_CLAUDE).toContain("--setting-sources user");
    expect(USE_CLAUDE).toContain("not the `claude-exec` adapter");
    expect(PANEL).toMatch(/native Codex subagent at high reasoning/i);
    expect(PANEL).toContain("Claude Fable 5 at high effort");
    expect(PANEL).toMatch(/comparison seat/i);
    expect(PANEL).toMatch(/Do not answer the task, merge the drafts, vote, grade, or pick one/);
  });

  it("bundles Bottega autoreview and pins the integrated dual review", () => {
    expect(REVIEW).toContain("Run the bundled structured review helper");
    expect(REVIEW).toContain("--reviewers codex,claude");
    expect(REVIEW).toContain("<absolute-code-review-skill-directory>/scripts/autoreview");
    expect(REVIEW).toContain("--model codex=gpt-5.6-sol --thinking codex=high");
    expect(REVIEW).toContain("--model claude=claude-opus-5 --thinking claude=high");
    expect(REVIEW).toMatch(/Do not run autoreview.*`SKILL\.md`/i);
    expect(MAESTRO).toMatch(/Do not run autoreview on `SKILL\.md`/i);
    expect(MAESTRO).toMatch(/pinned cross-family rerun rule/i);
  });

  it("keeps review, QA, close, and the reviewer adapter at their boundaries", () => {
    expect(QA).toMatch(/Product code.*stay as you found them/i);
    expect(CLOSE).toMatch(/head accepted by autoreview/i);
    expect(CLOSE).toContain("references/qa-evidence.md");
    expect(ADAPTER).toContain('model: "claude-opus-5"');
    expect(ADAPTER).toContain('effort: "high"');
    expect(ADAPTER).not.toContain("panelist:");
    expect(ADAPTER).not.toContain("judge:");
  });
});
