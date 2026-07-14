import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
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

  it("fails if an adapter-owned output changes the frozen target", () => {
    const root = mkdtempSync(join(tmpdir(), "bottega-dex-output-guard-"));
    const repo = join(root, "repo");
    const review = join(root, "review");
    const bin = join(root, "bin");
    mkdirSync(repo);
    mkdirSync(bin);

    const git = (cwd: string, ...args: string[]) => spawnSync("git", args, {
      cwd,
      encoding: "utf8",
    });

    try {
      expect(git(repo, "init", "-q").status).toBe(0);
      expect(git(repo, "config", "user.name", "Bottega Dex Test").status).toBe(0);
      expect(git(repo, "config", "user.email", "test@example.com").status).toBe(0);
      expect(git(repo, "config", "commit.gpgsign", "false").status).toBe(0);
      writeFileSync(join(repo, "tracked.txt"), "frozen\n");
      expect(git(repo, "add", "tracked.txt").status).toBe(0);
      expect(git(repo, "commit", "-qm", "frozen").status).toBe(0);
      expect(git(repo, "worktree", "add", "--detach", review, "HEAD").status).toBe(0);

      const fakeClaude = join(bin, "claude");
      writeFileSync(fakeClaude, `#!/usr/bin/env node
if (process.argv.includes("--version")) {
  process.stdout.write("test-claude 1.0\\n");
} else {
  process.stdout.write(JSON.stringify({
    subtype: "success",
    is_error: false,
    modelUsage: { "claude-opus-4-8": { outputTokens: 1 } },
    structured_output: { status: "ok" },
  }));
}
`);
      chmodSync(fakeClaude, 0o755);

      const brief = join(root, "brief.md");
      const events = join(root, "events.json");
      writeFileSync(brief, "Return the schema.\n");
      const result = spawnSync(process.execPath, [
        SCRIPT,
        "--role", "reviewer",
        "--cwd", review,
        "--brief", brief,
        "--out", join(review, "tracked.txt"),
        "--events", events,
        "--schema", SCHEMA,
      ], {
        encoding: "utf8",
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
      });

      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(/frozen target|modified tracked files/i);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
