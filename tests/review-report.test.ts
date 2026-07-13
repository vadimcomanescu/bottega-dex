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
  "reviewing",
  "references",
  "report.schema.json",
);

const validate = new Ajv({ strict: true }).compile(JSON.parse(readFileSync(SCHEMA, "utf8")));

const report = {
  schema_version: 1,
  round: 1,
  reviewer: { family: "codex", model: "gpt-5.6-sol" },
  target: { base_sha: "base", head_sha: "head", tree_sha: "tree" },
  evidence_paths: [".bottega/evidence/review/tests.log"],
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

  it("rejects narrative decoration outside the contract", () => {
    expect(validate({ ...report, verdict: "looks good" })).toBe(false);
  });
});
