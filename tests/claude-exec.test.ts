import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SCRIPT = join(
  import.meta.dirname,
  "..",
  "plugins",
  "bottega-dex",
  "scripts",
  "claude-exec",
);
const SCHEMA = join(import.meta.dirname, "fixtures", "smoke.schema.json");

const BASE = [
  "--role", "reviewer",
  "--cwd", "/tmp/review",
  "--brief", "/tmp/brief.md",
  "--out", "/tmp/out.json",
  "--events", "/tmp/events.json",
];

function run(args: string[]) {
  return spawnSync("node", [SCRIPT, ...args, "--dry-run"], { encoding: "utf8" });
}

describe("claude-exec", () => {
  it("pins a fresh Opus xhigh reviewer with a read-only tool surface", () => {
    const result = run(BASE);
    expect(result.status).toBe(0);
    const raw = JSON.parse(result.stdout);
    expect(raw.command).toBe("claude");
    expect(raw.argv).toContain("--safe-mode");
    expect(raw.argv).toContain("opus");
    expect(raw.argv).toContain("xhigh");
    expect(raw.argv).toContain("dontAsk");
    expect(raw.argv).toContain("Bash,Read,Glob,Grep");
    expect(raw.argv).toContain("--no-session-persistence");
  });

  it("passes JSON Schema content to Claude, not a filesystem-only pointer", () => {
    const result = run([...BASE, "--schema", SCHEMA]);
    expect(result.status).toBe(0);
    const raw = JSON.parse(result.stdout);
    expect(raw.schemaFile).toBe(SCHEMA);
    const schemaIndex = raw.argv.indexOf("--json-schema");
    expect(schemaIndex).toBeGreaterThan(-1);
    expect(raw.argv[schemaIndex + 1]).toBe(readFileSync(SCHEMA, "utf8"));
    expect(raw.route.timeoutMs).toBe(1_200_000);
  });

  it("keeps builder sessions resumable and pins Opus xhigh", () => {
    const result = run([
      ...BASE.map((value) => (value === "reviewer" ? "user-facing-builder" : value)),
      "--resume", "session-123",
    ]);
    expect(result.status).toBe(0);
    const raw = JSON.parse(result.stdout);
    expect(raw.argv).toContain("--resume");
    expect(raw.argv).toContain("session-123");
    expect(raw.argv).not.toContain("--no-session-persistence");
    expect(raw.argv).toContain("bypassPermissions");
  });

  it("rejects resume for roles that must arrive cold", () => {
    const result = run([...BASE, "--resume", "session-123"]);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/cannot be resumed/);
  });
});
