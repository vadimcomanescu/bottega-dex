import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  chmodSync,
  existsSync,
  linkSync,
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
const HEAD_SHA = "a".repeat(40);
const TREE_SHA = "b".repeat(40);
const MISSING_ROOT = join(tmpdir(), `bottega-dex-missing-${randomUUID()}`);

const BASE = [
  "--role", "reviewer",
  "--cwd", join(MISSING_ROOT, "review"),
  "--brief", join(MISSING_ROOT, "brief.md"),
  "--out", join(MISSING_ROOT, "out.json"),
  "--events", join(MISSING_ROOT, "events.json"),
  "--head", HEAD_SHA,
  "--tree", TREE_SHA,
  "--schema", SCHEMA,
];

function run(args: string[]) {
  return spawnSync(process.execPath, [SCRIPT, ...args, "--dry-run"], {
    encoding: "utf8",
  });
}

describe("claude-exec", () => {
  it("pins a fresh Claude Opus 5 high reviewer with read-only tools", () => {
    const result = run(BASE);
    expect(result.status).toBe(0);
    const raw = JSON.parse(result.stdout);
    expect(raw.command).toBe("claude");
    expect(raw.argv).toContain("-p");
    expect(raw.argv).toContain("--safe-mode");
    expect(raw.argv).toContain("claude-opus-5");
    expect(raw.argv).toContain("high");
    expect(raw.argv).toContain("dontAsk");
    expect(raw.argv).toContain("Read");
    expect(raw.argv).not.toContain("Bash,Read,Glob,Grep");
    const allowedIndex = raw.argv.indexOf("--allowedTools");
    expect(raw.argv[allowedIndex + 1]).toContain("Read(//");
    expect(raw.argv[allowedIndex + 1]).toContain("/review/**)");
    expect(raw.argv).toContain("--setting-sources");
    const settingsIndex = raw.argv.indexOf("--settings");
    const settings = JSON.parse(raw.argv[settingsIndex + 1]);
    expect(settings.permissions.deny).toContain("Bash");
    expect(settings.sandbox).toMatchObject({
      enabled: true,
      failIfUnavailable: true,
      allowUnsandboxedCommands: false,
    });
    expect(settings.sandbox.filesystem).toMatchObject({
      denyRead: ["/"],
      allowRead: [join(MISSING_ROOT, "review")],
      denyWrite: ["/"],
    });
    expect(raw.argv).toContain("--no-session-persistence");
    expect(raw.frozenTarget).toEqual({ headSha: HEAD_SHA, treeSha: TREE_SHA });
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

  it("requires structured output for the external reviewer", () => {
    const withoutSchema = BASE.slice(0, -2);
    const result = run(withoutSchema);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/--schema is required/i);
  });

  it("requires the frozen head and tree for reviewer calls", () => {
    const withoutTarget = BASE.filter((value, index) => (
      !["--head", "--tree"].includes(value)
      && !["--head", "--tree"].includes(BASE[index - 1] ?? "")
    ));
    const result = run(withoutTarget);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/--head is required/i);
  });

  it("requires distinct report and provenance paths", () => {
    const collision = [...BASE];
    collision[collision.indexOf("--events") + 1] = collision[collision.indexOf("--out") + 1]!;
    const result = run(collision);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/--out and --events.*distinct/i);
  });

  it("rejects output paths that alias the same file", () => {
    const root = mkdtempSync(join(tmpdir(), "bottega-dex-output-alias-"));
    try {
      const out = join(root, "out.json");
      const events = join(root, "events.json");
      writeFileSync(out, "");
      linkSync(out, events);
      const args = [...BASE];
      args[args.indexOf("--out") + 1] = out;
      args[args.indexOf("--events") + 1] = events;
      const result = run(args);
      expect(result.status).toBe(2);
      expect(result.stderr).toMatch(/--out and --events.*distinct/i);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each([
    "panelist",
    "judge",
    "user-facing-builder",
    "qa",
    "docs",
    "constructor",
    "__proto__",
  ])(
    "rejects non-review role %s",
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

  it("keeps adapter outputs outside the frozen target and serializes primitives", () => {
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
      const reviewSubdirectory = join(review, "src");
      mkdirSync(reviewSubdirectory);

      const fakeClaude = join(bin, "claude");
      writeFileSync(fakeClaude, `#!/usr/bin/env node
if (process.argv.includes("--version")) {
  process.stdout.write("2.1.219 (Claude Code)\\n");
} else {
  const mode = process.env.FAKE_CLAUDE_MODE ?? "success";
  if (mode === "mutate") {
    require("node:fs").writeFileSync("mutation.txt", "changed\\n");
  }
  const dirtyGitEnvironment = mode === "clean-env"
    && (process.env.GIT_DIR || process.env.GIT_WORK_TREE);
  process.stdout.write(JSON.stringify({
    subtype: mode === "error" || dirtyGitEnvironment ? "error" : "success",
    is_error: Boolean(mode === "error" || dirtyGitEnvironment),
    modelUsage: mode === "wrong-model"
      ? { "claude-haiku-4-5": { outputTokens: 1 } }
      : { "claude-opus-5": { outputTokens: 1 } },
    structured_output: mode === "null-output" ? null : "ok",
  }));
}
`);
      chmodSync(fakeClaude, 0o755);

      const brief = join(root, "brief.md");
      const events = join(root, "events.json");
      const headSha = git(review, "rev-parse", "HEAD").stdout.trim();
      const treeSha = git(review, "rev-parse", "HEAD^{tree}").stdout.trim();
      writeFileSync(brief, "Return the schema.\n");
      const invokeFake = (
        mode: string,
        out: string,
        eventFile: string,
        extraEnvironment: NodeJS.ProcessEnv = {},
      ) => (
        spawnSync(process.execPath, [
          SCRIPT,
          "--role", "reviewer",
          "--cwd", review,
          "--brief", brief,
          "--out", out,
          "--events", eventFile,
          "--head", headSha,
          "--tree", treeSha,
          "--schema", SCHEMA,
        ], {
          encoding: "utf8",
          env: {
            ...process.env,
            PATH: `${bin}:${process.env.PATH}`,
            FAKE_CLAUDE_MODE: mode,
            ...extraEnvironment,
          },
        })
      );

      const wrongTarget = spawnSync(process.execPath, [
        SCRIPT,
        "--role", "reviewer",
        "--cwd", review,
        "--brief", brief,
        "--out", join(root, "wrong-target.json"),
        "--events", join(root, "wrong-target-events.json"),
        "--head", "0".repeat(40),
        "--tree", treeSha,
        "--schema", SCHEMA,
      ], {
        encoding: "utf8",
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
      });
      expect(wrongTarget.status).not.toBe(0);
      expect(wrongTarget.stderr).toMatch(/does not match.*frozen target/i);

      const result = spawnSync(process.execPath, [
        SCRIPT,
        "--role", "reviewer",
        "--cwd", reviewSubdirectory,
        "--brief", brief,
        "--out", join(review, "tracked.txt"),
        "--events", events,
        "--head", headSha,
        "--tree", treeSha,
        "--schema", SCHEMA,
      ], {
        encoding: "utf8",
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
      });

      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(/output.*outside.*review worktree/i);
      expect(readFileSync(join(review, "tracked.txt"), "utf8")).toBe("frozen\n");
      expect(existsSync(events)).toBe(false);

      const missingBrief = spawnSync(process.execPath, [
        SCRIPT,
        "--role", "reviewer",
        "--cwd", review,
        "--brief", join(root, "missing-brief.md"),
        "--out", join(root, "missing-brief-out.json"),
        "--events", join(root, "missing-brief-events.json"),
        "--head", headSha,
        "--tree", treeSha,
        "--schema", SCHEMA,
      ], {
        encoding: "utf8",
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
      });
      expect(missingBrief.status).toBe(2);
      expect(missingBrief.stderr).toMatch(/^claude-exec: cannot read brief:/);

      const missingOutputParent = invokeFake(
        "success",
        join(root, "missing-parent", "out.json"),
        join(root, "missing-parent", "events.json"),
      );
      expect(missingOutputParent.status).toBe(2);
      expect(missingOutputParent.stderr).toMatch(/output parent is not writable/i);

      const mutationOut = join(root, "mutation-out.json");
      const mutationEvents = join(root, "mutation-events.json");
      const mutation = invokeFake("mutate", mutationOut, mutationEvents);
      expect(mutation.status).toBe(2);
      expect(mutation.stderr).toMatch(/worktree is not clean/i);
      expect(existsSync(mutationOut)).toBe(false);
      expect(existsSync(mutationEvents)).toBe(false);
      rmSync(join(review, "mutation.txt"));

      const errorOut = join(root, "error-out.json");
      const errorEvents = join(root, "error-events.json");
      const envelopeError = invokeFake("error", errorOut, errorEvents);
      expect(envelopeError.status).toBe(1);
      expect(envelopeError.stderr).toMatch(/non-success result envelope/i);
      expect(existsSync(errorOut)).toBe(false);
      expect(existsSync(errorEvents)).toBe(false);

      const wrongModelOut = join(root, "wrong-model-out.json");
      const wrongModelEvents = join(root, "wrong-model-events.json");
      const wrongModel = invokeFake("wrong-model", wrongModelOut, wrongModelEvents);
      expect(wrongModel.status).toBe(1);
      expect(wrongModel.stderr).toMatch(/did not prove usage.*claude-opus-5/i);
      expect(existsSync(wrongModelOut)).toBe(false);
      expect(existsSync(wrongModelEvents)).toBe(false);

      const nullOut = join(root, "null-out.json");
      const nullEvents = join(root, "null-events.json");
      const nullOutput = invokeFake("null-output", nullOut, nullEvents);
      expect(nullOutput.status).toBe(1);
      expect(nullOutput.stderr).toMatch(/contained no answer/i);
      expect(existsSync(nullOut)).toBe(false);
      expect(existsSync(nullEvents)).toBe(false);

      const out = join(root, "out.json");
      linkSync(join(review, "tracked.txt"), out);
      const success = invokeFake("clean-env", out, events, {
        GIT_DIR: join(repo, ".git"),
        GIT_WORK_TREE: repo,
      });

      expect(success.status).toBe(0);
      expect(JSON.parse(readFileSync(out, "utf8"))).toBe("ok");
      expect(readFileSync(join(review, "tracked.txt"), "utf8")).toBe("frozen\n");
      expect(JSON.parse(readFileSync(events, "utf8")).frozen_target).toEqual({
        headSha,
        treeSha,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
