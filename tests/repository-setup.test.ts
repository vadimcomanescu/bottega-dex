import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const AGENTS = readFileSync(join(ROOT, "AGENTS.md"), "utf8");
const START = readFileSync(
  join(ROOT, "plugins", "bottega-dex", "skills", "start", "SKILL.md"),
  "utf8",
);
const CLOSE = readFileSync(
  join(ROOT, "plugins", "bottega-dex", "skills", "close", "SKILL.md"),
  "utf8",
);

describe("repository landing setup", () => {
  it("provides the required hold merge-control check", () => {
    const workflow = readFileSync(
      join(ROOT, ".github", "workflows", "merge-control.yml"),
      "utf8",
    );

    expect(workflow).toMatch(/^\s*pull_request:\s*\n\s*types: \[opened, reopened, synchronize, labeled, unlabeled\]$/m);
    expect(workflow).toMatch(/^permissions:\s*\n  contents: read$/m);
    expect(workflow).not.toMatch(/^\s+\w[\w-]*: write$/m);
    expect(workflow).toMatch(/^  hold:\s*\n    name: hold$/m);
    expect(workflow).toContain(
      "# This check blocks any pull request currently carrying the hold label. It does not evaluate code, review approval, or other readiness.",
    );
    expect(workflow).toContain(
      "# It assumes this repository's owner-authored and cooperative-contributor model and is not tamper-resistant against a hostile pull request that changes this workflow.",
    );
    expect(workflow).toContain("contains(github.event.pull_request.labels.*.name, 'hold')");

    const scriptBlock = workflow.match(/        run: \|\n((?:          .*\n?)+)$/);
    expect(scriptBlock).not.toBeNull();
    const rawScript = scriptBlock?.at(1);
    if (rawScript === undefined) {
      throw new Error("merge-control workflow has no run script");
    }
    const script = rawScript.replace(/^          /gm, "");
    const held = spawnSync("bash", ["-c", script], {
      env: { ...process.env, HOLD_LABEL_PRESENT: "true" },
    });
    const ready = spawnSync("bash", ["-c", script], {
      env: { ...process.env, HOLD_LABEL_PRESENT: "false" },
    });
    expect(held.status).toBe(1);
    expect(ready.status).toBe(0);
  });

  it("documents this repository's authoritative fallback landing procedure", () => {
    expect(AGENTS).toContain("## Repository landing procedure");
    expect(AGENTS).toMatch(/authoritative fallback.*queue-first behavior/i);
    expect(AGENTS).toMatch(/target settings.*not current facts/i);
    expect(AGENTS).toMatch(/target `main` ruleset.*no bypass actors/is);
    expect(AGENTS).toMatch(/requires a pull request/is);
    expect(AGENTS).toMatch(/squash merges only/is);
    expect(AGENTS).toMatch(/zero required approvals/is);
    expect(AGENTS).toMatch(/strict up-to-date.*off/is);
    expect(AGENTS).toMatch(/blocks branch deletion/is);
    expect(AGENTS).toMatch(/blocks non-fast-forward updates/is);
    expect(AGENTS).toMatch(/required checks.*`verify`.*`hold`/is);
    expect(AGENTS).toMatch(/target repository setting.*GitHub auto-merge.*enabled/is);
    expect(AGENTS).not.toMatch(/^- GitHub auto-merge is enabled\.$/m);

    const bootstrapSteps = [
      "1. Create the `hold` label and read it back.",
      "2. Enable GitHub auto-merge.",
      "3. Create a temporary active no-bypass `main` ruleset",
      "4. Open this bootstrap pull request as a land run without the `hold` label, then arm it",
      "5. After this merge-control workflow lands, observe a successful `hold` check reported by the landed workflow.",
      "Only then update the active ruleset to require both `verify` and `hold`.",
    ];
    const bootstrapPositions = bootstrapSteps.map((step) => AGENTS.indexOf(step));
    expect(bootstrapPositions.every((position) => position >= 0)).toBe(true);
    expect(bootstrapPositions).toEqual([...bootstrapPositions].sort((a, b) => a - b));
    expect(AGENTS).toMatch(/temporary active.*no-bypass.*`main` ruleset.*only.*`verify`/is);
    expect(AGENTS).toMatch(/bootstrap.*land run.*must not carry.*`hold`/is);
    expect(AGENTS).toMatch(/must not be used for a held release.*before `hold` is a required check/is);
    expect(AGENTS).toMatch(/owner-authored.*cooperative-contributor model/is);
    expect(AGENTS).toMatch(/not tamper-resistant.*hostile pull request/is);
    expect(AGENTS).toMatch(/blocks.*label state.*does not evaluate code.*reviews.*readiness/is);
    expect(AGENTS).toContain("gh pr merge --auto --squash <PR-URL>");
    expect(AGENTS).toMatch(/land run.*merge.*checks pass/i);
    expect(AGENTS).toMatch(
      /hold run.*open.*`hold` label already applied.*arm auto-merge immediately after creation.*before.*poll.*required `hold` check.*red/is,
    );
    expect(AGENTS).not.toMatch(/verify.*required `hold` check is red.*then arm auto-merge/is);
    expect(AGENTS).toMatch(
      /no enforcing required `hold` check appears.*`gh pr merge --disable-auto <PR-URL>`.*confirm.*`autoMergeRequest` is null.*leave.*labeled and unarmed.*stop.*report/is,
    );
    expect(AGENTS).toMatch(/removing the label reruns the check/i);
    expect(AGENTS).toMatch(/no queue or separate repository-owned landing enrollment.*null `autoMergeRequest`.*terminal-ineligibility proof/is);
    expect(AGENTS).toMatch(/Never issue a direct merge command/i);
  });

  it("requires the host landing procedure to define complete fail-closed withdrawal", () => {
    expect(START).toMatch(
      /For every mechanism that can land the PR.*exact disarm or withdrawal action.*readback that proves the PR terminally ineligible/is,
    );
    expect(START).toMatch(
      /disabling a GitHub auto-merge arm.*withdrawing a queue or repository-owned enrollment.*making the PR draft only when the project names draft as its safe withdrawal state/is,
    );
    expect(START).toMatch(/any applicable arm, disarm, withdrawal, or terminal-ineligibility proof is missing or ambiguous.*Close blocked/is);
    expect(CLOSE).toMatch(
      /fail closed across every mechanism that could still land the PR.*disable a GitHub auto-merge arm.*withdraw the PR from every queue or repository-owned landing mechanism.*make the PR draft when the procedure names draft as the safe withdrawal state/is,
    );
    expect(CLOSE).toMatch(
      /autoMergeRequest.*null.*queue or repository-owned mechanism.*withdrawn or ineligible.*isDraft.*true.*every applicable readback agrees/is,
    );
    expect(CLOSE).toMatch(
      /any disarm or withdrawal action is missing, fails, or cannot be proved.*fail-closed recovery failed.*never claim the PR is safely held/is,
    );
    expect(CLOSE).toMatch(
      /enumerate every landing mechanism applicable to this PR.*verify the blocked or ineligible readback.*Every applicable proof is required.*One passing signal never substitutes/is,
    );
    expect(CLOSE).toMatch(
      /If any applicable mechanism lacks its documented blocked or ineligible readback, fail closed across every mechanism/is,
    );
    expect(CLOSE).toMatch(
      /single brake signal does not establish a safe hold.*complete fail-closed withdrawal.*any readback is missing or no longer blocked/is,
    );
  });

  it("arms a held fallback before polling only when the landing procedure assigns the arm", () => {
    expect(CLOSE).toMatch(
      /Opener-armed auto-merge fallback:.*run `gh pr merge --auto --squash <PR-URL>`.*only when the landing procedure assigns that opener action for this release answer.*When it assigns an arm, create it immediately after the PR opens and before polling/is,
    );
    expect(CLOSE).toMatch(
      /documented held fallback is an armed PR plus a required brake check.*poll its required checks.*confirm it is red because the documented brake is present/is,
    );
    expect(CLOSE).not.toMatch(
      /On a hold run, arm immediately after creation/is,
    );
    expect(CLOSE).toMatch(/Merge queue:.*Run no merge or auto-merge command/is);
    expect(CLOSE).toMatch(
      /procedure assigns no arm for the current release answer, such as a held draft, arm nothing/is,
    );
    expect(CLOSE).toMatch(
      /no enforcing required check appears.*complete fail-closed withdrawal.*`gh pr merge --disable-auto <PR-URL>`.*`autoMergeRequest` is null.*queue or repository-owned mechanism.*withdrawn.*proved ineligible/is,
    );
    expect(CLOSE).not.toMatch(/no enforcing required check appears.*leave the PR braked and armed/is);
    expect(CLOSE).toMatch(
      /documented held fallback requires an arm plus a required brake check.*terminal held state only when that arm is present, the brake check alone is red/is,
    );
  });
});
