import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Ajv } from "ajv";
import { describe, expect, it } from "vitest";

const SCHEMA = join(
  import.meta.dirname,
  "..",
  "plugins",
  "bottega-dex",
  "skills",
  "code-review",
  "references",
  "report.schema.json",
);

const validate = new Ajv({ strict: true }).compile(
  JSON.parse(readFileSync(SCHEMA, "utf8")),
);

const report = {
  schema_version: 1,
  round: 1,
  reviewer: { family: "codex", model: "gpt-5.6-sol" },
  target: { base_sha: "base", head_sha: "head", tree_sha: "tree" },
  evidence_paths: ["/tmp/review/tests.log"],
  rechecks: [],
  findings: [],
  blocked_checks: [],
};

describe("review report contract", () => {
  it("accepts evidenced reports from the two pinned reviewers", () => {
    expect(validate(report)).toBe(true);
    expect(validate({
      ...report,
      reviewer: { family: "claude", model: "claude-opus-5" },
    })).toBe(true);
  });

  it("rejects hollow reports and unapproved models", () => {
    expect(validate({ ...report, evidence_paths: [] })).toBe(false);
    expect(validate({
      ...report,
      reviewer: { family: "claude", model: "claude-fable-5" },
    })).toBe(false);
    expect(validate({
      ...report,
      reviewer: { family: "codex", model: "claude-opus-5" },
    })).toBe(false);
  });

  it("rejects narrative decoration outside the contract", () => {
    expect(validate({ ...report, verdict: "looks good" })).toBe(false);
  });
});
