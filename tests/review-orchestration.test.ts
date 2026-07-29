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
    expect(MAESTRO).not.toMatch(/(?:Fable|Opus) (?:worker|builder|fixer)/i);
    expect(MAESTRO).toContain("Claude Fable 5 at high effort");
    expect(DISCOVER).toContain('`fork_turns: "none"`');
    expect(ORCHESTRATE).not.toMatch(/code-review|pull request|maestro/i);
  });

  it("routes work through native Codex subagents", () => {
    expect(ORCHESTRATE).toContain('reasoning_effort: "medium"');
    expect(ORCHESTRATE).toContain('`"high"` for difficult work');
    expect(ORCHESTRATE).toMatch(/distinct ownership/i);
    expect(ORCHESTRATE).toMatch(/leaf workers not to delegate/i);
    expect(ORCHESTRATE).toMatch(/Remain available to the user/i);
    expect(MAESTRO).toMatch(/Keep approvals.*with the user/i);
  });

  it("adapts the middle phases without weakening delivery or user authority", () => {
    expect(MAESTRO).toMatch(/tell the user how much of the remaining process/i);
    expect(MAESTRO).toMatch(/nothing.*unclear.*cheap to reverse/i);
    expect(MAESTRO).toMatch(/worktree and branch.*project gates.*whole diff.*pull request/is);
    expect(MAESTRO).toMatch(/go back.*skipped/i);
    expect(MAESTRO).toMatch(/repository.*answer.*cheaply reversible/i);
    expect(MAESTRO).toMatch(/choice and (?:the )?reason.*keep moving/i);
    expect(MAESTRO).toMatch(/approvals.*consequential product choices.*rule exceptions.*irreversible actions/is);
    expect(MAESTRO).toMatch(/review fix.*promised contract/i);
    expect(MAESTRO).toMatch(/costly to reverse.*second opinion/is);
    expect(MAESTRO).toMatch(/revision.*new requirement.*user.*before.*builder/is);
    expect(MAESTRO).toMatch(/new requirement.*check,? gate,? or validator.*threat model/is);
    expect(MAESTRO).toMatch(/only one builder.*skip.*review only when.*integrated structured review.*will run/is);
    expect(MAESTRO).toMatch(/SKILL.*prose exception.*fresh high-reasoning review.*whole docs diff/is);
    expect(MAESTRO).toMatch(/more than one builder.*fresh.*review/is);
    expect(MAESTRO).toMatch(/user-facing surface or product behavior.*use \[qa\]/is);
    expect(MAESTRO).toMatch(/no user-facing surface or product behavior.*skip QA/is);
  });

  it("governs validator threat models and review repair cycles", () => {
    expect(MAESTRO).toMatch(/check,? gate,? or validator/i);
    expect(MAESTRO).toMatch(/threat model.*input or actor class.*deliberately excludes/is);
    expect(MAESTRO).toMatch(/rule on every finding.*threat model/is);
    expect(MAESTRO).toMatch(/record and reject.*out of (?:the )?threat model/is);
    expect(MAESTRO).toMatch(/fix.*change.*promised contract.*user/is);
    expect(MAESTRO).toMatch(/two.*cycles.*not converged.*pause.*reclassify.*code-review.*decide whether to continue or.*user/is);
    expect(MAESTRO).not.toMatch(/two.*cycles.*not converged.*stop dispatching and bring/is);

    expect(REVIEW).toMatch(/scope baseline:.*one sentence of threat model/is);
    expect(REVIEW).toContain("**Out of threat model**");
    expect(REVIEW).toMatch(/compute both numbers.*before each.*dispatch/i);
    expect(REVIEW).toMatch(/two-cycle pause.*inside the threat model.*cycles are narrowing/is);
    expect(REVIEW).toMatch(/`REVIEW\.md`.*smell-baseline\.md.*threat-model sentence/is);
    expect(REVIEW).toMatch(/never the run's other design decisions/i);
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
  });

  it("keeps review, QA, close, and the reviewer adapter at their boundaries", () => {
    expect(REVIEW).toContain("QA on the accepted head when required");
    expect(QA).toMatch(/Product code.*stay as you found them/i);
    expect(CLOSE).toMatch(/head accepted by autoreview/i);
    expect(CLOSE).toContain("references/qa-evidence.md");
    expect(CLOSE).toMatch(/merge-queue repository/i);
    expect(CLOSE).toMatch(/runs no merge command/i);
    expect(ADAPTER).toContain('model: "claude-opus-5"');
    expect(ADAPTER).toContain('effort: "high"');
    expect(ADAPTER).not.toContain("panelist:");
    expect(ADAPTER).not.toContain("judge:");
  });

  it("closes reviewed heads with QA only when Maestro required it", () => {
    expect(CLOSE).toMatch(
      /mandatory dual whole-diff review and any QA required for a user-facing surface or product behavior change/i,
    );
    expect(CLOSE).toMatch(
      /head accepted by autoreview and the head the PR will publish are one SHA/i,
    );
    expect(CLOSE).toMatch(
      /When QA ran, the head QA verified is that same SHA/i,
    );
    expect(CLOSE).toMatch(/When QA ran, put its evidence where the PR can read it/i);
    expect(CLOSE).toMatch(
      /When QA ran, the body also carries the QA evidence.*NOT VERIFIED/is,
    );
    expect(CLOSE).toMatch(
      /When QA ran, publish its fresh evidence and update the PR body's evidence links/i,
    );
    expect(CLOSE).toMatch(
      /When QA ran, rerun the affected QA scenarios on the updated head/i,
    );
    expect(CLOSE).toMatch(/When QA ran, include its evidence links/i);
    expect(CLOSE).not.toMatch(
      /The head accepted by autoreview, the head QA verified, and the head the PR will publish are one SHA/i,
    );
    expect(CLOSE).not.toMatch(/then review and QA the updated work again/i);
    expect(CLOSE).not.toMatch(/publish its fresh QA evidence/i);
  });
});
