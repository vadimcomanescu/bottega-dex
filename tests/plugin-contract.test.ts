import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const PLUGIN = join(ROOT, "plugins", "bottega-dex");
const README = readFileSync(join(ROOT, "README.md"), "utf8");
const AGENTS = readFileSync(join(ROOT, "AGENTS.md"), "utf8");
const THIRD_PARTY = readFileSync(join(ROOT, "THIRD_PARTY.md"), "utf8");
const CONTEXT = readFileSync(join(ROOT, "CONTEXT.md"), "utf8");
const REVIEW_WORKER_ADR = readFileSync(
  join(ROOT, "docs", "adr", "0001-one-review-worker-owns-convergence.md"),
  "utf8",
);
const P2_LESSON = readFileSync(
  join(ROOT, "docs", "lessons", "p0-threshold-suppressed-review-findings.md"),
  "utf8",
);

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
      "skills/code-review/references/reviews.md",
      "skills/code-review/references/smell-baseline.md",
      "skills/code-review/scripts/autoreview",
      "skills/code-review/scripts/autoreview_test.py",
      "skills/code-review/scripts/test-review-harness",
      "skills/code-review/scripts/test-review-harness.py",
      "skills/code-review/scripts/test-review-harness.ps1",
      "skills/code-review/tests/test_autoreview_hardening.py",
      "skills/architect/SKILL.md",
      "skills/codebase-design/SKILL.md",
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
    expect(bro).toMatch(/Restate the immediately preceding assistant reply once/i);
    expect(bro).not.toMatch(/from here on|persist(?:s|ent)? across turns/i);
    expect(bro).toContain("ASD-STE100 Simplified Technical English");
    expect(bro).not.toMatch(/certif(?:y|ied|ication)/i);
    expect(metadata).toContain('display_name: "Bro"');
    expect(metadata).toContain('short_description: "Restate the last reply plainly"');
    expect(metadata).toContain('default_prompt: "Use $bottega-dex:bro ');
    expect(metadata).toContain("immediately preceding assistant reply plainly");
    expect(metadata).not.toMatch(/keep the task|persistent|from here on/i);
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

  it("keeps deep-module vocabulary separate from consequential architecture methods", () => {
    const codebaseDesign = readFileSync(
      join(PLUGIN, "skills", "codebase-design", "SKILL.md"),
      "utf8",
    );
    const architect = readFileSync(
      join(PLUGIN, "skills", "architect", "SKILL.md"),
      "utf8",
    );

    expect(codebaseDesign).toMatch(/^name: codebase-design$/m);
    expect(codebaseDesign).toMatch(/Module.*Interface.*Depth.*Seam.*Adapter.*Leverage.*Locality/is);
    expect(codebaseDesign).toMatch(/deletion test/i);
    expect(architect).toContain("[codebase-design](../codebase-design/SKILL.md)");
    expect(architect).toMatch(/dependency before deciding how its seam is tested/i);
    expect(architect).toMatch(/Documentation and domain authority/i);
  });

  it("keeps spec internal and repository-local", () => {
    const spec = readFileSync(join(PLUGIN, "skills", "spec", "SKILL.md"), "utf8");

    expect(spec).toMatch(/^name: spec$/m);
    expect(spec).toMatch(/^user-invocable: false$/m);
    expect(spec).toContain("docs/specs/<slug>.md");
    expect(spec).toMatch(/Do not open, edit, or comment on an issue/i);
    expect(spec).toMatch(/How We Measure Success.*only when/is);
    expect(spec).toMatch(/Further Notes.*Omit this section/is);
    expect(spec).toMatch(/Plan.*separate/is);
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
    expect(improve).toMatch(/deletion test.*test.*current interface.*ADRs/is);
    expect(improve).toMatch(/scan stands as.*discovery/i);
    expect(improve).toMatch(/scan stands as completed discovery.*does not repeat/is);
    expect(improve).toMatch(/settled additional behavioral decisions.*synthesizes the spec.*otherwise.*candidate and criteria verbatim.*continues to the Plan/is);
    expect(improve).toContain("[maestro](../maestro/SKILL.md)");
    expect(metadata).toContain('display_name: "Improve"');
    expect(metadata).toContain('default_prompt: "Use $bottega-dex:improve ');
    expect(metadata).toMatch(/policy:\s+allow_implicit_invocation: false/s);
    expect(maestro).toMatch(/improve.*scan.*completed discovery.*do not repeat/is);
    expect(maestro).toMatch(/scan settled behavioral decisions beyond the original candidate.*use \[spec\].*Otherwise.*candidate.*criteria verbatim.*continue to the Plan/is);
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
    expect(start).toContain("## 4. Read the commands and landing procedure");
    expect(start).toMatch(/queue that takes eligible non-draft PRs/i);
    expect(start).toMatch(/every mechanism that can land the PR.*exact disarm or withdrawal action.*readback that proves the PR terminally ineligible/is);
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
    expect(close).toMatch(/description:.*host project's complete landing procedure.*real terminal state/i);
    expect(close).toContain("references/qa-evidence.md");
    expect(close).toContain("../code-review/SKILL.md");
    expect(close).toMatch(/head accepted by autoreview/i);
    expect(close).toMatch(/complete documented landing procedure/i);
    expect(close).toMatch(/label, required check, queue condition, or draft state/i);
    expect(close).toMatch(/apply the brake the landing procedure names on the create call/i);
    expect(close).toMatch(/For Mergify this is the Mergify summary/i);
    expect(close).toMatch(/project checks remain ordinary checks and are not expected to turn red/i);
    expect(close).toMatch(/Merge queue:.*eligible non-draft PR is the whole opener action.*no merge or auto-merge command/is);
    expect(close).toMatch(/Opener-armed auto-merge fallback/i);
    expect(close).toMatch(/only when the landing procedure assigns that opener action for this release answer/i);
    expect(close).toMatch(/poll its required checks for up to five minutes/i);
    expect(close).toMatch(/disable-auto.*confirmation.*autoMergeRequest.*null/is);
    expect(close).toMatch(/fail closed across every mechanism that could still land the PR.*withdraw the PR from every queue or repository-owned landing mechanism/is);
    expect(close).toMatch(/every applicable readback agrees.*never claim the PR is safely held/is);
    expect(close).toMatch(/enumerate every landing mechanism applicable to this PR.*Every applicable proof is required.*One passing signal never substitutes/is);
    expect(close).toMatch(/single brake signal does not establish a safe hold.*any readback is missing or no longer blocked/is);
    expect(close).toMatch(/report it held only when.*every other applicable mechanism also reports the PR blocked or ineligible/is);
    expect(close).toMatch(/Another repository-owned mechanism:.*only the opener action its documented procedure assigns/is);
    expect(close).toMatch(/Read every terminal outcome from the landing procedure/i);
    expect(close).toMatch(/An `autoMergeRequest` of null is expected on a queue-owned non-draft PR/i);
    expect(close).not.toContain("gh pr merge --squash <PR-URL>");
    expect(qaEvidence).toMatch(/artifacts QA actually captured/i);
    expect(qaEvidence).toMatch(/recordings when the driving tool produced them/i);
  });

  it("publishes the plugin through the marketplace", () => {
    const marketplace = json(join(ROOT, ".agents", "plugins", "marketplace.json"));
    expect(marketplace.plugins).toEqual([
      expect.objectContaining({
        name: "bottega-dex",
        version: "0.12.0",
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
      version: "0.12.0",
      skills: "./skills/",
    });
    expect(packageJson.version).toBe("0.12.0");
    expect(packageLock.version).toBe("0.12.0");
    expect(packageLock.packages[""].version).toBe("0.12.0");
    expect(manifest.interface.defaultPrompt).toEqual([
      "$bottega-dex:maestro Take this task through adaptive delivery, dual review, any required QA, and a pull request.",
    ]);
  });

  it("documents the adaptive ordered workflow and selected Bottega snapshot", () => {
    expect(README).toContain("e0926de03d955febee9646d9c19d6384ec92a345");
    expect(README).toContain(
      "start → discover → spec when discovery adds decisions → architect when needed → panel when its three conditions hold → Claude cross-read when reversal is costly → orchestrate → closeout review with parallel Standards and Spec reviews → architecture read when reversal is costly → QA when user-facing behavior changes → close",
    );
    expect(README).toMatch(/Architect runs only when.*acceptance criteria.*slices need settling/i);
    expect(README).toMatch(/Claude cross-read runs only when.*costly to reverse/i);
    expect(README).toMatch(/QA runs only when.*user-facing surface or product behavior changed/i);
    expect(README).toMatch(/skip a later phase only when nothing.*unclear.*cheap to reverse/i);
    expect(README).toMatch(/isolated branch and worktree.*project gates.*whole-diff review.*pull request/i);
    expect(README).toMatch(/QA is required when.*user-facing surface or product behavior/i);
    expect(README).toMatch(/no user-facing surface or product behavior.*skips QA/i);
    expect(README).toMatch(/Maestro run.*glossary terms.*qualifying ADRs.*isolated worktree/i);
    expect(README).toMatch(/Standalone discovery.*does not edit.*caller.*checkout.*exact proposed changes/is);
    expect(README).toMatch(/post-review change.*every required review.*complete required QA scenario set.*final reviewed SHA.*never only an affected subset/is);
    expect(README).toMatch(/neutral boundary facts: target and base, architectural owner boundary, relevant sibling surfaces, public, security, and product contracts, changed-file and exact slice file bounds, non-test LOC measurements, named test interfaces, and the exact threat-model sentence when relevant/is);
    expect(README).toMatch(/Changed-file and slice bounds and LOC are review measurements and evidence, not hard scope caps.*Plan's exact slice ownership remains binding/is);
    expect(README).toMatch(/durable Plan separate.*builder non-decisions.*named test interfaces.*threat model.*vertical slices/is);
    expect(README).toMatch(/Maestro always writes.*Plan before builders.*architect.*contributes.*Settled or trivial work keeps Architect skipped/is);
    expect(README).toMatch(/planning authority.*isolated run state or the conversation.*never mutates a tracker implicitly/is);
    expect(README).toMatch(/Spec behavioral baseline stays separate: spec or verbatim request plus violated invariant and intended behavior.*Standards receives.*never behavioral content.*Spec receives.*behavioral baseline/is);
    expect(README).toMatch(/main run worktree.*integration worktree.*one slice branch and worktree per independent slice.*parallel builders never share Git state/is);
    expect(README).toMatch(/helper reviews that slice branch against the frozen base.*P2.*selected high-reasoning engine.*exact-model smoke boundary.*Only the accepted slice commit.*main run worktree/is);
    expect(README).toMatch(/review worker.*fixed GPT-5\.6 Sol and Claude Opus 5 panel.*every rerun/is);
    expect(README).toMatch(/review worker.*leaf.*returns accepted repair briefs.*without spawning builders or editing production code/is);
    expect(README).toMatch(/main task.*never edits production code.*dispatches `implement` builders.*repaired head.*same worker.*proof and reruns/is);
    expect(README).toMatch(/P2.*malicious smoke harness.*clean review/i);
    expect(README).toMatch(/Standards and Spec reviews run in parallel and stay separate.*Bottega `e0926de`/i);
    expect(README).toContain("a504fd8ef2e704d95312d1c6c8afdf7e4466bcfc");
    expect(README).toMatch(/Kimi remains available only for standalone helper invocations.*does not change Maestro's integrated panel/is);
    expect(README).toMatch(/close.*project's documented brake.*queue-owned eligible non-draft PR receives no auto-merge arm.*only when the procedure assigns.*final report reads its outcome/is);
    expect(README).toMatch(/hold enforcement cannot be proved.*every documented disarm or withdrawal action.*uses draft only when the procedure names it as safe.*every applicable readback proves the PR terminally ineligible/is);
    expect(README).toMatch(/single builder.*structured whole-diff review will run/is);
    expect(README).toMatch(/Every diff, including skill and workflow prose, goes through the sanitized review helper/i);
    expect(AGENTS).toMatch(/fixed phase order.*start.*discover.*architect.*panel.*use-claude.*orchestrate.*closeout.*code-review.*qa.*close/is);
    expect(AGENTS).toMatch(/must re-enter a skipped phase/i);
    expect(AGENTS).toMatch(/QA is required when.*user-facing surface or product behavior/i);
    expect(AGENTS).toMatch(/Every diff uses the sanitized helper/i);
    expect(README).toContain("$bottega-dex:improve [area or direction]");
    expect(README).toMatch(/scan.*strongest.*candidate.*maestro/is);
    expect(README).toContain("$bottega-dex:setup");
    expect(README).toMatch(/setup.*explicit-only.*exact file or GitHub change.*approval/is);
    expect(AGENTS).toContain("plugins/bottega-dex/skills/improve/SKILL.md");
    expect(AGENTS).toContain("plugins/bottega-dex/skills/setup/SKILL.md");
    expect(AGENTS).toMatch(/close\/SKILL\.md.*documented brake when held.*only its assigned opener action.*outcome its procedure defines/i);
    expect(AGENTS).toMatch(/hold enforcement cannot be proved.*disarms or withdraws every applicable GitHub, queue, and repository-owned mechanism.*never claims a safe hold.*every mechanism reports the PR ineligible/is);
    expect(AGENTS).toMatch(/glossary terms.*qualifying ADRs inline/i);
    expect(AGENTS).toMatch(/Maestro and the root task always write a durable Plan distinct.*builder non-decisions.*named test interfaces.*threat model.*vertical slices/is);
    expect(AGENTS).toMatch(/architect.*contributes consequential design only when its condition holds.*without forcing that phase/is);
    expect(AGENTS).toMatch(/bro.*restates the immediately preceding assistant reply once.*does not persist across turns/is);
    expect(AGENTS).toMatch(/main run worktree.*integration worktree.*one slice branch and worktree per independent slice.*parallel builders never share Git state/is);
    expect(AGENTS).toMatch(/Review each slice branch against the frozen base.*integrate only its accepted commit.*main run worktree/is);
    expect(AGENTS).toMatch(/neutral boundary facts: target and base, architectural owner boundary, relevant sibling surfaces, public, security, and product contracts, changed-file and exact slice file bounds, non-test LOC measurements, named test interfaces, and the exact threat-model sentence when relevant/is);
    expect(AGENTS).toMatch(/Changed-file and slice bounds and LOC are review measurements and evidence, not hard scope caps.*Plan's exact slice ownership remains binding/is);
    expect(AGENTS).toMatch(/Spec behavioral baseline separate: spec or verbatim request plus violated invariant and intended behavior.*Standards receives.*never behavioral content.*Spec receives.*behavioral baseline/is);
    expect(AGENTS).toMatch(/Standards receives neutral facts plus trusted frozen-base authority and never behavioral content.*Spec receives the same neutral facts plus the behavioral baseline/is);
    expect(AGENTS).toMatch(/fixed across reruns/i);
    expect(AGENTS).toMatch(/review worker.*leaf.*returns accepted repair briefs.*without spawning builders or editing production code/is);
    expect(AGENTS).toMatch(/root task.*never edits production code.*dispatches `implement` builders.*repaired head.*same review worker/is);
    expect(AGENTS).toMatch(/Standards authority.*trusted frozen base.*not the reviewed checkout/is);
    expect(AGENTS).toMatch(/review prompt.*frozen owner and scope baseline.*threat model.*named test interfaces/is);
    expect(AGENTS).toMatch(/two review-triggered repair cycles.*pauses and reclassifies/is);
    expect(AGENTS).toMatch(/architecture-driven repair.*re-enters panel.*dual-panel, Standards, and Spec reviews/is);
    expect(AGENTS).toMatch(/post-review change.*complete required QA scenario set.*final reviewed SHA.*never only an affected subset/is);
    expect(THIRD_PARTY).toContain("a504fd8ef2e704d95312d1c6c8afdf7e4466bcfc");
    expect(THIRD_PARTY).toContain("e0926de03d955febee9646d9c19d6384ec92a345");
    expect(THIRD_PARTY).toContain("Bottega 0.180.0");
    expect(THIRD_PARTY).toMatch(/fixed integrated GPT\/Claude panel.*P2 threshold.*exact selected-model smoke checks.*separate Standards and Spec reviews/is);
    expect(THIRD_PARTY).toMatch(/Kimi remains a standalone helper capability and does not change Maestro's integrated panel/is);
    expect(THIRD_PARTY).toMatch(/fail-closed scan for unchanged unified-diff context lines/is);
    expect(THIRD_PARTY).toMatch(/`bro` is a one-shot restatement and does not persist across turns.*Maestro owns its plain-language rule/is);
    expect(THIRD_PARTY).toMatch(/multi-builder runs create one distinct slice branch and worktree per independent slice from the frozen integration base, each builder edits only its slice worktree, and only an accepted slice commit is integrated into the main run worktree/i);
    expect(THIRD_PARTY).toMatch(/complete host-defined landing procedure.*project-defined brake.*procedure-assigned opener action.*procedure-read outcome.*fail-closed opener-armed fallback/i);
    expect(THIRD_PARTY).toMatch(/queue-owned non-draft semantics.*fail-closed opener-armed fallback/i);
  });

  it("records the review vocabulary, decision, and P2 lesson", () => {
    expect(CONTEXT).toMatch(/^## Language$/m);
    expect(CONTEXT).toMatch(/^\*\*Run\*\*:$/m);
    expect(CONTEXT).toMatch(/^\*\*Orchestrator\*\*:$/m);
    expect(CONTEXT).toMatch(/^\*\*Worker\*\*:$/m);
    expect(CONTEXT).toMatch(/^\*\*Review worker\*\*:$/m);
    expect(CONTEXT).toMatch(/reviewing one frozen change until it is accepted or escalated/i);
    expect(CONTEXT).toMatch(/^\*\*Independent review\*\*:$/m);
    expect(CONTEXT).toMatch(/Standards review means checking repository conventions.*Spec review means checking delivered behavior/is);
    expect(CONTEXT).not.toMatch(/high-reasoning|leaf worker|spawn builders|edit production code|dispatches repairs|run in parallel|reports remain separate/i);
    expect(REVIEW_WORKER_ADR).toMatch(/fresh review worker.*returns accepted repair briefs.*orchestrator dispatches builders/is);
    expect(REVIEW_WORKER_ADR).toMatch(/orchestrator-per-finding review and single-engine reruns/i);
    expect(REVIEW_WORKER_ADR).toMatch(/extra model latency and cost.*orchestrator-builder handoff/is);
    expect(P2_LESSON).toMatch(/What happened:.*P0-only default.*suppress/is);
    expect(P2_LESSON).toMatch(/Every structured and independent review runs at P2/i);
    expect(P2_LESSON).toMatch(/malicious smoke harness/i);
    expect(P2_LESSON).toMatch(/^Enforced:/m);
  });

  it("pins complete frozen-base Standards authority and shared threat-model prompts", () => {
    const reviews = readFileSync(
      join(PLUGIN, "skills", "code-review", "references", "reviews.md"),
      "utf8",
    );
    expect(reviews).toMatch(
      /every applicable repository authority that governs the changed files, owner boundaries, relevant sibling surfaces, public, security, or product contracts, or named test interfaces.*frozen target base/is,
    );
    expect(reviews).toMatch(
      /Authority discovery is not limited to interface contracts.*root or nested agent map, review doctrine, ownership rule, test-interface contract/is,
    );
    expect(reviews).toMatch(
      /relevant threat-model boundary.*exact same threat-model sentence is required in both the Standards and Spec prompt files.*neither helper invocation starts without it/is,
    );
    expect(reviews).toMatch(
      /Spec prompt must include the same required threat-model sentence as the Standards prompt/i,
    );
    expect(reviews).toMatch(
      /threat-model sentence.*neutral review-boundary fact.*does not add the request, specification, or intended behavior to the Standards prompt/is,
    );
  });
});
