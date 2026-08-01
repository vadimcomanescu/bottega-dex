import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const PLUGIN = join(ROOT, "plugins", "bottega-dex");
const skill = (name: string) =>
  readFileSync(join(PLUGIN, "skills", name, "SKILL.md"), "utf8");

const MAESTRO = skill("maestro");
const DISCOVER = skill("discover");
const SPEC = skill("spec");
const ORCHESTRATE = skill("orchestrate");
const REVIEW = skill("code-review");
const REVIEW_METHODS = readFileSync(
  join(PLUGIN, "skills", "code-review", "references", "reviews.md"),
  "utf8",
);
const SMELL_BASELINE = readFileSync(
  join(PLUGIN, "skills", "code-review", "references", "smell-baseline.md"),
  "utf8",
);
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
      "[spec](../spec/SKILL.md)",
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
    expect(DISCOVER).toContain("Understand what I am asking for");
    expect(DISCOVER).toContain("Match the method to the work");
    expect(DISCOVER).toMatch(/During an active Maestro run.*isolated run worktree.*each decision settles/is);
    expect(DISCOVER).toMatch(/discovery runs on its own.*do not edit the caller's checkout/is);
    expect(DISCOVER).toMatch(/exact proposed glossary and ADR changes.*isolated delivery run/is);
    expect(SPEC).toContain("implementation-facing specification artifact");
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
    expect(MAESTRO).toMatch(/With one builder.*main run worktree.*skip its slice review only when.*integrated structured review.*will run/is);
    expect(MAESTRO).toMatch(/user-facing surface or product behavior.*use \[qa\]/is);
    expect(MAESTRO).toMatch(/no user-facing surface or product behavior.*skip QA/is);
    expect(MAESTRO).toMatch(/spec.*only when discovery settled something.*request/is);
    expect(MAESTRO).toMatch(/whole diff.*read against the spec/is);
    expect(MAESTRO).toMatch(/Throughout this Maestro invocation.*talk and write plainly.*define each technical term/is);
    expect(MAESTRO).not.toMatch(/Talk and write per \[bro\]/i);
    expect(MAESTRO).toMatch(/qualifying architecture decision.*ADR.*same diff.*verdict it reverses/is);
    const standardsFreeze = MAESTRO.match(/Before any builder starts,[^.]*\./)?.[0] ?? "";
    expect(standardsFreeze).toMatch(/freeze the integration base and the neutral boundary facts: base, owner boundary, exact slice file bounds, non-test LOC baseline, and named test interfaces/is);
    expect(standardsFreeze).not.toMatch(/request|spec|intended behavior|threat model/i);
    expect(MAESTRO).toMatch(/Keep the spec or verbatim request separate as the behavioral baseline/is);
    expect(MAESTRO).toMatch(/Standards review.*neutral facts.*trusted frozen-base authority.*no behavior.*Spec review.*same neutral facts.*behavioral baseline/is);
    expect(MAESTRO).toMatch(/main run worktree remains the integration worktree.*one distinct slice branch and worktree per independent slice.*frozen integration base/is);
    expect(MAESTRO).toMatch(/Each builder edits only its slice worktree.*parallel builders never share Git state/is);
    expect(MAESTRO).toMatch(/Before integration.*helper on that slice branch against the frozen integration base.*P2.*streamed output.*one high-reasoning engine selected in its builder dispatch.*never the integrated fixed panel/is);
    expect(MAESTRO).toMatch(/first clean slice result.*malicious smoke harness.*exact selected engine, model, and thinking/is);
    expect(MAESTRO).toMatch(/Standards and Spec reviews as applicable against that same slice before integration/is);
    expect(MAESTRO).toMatch(/Integrate only the accepted slice commit into the main run worktree/is);
    expect(MAESTRO).toMatch(/fresh high-reasoning native Codex review worker.*code-review.*whole/is);
    expect(MAESTRO).toMatch(/Give it the frozen integration base, neutral boundary facts, separate spec or verbatim request, threat-model sentence, and project commands/is);
    expect(MAESTRO).toMatch(/Standards review.*neutral facts.*trusted frozen-base authority.*no behavioral input.*Spec review.*same neutral facts.*spec or verbatim request/is);
    expect(MAESTRO).toMatch(/review worker is a leaf.*verifies and classifies.*returns accepted repair briefs.*never spawns a builder or edits production code/is);
    expect(MAESTRO).toMatch(/root task.*dispatches accepted repairs.*\[implement\].*repaired head.*same review worker.*complete dual-panel, Standards, and Spec reviews/is);
    expect(MAESTRO).toMatch(/root task.*decides that record and escalations.*never edits production code/is);
    expect(MAESTRO).toMatch(/Standards and Spec reviews run in parallel.*Bottega `7ee58ba`/is);
    expect(MAESTRO).toMatch(/two review-triggered repair cycles without convergence.*pauses and reclassifies/is);
    expect(MAESTRO).toMatch(/continues only when.*in-scope blocker.*cycles are narrowing/is);
    expect(MAESTRO).toMatch(/independent architecture read.*costly to reverse/is);
    expect(MAESTRO).toMatch(/architecture finding drives a repair.*re-enter \[panel\].*complete dual-panel, Standards, and Spec reviews/is);
    expect(MAESTRO).toMatch(/Any change after the first accepted review.*returns through every required review/is);
    expect(MAESTRO).toMatch(/final reviewed SHA.*complete required QA scenario set.*never only an affected subset/is);
    expect(MAESTRO).toMatch(/still failing after two QA repair rounds.*root task/is);
  });

  it("governs validator threat models and review repair cycles", () => {
    expect(MAESTRO).toMatch(/check,? gate,? or validator/i);
    expect(MAESTRO).toMatch(/threat model.*input or actor class.*deliberately excludes/is);
    expect(MAESTRO).toMatch(/review worker.*verifies and classifies/i);
    expect(MAESTRO).toMatch(/fix.*change.*promised contract.*user/is);
    expect(REVIEW).toMatch(/review worker.*returns accepted repair briefs.*orchestrator.*dispatches `implement` builders.*review worker reruns review/is);
    expect(REVIEW).toMatch(/two review-triggered patch cycles.*have not converged.*pause and reclassify/is);

    expect(REVIEW).toMatch(/freeze two records and one neutral boundary.*behavioral baseline.*only the Spec review receives it.*neutral review-boundary facts shared with both reviews.*target and base.*owner boundary.*exact changed-file or slice bounds.*non-test LOC.*named test interfaces/is);
    expect(REVIEW).toMatch(/Standards additionally receives trusted frozen-base authority and never behavioral text/is);
    expect(REVIEW).toContain("**Out of threat model**");
    expect(REVIEW).toMatch(/compute both numbers.*before each.*dispatch/i);
    expect(REVIEW).toMatch(/two-cycle pause.*inside the threat model.*cycles are narrowing/is);
    expect(REVIEW).toMatch(/`REVIEW\.md`.*smell-baseline\.md.*threat-model sentence/is);
    expect(REVIEW).toMatch(/never the run's other design decisions/i);
    expect(REVIEW).toMatch(/--max-priority P2.*--stream-engine-output/is);
    expect(REVIEW).toMatch(/Before trusting the first clean exit.*--fixture malicious/is);
    expect(REVIEW).toContain("AUTOREVIEW_CODEX_MODEL=gpt-5.6-sol");
    expect(REVIEW).toContain("AUTOREVIEW_CODEX_THINKING=high");
    expect(REVIEW).toContain("AUTOREVIEW_CLAUDE_MODEL=claude-opus-5");
    expect(REVIEW).toContain("AUTOREVIEW_CLAUDE_THINKING=high");
    expect(REVIEW).toMatch(/unverified outranks clean/i);
    expect(REVIEW).toMatch(/clean engine result.*Standards and Spec review result/is);
    expect(REVIEW).toMatch(/review never merges.*documented landing procedure/is);
    expect(REVIEW).toMatch(/If the live base advances.*except when.*landing procedure makes the merge queue authoritative.*speculative updated-base required checks rerun the project's proof.*Without both documented queue authority and speculative required-check proof.*unverified and requires a rerun/is);
    expect(REVIEW).not.toMatch(/gh pr merge|Merge only/i);

    const executableRecipes = REVIEW.split("\n").filter((line) => {
      const trimmed = line.trim();
      return (
        (trimmed.startsWith('"$AUTOREVIEW"') ||
          trimmed.startsWith('OPENCLAW_TESTBOX=1 "$AUTOREVIEW"')) &&
        !trimmed.includes("--help")
      );
    });
    expect(executableRecipes.length).toBeGreaterThan(0);
    for (const recipe of executableRecipes) {
      expect(recipe).toContain("--max-priority P2");
      expect(recipe).toContain("--stream-engine-output");
    }
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

  it("bundles Bottega autoreview and pins the mandatory dual, Standards, and Spec reviews", () => {
    expect(REVIEW).toContain("Run the bundled structured review helper");
    expect(REVIEW).toContain("--reviewers codex,claude");
    expect(REVIEW).toContain("<absolute-code-review-skill-directory>/scripts/autoreview");
    expect(REVIEW).toContain("--model codex=gpt-5.6-sol --thinking codex=high");
    expect(REVIEW).toContain("--model claude=claude-opus-5 --thinking claude=high");
    expect(REVIEW).toMatch(/Only the integrated Maestro closeout diff uses the pinned two-engine panel/i);
    expect(REVIEW).toMatch(/integrated Maestro closeout.*GPT-5\.6 Sol.*Claude Opus 5.*Standards and Spec reviews are both fixed to GPT-5\.6 Sol/is);
    expect(REVIEW).toMatch(/Before integration, each slice's bug, Standards, and Spec passes all use the one high-reasoning engine, model, and thinking configuration selected in its builder dispatch.*not the integrated fixed panel.*P2.*sanitized helper.*smoke.*exact selected configuration.*first clean result/is);
    expect(REVIEW).toMatch(/integrated Maestro closeout reviews the integrated diff as this mandatory panel/i);
    expect(REVIEW).toMatch(/Every integrated Maestro closeout rerun repeats this exact two-engine panel/i);
    expect(REVIEW).toMatch(/repeats both Standards and Spec reviews with Sol at high reasoning.*all three review results are clean/is);
    expect(REVIEW).toMatch(/Pre-integration slice reruns keep the one dispatch-selected high-reasoning engine, model, and thinking configuration for their bug, Standards, and Spec passes.*smoke that exact selected configuration before the first clean result/is);
    expect(REVIEW).toMatch(/standalone invocation keeps the engine or panel its caller selected/i);
    expect(REVIEW).toMatch(/Standards and Spec reviews in parallel.*two separate autoreview helper invocations/is);
    expect((REVIEW.match(/^## Standards and Spec reviews$/gm) ?? [])).toHaveLength(1);
    expect(REVIEW.indexOf("## Standards and Spec reviews")).toBeGreaterThan(REVIEW.indexOf("## Helper"));
    expect(REVIEW.indexOf("## Standards and Spec reviews")).toBeLessThan(REVIEW.indexOf("## Reporting"));
    expect(REVIEW).toMatch(/two separate autoreview helper invocations.*same frozen target/is);
    expect(REVIEW).toMatch(/same frozen base used by the mandatory panel/is);
    expect(REVIEW).toMatch(/outer review worker retains read-only target-repository access.*invoke the helper and verify findings/is);
    expect(REVIEW).toMatch(/helper-created isolated model session.*redacted review bundle/is);
    expect(REVIEW).toMatch(/review worker never passes raw diffs, deleted revisions, or repository access.*isolated sessions/is);
    expect(REVIEW).toMatch(/review-specific prompt files outside the reviewed repository.*Neither prompt contains diff content or deleted revisions/is);
    expect(REVIEW).toMatch(/Pass each prompt with `--prompt`.*`--prompt-file`.*repository-relative/is);
    expect(REVIEW).toContain('--json-output "$STANDARDS_REVIEW_REPORT"');
    expect(REVIEW).toContain('--json-output "$SPEC_REVIEW_REPORT"');
    const reviewRecipes = REVIEW.split("\n").filter((line) =>
      line.trim().startsWith('"$AUTOREVIEW" --mode branch --base "$FROZEN_BASE"'),
    );
    expect(reviewRecipes).toHaveLength(2);
    for (const recipe of reviewRecipes) {
      expect(recipe).toContain("--max-priority P2");
      expect(recipe).toContain("--stream-engine-output");
    }
    expect(REVIEW_METHODS).toMatch(/separate vendored autoreview helper invocations.*same frozen target/is);
    expect(REVIEW_METHODS).toMatch(/TruffleHog preflight.*deletion-side redaction/is);
    expect(REVIEW_METHODS).toMatch(/review worker never passes a raw diff, deleted revision, or repository access.*isolated session/is);
    expect(REVIEW).toMatch(/Standards prompt carries.*repository contract.*named test interfaces.*frozen at the target base.*neutral review-boundary facts: target and base, owner boundary, exact changed-file or slice bounds, non-test LOC, named test interfaces/is);
    expect(REVIEW).toMatch(/Standards prompt never carries the request, build spec, verbatim request, or intended behavior.*Spec prompt alone carries.*build spec or verbatim request/is);
    expect(REVIEW).toMatch(/task running this skill writes each prompt.*outside the reviewed repo/is);
    expect(REVIEW).toMatch(/task running this skill creates two review-specific prompt files.*authority text frozen at the target base/is);
    expect(REVIEW_METHODS).toMatch(/repository contract.*named test interfaces.*frozen target base.*never from the current checkout/is);
    expect(REVIEW_METHODS).toMatch(/Proposed contract changes remain only in the helper's sanitized bundle/is);
    expect(REVIEW_METHODS).toMatch(/neutral review-boundary facts shared with the Spec review: target and base, owner boundary, exact changed-file or slice bounds, non-test LOC, named test interfaces/is);
    expect(REVIEW_METHODS).toMatch(/Spec prompt.*shared neutral review-boundary facts.*exact changed-file or slice bounds/is);
    expect(REVIEW_METHODS).toMatch(/Standards prompt never includes the request, build spec, verbatim request, (?:or )?intended behavior.*Spec prompt.*build spec or verbatim request/is);
    expect(REVIEW_METHODS).toMatch(/Spec review.*quotes the spec line/is);
    expect(REVIEW_METHODS).toMatch(/no spec available.*does not block.*clean engine result/is);
    expect(REVIEW_METHODS).toMatch(/Maestro run always supplies its spec/i);
    expect(SMELL_BASELINE).toMatch(/Standards review intent only.*never injected into the Spec review intent/is);
    expect(SMELL_BASELINE).not.toMatch(/every review intent file/i);
    expect(REVIEW).toMatch(/Every diff uses the secret-safe helper.*Do not bypass.*skill, metadata, documentation/is);
  });

  it("keeps review, QA, close, and the reviewer adapter at their boundaries", () => {
    expect(REVIEW).toContain("QA on the accepted head when required");
    expect(QA).toMatch(/Product code.*stay as you found them/i);
    expect(CLOSE).toMatch(/head accepted by autoreview/i);
    expect(CLOSE).toContain("references/qa-evidence.md");
    expect(CLOSE).toMatch(/merge-queue repository/i);
    expect(CLOSE).toMatch(/eligible non-draft PR is the whole opener action.*Run no merge or auto-merge command/is);
    expect(ADAPTER).toContain('model: "claude-opus-5"');
    expect(ADAPTER).toContain('effort: "high"');
    expect(ADAPTER).not.toContain("panelist:");
    expect(ADAPTER).not.toContain("judge:");
  });

  it("closes reviewed heads with QA only when Maestro required it", () => {
    expect(CLOSE).toMatch(
      /mandatory dual whole-diff review and any required QA.*host project's complete landing procedure.*real terminal state/i,
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
      /When QA ran, rerun the complete required QA scenario set on the final reviewed SHA/i,
    );
    expect(CLOSE).toMatch(/When QA ran, include its evidence links/i);
    expect(CLOSE).not.toMatch(
      /The head accepted by autoreview, the head QA verified, and the head the PR will publish are one SHA/i,
    );
    expect(CLOSE).not.toMatch(/then review and QA the updated work again/i);
    expect(CLOSE).not.toMatch(/publish its fresh QA evidence/i);
  });
});
