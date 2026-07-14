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
  "--schema", SCHEMA,
];

function run(args: string[]) {
  return spawnSync("node", [SCRIPT, ...args, "--dry-run"], { encoding: "utf8" });
}

describe("claude-exec", () => {
  it("pins a fresh Opus xhigh reviewer with a non-editing role and probe tools", () => {
    const result = run(BASE);
    expect(result.status).toBe(0);
    const raw = JSON.parse(result.stdout);
    expect(raw.command).toBe("claude");
    expect(raw.argv).toContain("-p");
    expect(raw.argv).toContain("--safe-mode");
    expect(raw.argv).toContain("opus");
    expect(raw.argv).toContain("xhigh");
    expect(raw.argv).toContain("dontAsk");
    expect(raw.argv).toContain("Bash,Read,Glob,Grep");
    expect(raw.argv).toContain("--no-session-persistence");
  });

  it("passes JSON Schema content to Claude, not a filesystem-only pointer", () => {
    const result = run(BASE);
    expect(result.status).toBe(0);
    const raw = JSON.parse(result.stdout);
    expect(raw.schemaFile).toBe(SCHEMA);
    const schemaIndex = raw.argv.indexOf("--json-schema");
    expect(schemaIndex).toBeGreaterThan(-1);
    expect(raw.argv[schemaIndex + 1]).toBe(readFileSync(SCHEMA, "utf8"));
    expect(raw.route.timeoutMs).toBe(1_200_000);
  });

  it("requires structured output for every external role", () => {
    const withoutSchema = BASE.slice(0, -2);
    const result = run(withoutSchema);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/--schema is required/i);
  });

  it.each([
    ["panelist", "xhigh", "Bash,Read,Glob,Grep"],
    ["judge", "high", ""],
  ])("keeps the external %s route cold and fixed", (role, effort, tools) => {
    const result = run([
      ...BASE.map((value) => (value === "reviewer" ? role : value)),
    ]);
    expect(result.status).toBe(0);
    const raw = JSON.parse(result.stdout);
    expect(raw.argv).toContain("--no-session-persistence");
    expect(raw.route.model).toBe("opus");
    expect(raw.route.effort).toBe(effort);
    expect(raw.route.tools).toBe(tools);
  });

  it.each(["user-facing-builder", "qa", "docs"])(
    "rejects non-cross-family role %s",
    (role) => {
      const result = run([
        ...BASE.map((value) => (value === "reviewer" ? role : value)),
      ]);
      expect(result.status).toBe(2);
      expect(result.stderr).toMatch(/unknown role/);
    },
  );

  it("does not expose session resume options", () => {
    const result = run([...BASE, "--resume", "session-123"]);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/resume|unknown option/i);
  });
});
