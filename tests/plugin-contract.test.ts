import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const PLUGIN = join(ROOT, "plugins", "bottega-dex");
const README = readFileSync(join(ROOT, "README.md"), "utf8");
const AGENTS = readFileSync(join(ROOT, "AGENTS.md"), "utf8");

const UPSTREAM_SKILL = `---
name: orchestrate
description: Coordinate multiple agents on large-scope tasks. Use whenever the work is substantial; trivial tasks do not require this skill.
---

# Orchestrate

Remain available to the user while delegating substantive work. Run narrow, read-only scouts in parallel with \`reasoning_effort: "low"\` and \`fork_turns: "none"\`. Use \`reasoning_effort: "medium"\` for routine implementation and \`"high"\` for difficult work. Give each agent distinct ownership, prevent overlapping assignments, and instruct leaf workers not to delegate. Integrate the results and keep approvals with the user.
`;

function filesUnder(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(path, entry.name);
    return entry.isDirectory() ? filesUnder(entryPath) : [relative(PLUGIN, entryPath)];
  });
}

function json(path: string) {
  return JSON.parse(readFileSync(path, "utf8"));
}

describe("Codex plugin package", () => {
  it("contains the complete maestro workflow and Claude adapter", () => {
    const files = filesUnder(PLUGIN).sort();
    expect(files).toEqual(expect.arrayContaining([
      ".codex-plugin/plugin.json",
      "scripts/claude-exec",
      "scripts/exec-common.js",
      "skills/bro/SKILL.md",
      "skills/bro/agents/openai.yaml",
      "skills/improve/SKILL.md",
      "skills/improve/agents/openai.yaml",
      "skills/setup/SKILL.md",
      "skills/setup/agents/openai.yaml",
      "skills/setup/references/merge-governance.md",
      "skills/close/SKILL.md",
      "skills/close/references/qa-evidence.md",
      "skills/code-review/SKILL.md",
      "skills/code-review/LICENSE",
      "skills/code-review/references/smell-baseline.md",
      "skills/code-review/scripts/autoreview",
      "skills/code-review/scripts/autoreview_test.py",
      "skills/code-review/scripts/test-review-harness",
      "skills/code-review/scripts/test-review-harness.py",
      "skills/code-review/scripts/test-review-harness.ps1",
      "skills/code-review/tests/test_autoreview_hardening.py",
      "skills/architect/SKILL.md",
      "skills/domain-modeling/SKILL.md",
      "skills/domain-modeling/agents/openai.yaml",
      "skills/domain-modeling/references/ADR-FORMAT.md",
      "skills/domain-modeling/references/CONTEXT-FORMAT.md",
      "skills/domain-modeling/references/LICENSE",
      "skills/discover/SKILL.md",
      "skills/discover/agents/openai.yaml",
      "skills/implement/SKILL.md",
      "skills/maestro/SKILL.md",
      "skills/orchestrate/agents/openai.yaml",
      "skills/orchestrate/SKILL.md",
      "skills/panel/SKILL.md",
      "skills/prototype/SKILL.md",
      "skills/prototype/agents/openai.yaml",
      "skills/prototype/LICENSE",
      "skills/prototype/LOGIC.md",
      "skills/prototype/UI.md",
      "skills/qa/SKILL.md",
      "skills/spec/SKILL.md",
      "skills/start/SKILL.md",
      "skills/use-claude/SKILL.md",
    ]));
    expect(files).not.toContain("skills/code-review/references/autoreview.md");
    expect(files).not.toContain("skills/code-review/references/report.schema.json");
    expect(files).not.toContain("skills/code-review/references/reviewer.md");
    expect(files).not.toContain("skills/architect/references/ADR-FORMAT.md");
    expect(files).not.toContain("skills/architect/references/CONTEXT-FORMAT.md");
    expect(files).not.toContain("skills/architect/references/LICENSE");
  });

  it("keeps the orchestrate skill identical to the selected upstream source", () => {
    const skill = readFileSync(
      join(PLUGIN, "skills", "orchestrate", "SKILL.md"),
      "utf8",
    );
    expect(skill).toBe(UPSTREAM_SKILL);
    expect(skill).not.toContain("user-invocable: false");

    const metadata = readFileSync(
      join(PLUGIN, "skills", "orchestrate", "agents", "openai.yaml"),
      "utf8",
    );
    expect(metadata).toContain('display_name: "Orchestrate"');
    expect(metadata).toContain(
      'default_prompt: "Use $bottega-dex:orchestrate ',
    );
  });

  it("exposes bro as an independently invocable skill", () => {
    const bro = readFileSync(join(PLUGIN, "skills", "bro", "SKILL.md"), "utf8");
    const metadata = readFileSync(
      join(PLUGIN, "skills", "bro", "agents", "openai.yaml"),
      "utf8",
    );

    expect(bro).toMatch(/^name: bro$/m);
    expect(bro).not.toContain("disable-model-invocation");
    expect(bro).toContain("Restate your last message");
    expect(bro).toContain("ASD-STE100 Simplified Technical English");
    expect(bro).not.toMatch(/certif(?:y|ied|ication)/i);
    expect(metadata).toContain('display_name: "Bro"');
    expect(metadata).toContain('default_prompt: "Use $bottega-dex:bro ');
  });

  it("exposes domain modeling and prototype as opt-in Codex-native skills", () => {
    const domainModeling = readFileSync(
      join(PLUGIN, "skills", "domain-modeling", "SKILL.md"),
      "utf8",
    );
    const domainMetadata = readFileSync(
      join(PLUGIN, "skills", "domain-modeling", "agents", "openai.yaml"),
      "utf8",
    );
    const prototype = readFileSync(
      join(PLUGIN, "skills", "prototype", "SKILL.md"),
      "utf8",
    );
    const prototypeMetadata = readFileSync(
      join(PLUGIN, "skills", "prototype", "agents", "openai.yaml"),
      "utf8",
    );

    expect(domainModeling).toMatch(/^name: domain-modeling$/m);
    expect(domainModeling).toContain("references/CONTEXT-FORMAT.md");
    expect(domainModeling).toContain("references/ADR-FORMAT.md");
    expect(domainMetadata).toContain('display_name: "Domain modeling"');
    expect(domainMetadata).toContain(
      'default_prompt: "Use $bottega-dex:domain-modeling ',
    );
    expect(domainMetadata).toMatch(/policy:\s+allow_implicit_invocation: false/s);
    expect(prototype).toMatch(/^name: prototype$/m);
    expect(prototype).toContain("[LOGIC.md](LOGIC.md)");
    expect(prototype).toContain("[UI.md](UI.md)");
    expect(prototype).not.toMatch(/throwaway branch|implementation issue/i);
    expect(prototypeMetadata).toContain('display_name: "Prototype"');
    expect(prototypeMetadata).toContain(
      'default_prompt: "Use $bottega-dex:prototype ',
    );
    expect(prototypeMetadata).toMatch(/policy:\s+allow_implicit_invocation: false/s);
  });

  it("keeps spec internal and repository-local", () => {
    const spec = readFileSync(join(PLUGIN, "skills", "spec", "SKILL.md"), "utf8");

    expect(spec).toMatch(/^name: spec$/m);
    expect(spec).toMatch(/^user-invocable: false$/m);
    expect(spec).toContain("docs/specs/<slug>.md");
    expect(spec).toMatch(/Do not open, edit, or comment on an issue/i);
  });

  it("exposes improve as an opt-in architecture scan that hands one choice to Maestro", () => {
    const improve = readFileSync(
      join(PLUGIN, "skills", "improve", "SKILL.md"),
      "utf8",
    );
    const metadata = readFileSync(
      join(PLUGIN, "skills", "improve", "agents", "openai.yaml"),
      "utf8",
    );
    const maestro = readFileSync(
      join(PLUGIN, "skills", "maestro", "SKILL.md"),
      "utf8",
    );

    expect(improve).toMatch(/^name: improve$/m);
    expect(improve).toMatch(/Never (?:invoke|use).*proactively/i);
    expect(improve).toMatch(/commit history.*hot spots/is);
    expect(improve).toMatch(/Check open issues and pull requests before proposing/i);
    expect(improve).toMatch(/official documentation.*runtime skill.*industry patterns/is);
    expect(improve).toMatch(/Leave interface design to the run/i);
    expect(improve).toMatch(/No HTML.*No file report/i);
    expect(improve).toMatch(/The user picks one or rejects them/i);
    expect(improve).toMatch(/scan stands as.*discovery/i);
    expect(improve).toContain("[maestro](../maestro/SKILL.md)");
    expect(metadata).toContain('display_name: "Improve"');
    expect(metadata).toContain('default_prompt: "Use $bottega-dex:improve ');
    expect(metadata).toMatch(/policy:\s+allow_implicit_invocation: false/s);
    expect(maestro).toMatch(/improve.*scan.*discovery.*without repeating/is);
  });

  it("exposes setup as an explicit, idempotent Codex-native repository reconciliation", () => {
    const setup = readFileSync(
      join(PLUGIN, "skills", "setup", "SKILL.md"),
      "utf8",
    );
    const metadata = readFileSync(
      join(PLUGIN, "skills", "setup", "agents", "openai.yaml"),
      "utf8",
    );

    expect(setup).toMatch(/^name: setup$/m);
    expect(setup).toMatch(/only when the user explicitly invokes/i);
    expect(setup).toContain("[architect](../architect/SKILL.md)");
    expect(setup).toContain("codex plugin list --json");
    expect(setup).toMatch(/Report its installed version/i);
    expect(setup).toMatch(/Do not claim.*current.*same installed plugin/is);
    expect(setup).toContain("codex plugin marketplace add vadimcomanescu/bottega-dex");
    expect(setup).toContain("codex plugin add bottega-dex@bottega-dex");
    expect(setup).toMatch(/separately approved marketplace refresh/i);
    expect(setup).toContain("claude auth status");
    expect(setup).toMatch(/Do not make a paid model call only to inspect authentication/i);
    expect(setup).toMatch(/default to `AGENTS\.md`/i);
    expect(setup).toContain("<!-- bottega-dex:setup v1 begin -->");
    expect(setup).toContain("<!-- bottega-dex:setup v2 begin -->");
    expect(setup).toMatch(/every available command from a disposable worktree, never the user's checkout/i);
    expect(setup).toMatch(/category the project does not provide.*instead of inventing/is);
    expect(setup).toMatch(/discovered command fails.*exact failure.*leave it unwritten/is);
    expect(setup).toContain("docs/agents/issue-tracker.md");
    expect(setup).toMatch(/showing the exact change and receiving the user's approval/i);
    expect(setup).toMatch(/A conforming repository receives no file or GitHub changes/is);
    expect(setup).not.toContain("BASH_MAX_TIMEOUT_MS");
    expect(setup).not.toMatch(/Route guard/i);
    expect(metadata).toContain('display_name: "Setup"');
    expect(metadata).toContain('default_prompt: "Use $bottega-dex:setup ');
    expect(metadata).toMatch(/policy:\s+allow_implicit_invocation: false/s);
  });

  it("keeps the imported supporting procedures Codex-valid", () => {
    const start = readFileSync(join(PLUGIN, "skills", "start", "SKILL.md"), "utf8");
    const discover = readFileSync(
      join(PLUGIN, "skills", "discover", "SKILL.md"),
      "utf8",
    );
    const qa = readFileSync(join(PLUGIN, "skills", "qa", "SKILL.md"), "utf8");
    const architect = readFileSync(
      join(PLUGIN, "skills", "architect", "SKILL.md"),
      "utf8",
    );
    const implement = readFileSync(
      join(PLUGIN, "skills", "implement", "SKILL.md"),
      "utf8",
    );
    const panel = readFileSync(join(PLUGIN, "skills", "panel", "SKILL.md"), "utf8");
    const useClaude = readFileSync(
      join(PLUGIN, "skills", "use-claude", "SKILL.md"),
      "utf8",
    );
    const close = readFileSync(join(PLUGIN, "skills", "close", "SKILL.md"), "utf8");
    const qaEvidence = readFileSync(
      join(PLUGIN, "skills", "close", "references", "qa-evidence.md"),
      "utf8",
    );

    expect(start).toMatch(/^name: start$/m);
    expect(start).not.toContain("user-invocable");
    expect(start).toContain("## 1. Settle release and ownership");
    expect(start).toMatch(/land on green, or hold for you/i);
    expect(start).toMatch(/Follow its claim procedure without changing the user's checkout/i);
    expect(start).toMatch(/reserve that claim from the isolated worktree/i);
    expect(start).toMatch(/Preserve the tracker owner's force-push rule/i);
    expect(start).toContain("## 4. Read the commands and merge procedure");
    expect(start).toMatch(/opening an eligible non-draft PR enters a merge queue/i);
    expect(start).toContain("## 5. Confirm GitHub publication");
    expect(start).toContain("gh auth status");
    expect(discover).toMatch(/^name: discover$/m);
    expect(discover).toContain('`fork_turns: "none"`');
    expect(discover).toMatch(/low reasoning for a narrow read-only scout/i);
    const discoverMetadata = readFileSync(
      join(PLUGIN, "skills", "discover", "agents", "openai.yaml"),
      "utf8",
    );
    expect(discoverMetadata).toContain('display_name: "Discover"');
    expect(discoverMetadata).toContain(
      'default_prompt: "Use $bottega-dex:discover ',
    );
    expect(discoverMetadata).toMatch(/policy:\s+allow_implicit_invocation: false/s);
    expect(architect).toMatch(/^name: architect$/m);
    expect(architect).not.toContain("user-invocable");
    expect(architect).toContain("../domain-modeling/references/CONTEXT-FORMAT.md");
    expect(implement).toMatch(/^name: implement$/m);
    expect(implement).not.toContain("user-invocable");
    expect(panel).toMatch(/^name: panel$/m);
    expect(panel).toContain("Claude Fable 5 at high effort");
    expect(useClaude).toMatch(/^name: use-claude$/m);
    expect(useClaude).not.toContain("user-invocable");
    expect(useClaude).toContain("claude -p --safe-mode --model claude-fable-5 --effort high");
    expect(useClaude).toContain("--tools Read,WebSearch");
    expect(qa).toMatch(/^name: qa$/m);
    expect(qa).not.toContain("user-invocable");
    expect(qa).toMatch(/product code.*stay as you found them/i);
    expect(close).toMatch(/^name: close$/m);
    expect(close).not.toContain("user-invocable");
    expect(close).toContain("references/qa-evidence.md");
    expect(close).toContain("../code-review/SKILL.md");
    expect(close).toMatch(/head accepted by autoreview/i);
    expect(close).toMatch(/opening an eligible non-draft PR is the arm/i);
    expect(close).toMatch(/For Mergify this is the Mergify summary/i);
    expect(close).toMatch(/project checks remain ordinary checks and are not expected to turn red/i);
    expect(close).toMatch(/Opener-armed auto-merge fallback/i);
    expect(close).toMatch(/poll its required checks for up to five minutes/i);
    expect(close).toMatch(/non-null on both land and hold runs/i);
    expect(close).toMatch(/hold check and queue summary are merge-control signals/i);
    expect(close).toMatch(/An `autoMergeRequest` of null is expected/i);
    expect(close).not.toContain("gh pr merge --squash <PR-URL>");
    expect(qaEvidence).toMatch(/artifacts QA actually captured/i);
    expect(qaEvidence).toMatch(/recordings when the driving tool produced them/i);
  });

  it("publishes the plugin through the marketplace", () => {
    const marketplace = json(join(ROOT, ".agents", "plugins", "marketplace.json"));
    expect(marketplace.plugins).toEqual([
      expect.objectContaining({
        name: "bottega-dex",
        source: { source: "local", path: "./plugins/bottega-dex" },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
        category: "Coding",
      }),
    ]);

    const manifest = json(join(PLUGIN, ".codex-plugin", "plugin.json"));
    const packageJson = json(join(ROOT, "package.json"));
    const packageLock = json(join(ROOT, "package-lock.json"));
    expect(manifest).toMatchObject({
      name: "bottega-dex",
      version: "0.10.0",
      skills: "./skills/",
    });
    expect(packageJson.version).toBe("0.10.0");
    expect(packageLock.version).toBe("0.10.0");
    expect(packageLock.packages[""].version).toBe("0.10.0");
    expect(manifest.interface.defaultPrompt).toEqual([
      "$bottega-dex:maestro Take this task through adaptive delivery, dual review, any required QA, and a pull request.",
    ]);
  });

  it("documents the adaptive ordered workflow and selected Bottega snapshot", () => {
    expect(README).toContain("a1b9385d533ccb37cc1fec6ce1361aeef7ed711a");
    expect(README).toContain(
      "start → discover → spec when discovery adds decisions → architect when needed → panel when its three conditions hold → Claude cross-read when reversal is costly → orchestrate → code-review → spec read → architecture read when reversal is costly → QA when user-facing behavior changes → close",
    );
    expect(README).toMatch(/Architect runs only when.*acceptance criteria.*slices need settling/i);
    expect(README).toMatch(/Claude cross-read runs only when.*costly to reverse/i);
    expect(README).toMatch(/QA runs only when.*user-facing surface or product behavior changed/i);
    expect(README).toMatch(/skip a later phase only when nothing.*unclear.*cheap to reverse/i);
    expect(README).toMatch(/isolated branch and worktree.*project gates.*whole-diff review.*pull request/i);
    expect(README).toMatch(/QA is required when.*user-facing surface or product behavior/i);
    expect(README).toMatch(/no user-facing surface or product behavior.*skips QA/i);
    expect(README).toMatch(/single builder.*structured whole-diff review will run/is);
    expect(README).toMatch(/SKILL.*prose exception.*fresh high-reasoning.*whole docs diff/is);
    expect(AGENTS).toMatch(/fixed phase order.*start.*discover.*architect.*panel.*use-claude.*orchestrate.*code-review.*qa.*close/is);
    expect(AGENTS).toMatch(/must re-enter a skipped phase/i);
    expect(AGENTS).toMatch(/QA is required when.*user-facing surface or product behavior/i);
    expect(AGENTS).toMatch(/SKILL.*prose exception.*fresh high-reasoning.*whole docs diff/is);
    expect(README).toContain("$bottega-dex:improve [area or direction]");
    expect(README).toMatch(/scan.*strongest.*candidate.*maestro/is);
    expect(README).toContain("$bottega-dex:setup");
    expect(README).toMatch(/setup.*explicit-only.*exact file or GitHub change.*approval/is);
    expect(AGENTS).toContain("plugins/bottega-dex/skills/improve/SKILL.md");
    expect(AGENTS).toContain("plugins/bottega-dex/skills/setup/SKILL.md");
  });
});
