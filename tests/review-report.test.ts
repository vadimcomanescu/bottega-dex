import { Ajv } from "ajv";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SCHEMA = join(
  import.meta.dirname,
  "..",
  "plugins",
  "bottega-dex",
  "skills",
  "run",
  "references",
  "report.schema.json",
);

const validate = new Ajv({ strict: true }).compile(JSON.parse(readFileSync(SCHEMA, "utf8")));

const report = {
  schema_version: 2,
  round: 1,
  reviewer: { family: "codex", model: "gpt-5.6" },
  target: { base_sha: "base", head_sha: "head", tree_sha: "tree" },
  architecture: {
    status: "conforms",
    evidence: "checked every fixed decision in the brief against the diff",
  },
  evidence_paths: ["/tmp/review/tests.log"],
  rechecks: [],
  findings: [],
  blocked_checks: [],
};

describe("review report contract", () => {
  it("accepts an evidenced clean report", () => {
    expect(validate(report)).toBe(true);
  });

  it("rejects a hollow clean report", () => {
    expect(validate({ ...report, evidence_paths: [] })).toBe(false);
  });

  it("rejects a report without an architecture verdict", () => {
    const { architecture, ...bare } = report;
    expect(validate(bare)).toBe(false);
  });

  it("keys rechecks by check id", () => {
    const recheck = { status: "fixed", evidence: "gate rerun green" };
    expect(validate({
      ...report,
      round: 2,
      rechecks: [{ check_id: "COD-001", ...recheck }],
    })).toBe(true);
    expect(validate({
      ...report,
      round: 2,
      rechecks: [{ finding_id: "COD-001", ...recheck }],
    })).toBe(false);
  });

  it("rejects narrative decoration outside the contract", () => {
    expect(validate({ ...report, verdict: "looks good" })).toBe(false);
  });
});
