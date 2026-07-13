import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SCRIPT = join(
  import.meta.dirname,
  "..",
  "plugins",
  "bottega-dex",
  "scripts",
  "worker-exec",
);
const ROOT = join(import.meta.dirname, "..");

const BASE = [
  "--cwd", "/tmp/worktree",
  "--brief", "/tmp/brief.md",
  "--out", "/tmp/out.json",
  "--events", "/tmp/events.json",
  "--dry-run",
];

function route(role: string) {
  return spawnSync("node", [SCRIPT, "--role", role, ...BASE], { encoding: "utf8" });
}

describe("worker-exec", () => {
  it("routes mechanics to the Codex Luna adapter", () => {
    const result = route("mechanic");
    expect(result.status).toBe(0);
    const raw = JSON.parse(result.stdout);
    expect(raw.adapter).toBe("codex-exec");
    expect(raw.dispatch.argv).toContain("gpt-5.6-luna");
  });

  it("routes the two round-1 reviewers to different model families", () => {
    const codex = JSON.parse(route("codex-reviewer").stdout);
    const claude = JSON.parse(route("claude-reviewer").stdout);
    expect(codex.adapter).toBe("codex-exec");
    expect(codex.dispatch.argv).toContain("gpt-5.6-sol");
    expect(claude.adapter).toBe("claude-exec");
    expect(claude.dispatch.argv).toContain("opus");
  });

  it("does not expose model or effort override options", () => {
    const result = spawnSync("node", [
      SCRIPT,
      "--role", "builder",
      ...BASE,
      "--model", "gpt-5.6-sol",
    ], { encoding: "utf8" });
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/model|Unknown option/i);
  });

  it("rejects a high-permission worker in the primary checkout", () => {
    const result = spawnSync("node", [
      SCRIPT,
      "--role", "qa",
      ...BASE.map((value) => (value === "/tmp/worktree" ? ROOT : value)),
    ], { encoding: "utf8" });
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/primary checkout/);
  });
});
