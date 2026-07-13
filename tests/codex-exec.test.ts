import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SCRIPT = join(
  import.meta.dirname,
  "..",
  "plugins",
  "bottega-dex",
  "scripts",
  "codex-exec",
);

const BASE = [
  "--role", "builder",
  "--cwd", "/tmp/worktree",
  "--brief", "/tmp/brief.md",
  "--out", "/tmp/out.json",
  "--events", "/tmp/events.jsonl",
];

function dryRun(...extra: string[]): { status: number | null; raw: any } {
  const result = spawnSync("node", [SCRIPT, ...BASE, ...extra, "--dry-run"], {
    encoding: "utf8",
  });
  return {
    status: result.status,
    raw: result.status === 0 ? JSON.parse(result.stdout) : null,
  };
}

describe("codex-exec", () => {
  it("pins Sol at high for a builder", () => {
    const { status, raw } = dryRun();
    expect(status).toBe(0);
    expect(raw.command).toBe("codex");
    expect(raw.argv).toEqual([
      "exec",
      "--ignore-user-config",
      "--strict-config",
      "-m", "gpt-5.6-sol",
      "-c", "model_reasoning_effort=high",
      "-s", "danger-full-access",
      "-C", "/tmp/worktree",
      "--json",
      "-o", "/tmp/out.json",
    ]);
  });

  it("pins Luna at high for mechanical work", () => {
    const result = spawnSync("node", [
      SCRIPT,
      ...BASE.map((value) => (value === "builder" ? "mechanic" : value)),
      "--dry-run",
    ], { encoding: "utf8" });
    expect(result.status).toBe(0);
    const raw = JSON.parse(result.stdout);
    expect(raw.argv).toContain("gpt-5.6-luna");
    expect(raw.argv).toContain("model_reasoning_effort=high");
  });

  it("gives reviewers a disposable full-capability checkout and attaches their schema", () => {
    const result = spawnSync("node", [
      SCRIPT,
      ...BASE.map((value) => (value === "builder" ? "reviewer" : value)),
      "--schema", "/abs/report.schema.json",
      "--dry-run",
    ], { encoding: "utf8" });
    expect(result.status).toBe(0);
    const raw = JSON.parse(result.stdout);
    expect(raw.argv).toContain("danger-full-access");
    expect(raw.argv).toContain("--output-schema");
    expect(raw.argv[raw.argv.indexOf("--output-schema") + 1]).toBe(
      "/abs/report.schema.json",
    );
  });

  it("re-enters the route sandbox when resuming", () => {
    const { raw } = dryRun("--resume", "thread-123");
    expect(raw.argv.slice(0, 3)).toEqual(["exec", "resume", "thread-123"]);
    expect(raw.argv).toContain("sandbox_mode=danger-full-access");
    expect(raw.argv).not.toContain("-s");
    expect(raw.argv).not.toContain("-C");
    expect(raw.argv.at(-1)).toBe("-");
    expect(raw.cwd).toBe("/tmp/worktree");
  });

  it("rejects an unknown route instead of accepting caller-selected models", () => {
    const result = spawnSync("node", [
      SCRIPT,
      ...BASE.map((value) => (value === "builder" ? "premium" : value)),
      "--dry-run",
    ], { encoding: "utf8" });
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/unknown role/);
  });
});
