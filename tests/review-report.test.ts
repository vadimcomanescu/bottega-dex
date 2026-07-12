// The review report contract: the schema fail-closes on hollow or decorated
// reports, and the shipped Claude dispatch workflow carries the same schema
// the codex dispatch reads from disk. The two valid fixtures are real outputs:
// one from `codex exec --output-schema` (gpt-5.6-sol), one from a harness
// workflow agent() with `schema:` (opus family path), captured 2026-07-11.
import { Ajv } from "ajv";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SCHEMA_PATH = join(
  import.meta.dirname, "..", "skills", "reviewing", "references", "report.schema.json",
);
const DISPATCH_PATH = join(
  import.meta.dirname, "..", "skills", "reviewing", "assets", "review-dispatch.js",
);
const ROUTE_GUARD = join(import.meta.dirname, "..", "hooks", "route-guard.js");

const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
const validate = new Ajv({ strict: true }).compile(schema);

const round1 = {
  schema_version: 1,
  round: 1,
  reviewer: { family: "codex", model: "gpt-5.6-sol" },
  target: {
    base_sha: "a1b2c3d4e5f678901234567890abcdef12345678",
    head_sha: "b2c3d4e5f678901234567890abcdef123456789a",
    tree_sha: "c3d4e5f678901234567890abcdef123456789abc",
  },
  evidence_paths: [
    ".bottega/evidence/demo/review/diff.patch",
    ".bottega/evidence/demo/review/unit-tests.txt",
  ],
  rechecks: [],
  findings: [
    {
      id: "R1-001",
      severity: "minor",
      scenario: "Parsing a token whose final character lies exactly at the requested end boundary.",
      input_state: "parse.ts receives a source string and computes an inclusive end index for the token slice.",
      expected: "The returned token includes the character at the inclusive end index.",
      observed: "String.slice uses an exclusive upper bound, so passing the inclusive end index omits the final character.",
      evidence: ".bottega/evidence/demo/review/diff.patch",
      code_location: { file_path: "src/parse.ts", line: 42 },
    },
  ],
  blocked_checks: [
    { check: "Integration test suite", reason: "The suite requires a configured database, unavailable in the review environment." },
  ],
};

const round2 = {
  schema_version: 1,
  round: 2,
  reviewer: { family: "claude", model: "opus-4.8" },
  target: {
    base_sha: "a7f2d41c89e5b3f16d2a8c9e7b4f1a3c5d6e2f8a",
    head_sha: "e4c1b9f7a3d8e2f5c6a1b4d7e9f2a5c8d1e3f6b9",
    tree_sha: "b5d3e8a1c7f4a2b6d9e1f3a5c7e2d4f6a8b1c3e5",
  },
  evidence_paths: [".bottega/evidence/demo/review/r1-001-recheck.md"],
  rechecks: [
    {
      finding_id: "R1-001",
      status: "fixed",
      evidence: "Re-ran the recorded reproduction; the type guard now narrows before .split(), both branches covered by tests/formatDate.test.ts, no TypeError at the call site.",
    },
  ],
  findings: [],
  blocked_checks: [],
};

function mutated(base: object, change: (r: any) => void): object {
  const copy = JSON.parse(JSON.stringify(base));
  change(copy);
  return copy;
}

describe("report schema", () => {
  it("accepts a round-1 report with a finding and a blocked check", () => {
    expect(validate(round1)).toBe(true);
  });

  it("accepts a delta-round report whose only content is an executed recheck", () => {
    expect(validate(round2)).toBe(true);
  });

  it("rejects a clean-looking report with no evidence paths", () => {
    expect(validate(mutated(round2, (r) => (r.evidence_paths = [])))).toBe(false);
    expect(validate(mutated(round2, (r) => delete r.evidence_paths))).toBe(false);
  });

  it("rejects decoration the contract deliberately dropped: confidence, verdicts, categories", () => {
    expect(validate(mutated(round1, (r) => (r.overall_correctness = "patch is correct")))).toBe(false);
    expect(validate(mutated(round1, (r) => (r.findings[0].confidence = 0.9)))).toBe(false);
    expect(validate(mutated(round1, (r) => (r.findings[0].category = "bug")))).toBe(false);
  });

  it("rejects an unanchored or hollow finding", () => {
    expect(validate(mutated(round1, (r) => delete r.findings[0].code_location))).toBe(false);
    expect(validate(mutated(round1, (r) => (r.findings[0].evidence = "")))).toBe(false);
    expect(validate(mutated(round1, (r) => (r.findings[0].severity = "info")))).toBe(false);
    expect(validate(mutated(round1, (r) => (r.findings[0].code_location.line = 0)))).toBe(false);
  });

  it("rejects a recheck without an executable disposition", () => {
    expect(validate(mutated(round2, (r) => (r.rechecks[0].status = "done")))).toBe(false);
    expect(validate(mutated(round2, (r) => (r.rechecks[0].evidence = "")))).toBe(false);
  });

  it("rejects a report that names no target identity", () => {
    expect(validate(mutated(round1, (r) => delete r.target.tree_sha))).toBe(false);
    expect(validate(mutated(round1, (r) => (r.target.head_sha = "")))).toBe(false);
  });
});

describe("review-dispatch workflow", () => {
  const script = readFileSync(DISPATCH_PATH, "utf8");

  function inlineSchema(): object {
    const start = script.indexOf("const SCHEMA = ");
    expect(start).toBeGreaterThan(-1);
    const open = script.indexOf("{", start);
    let depth = 0;
    let end = open;
    for (; end < script.length; end++) {
      if (script[end] === "{") depth++;
      else if (script[end] === "}") depth--;
      if (depth === 0) break;
    }
    return JSON.parse(script.slice(open, end + 1));
  }

  it("inlines the exact schema from references/report.schema.json", () => {
    expect(inlineSchema()).toEqual(schema);
  });

  it("pins the reviewer agent, its model, and the schema in the one agent() call", () => {
    // The only forms the harness resolves (issue #20): a plugin agent
    // registers as <plugin>:<agent>, and a model is a plain alias; a
    // versioned id like 'opus-4.8' is rejected at dispatch.
    expect(script).toMatch(/agentType:\s*'bottega:reviewer'/);
    expect(script).toMatch(/model:\s*'opus'/);
    expect(script).toMatch(/schema:\s*SCHEMA/);
  });

  // Scope 3 of the route guard checks workflow scripts statically from a
  // run-owning session; the shipped dispatch must pass as-is, and a copy with
  // its model stripped must be what the guard was built to deny.
  const cleanups: string[] = [];
  afterEach(() => {
    while (cleanups.length > 0) rmSync(cleanups.pop()!, { recursive: true, force: true });
  });

  function runOwnedEvent(tool_input: object): object {
    const dir = mkdtempSync(join(tmpdir(), "bottega-review-dispatch-"));
    cleanups.push(dir);
    mkdirSync(join(dir, ".bottega", "wt", "demo", "run"), { recursive: true });
    mkdirSync(join(dir, ".bottega", "run", "demo"), { recursive: true });
    writeFileSync(join(dir, ".bottega", "run", "demo", "owner"), "owner-session\n");
    return { cwd: dir, session_id: "owner-session", tool_name: "Workflow", tool_input };
  }

  function guard(event: object): string {
    const result = spawnSync("node", [ROUTE_GUARD], {
      input: JSON.stringify(event),
      encoding: "utf-8",
    });
    expect(result.status).toBe(0);
    return result.stdout;
  }

  it("passes the route guard from a run-owning session", () => {
    expect(guard(runOwnedEvent({ scriptPath: DISPATCH_PATH }))).toBe("");
  });

  it("is denied by the route guard the moment its model pin is stripped", () => {
    const stripped = script.replace(/model:\s*'opus',\n\s*/, "");
    const out = guard(runOwnedEvent({ script: stripped }));
    const parsed = JSON.parse(out);
    expect(parsed.hookSpecificOutput.permissionDecision).toBe("deny");
    expect(parsed.hookSpecificOutput.permissionDecisionReason).toMatch(/names no model/);
  });
});
