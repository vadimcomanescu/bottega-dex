import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const COMMON = pathToFileURL(join(
  import.meta.dirname,
  "..",
  "plugins",
  "bottega-dex",
  "scripts",
  "exec-common.js",
)).href;

describe("spawnBounded", () => {
  it("terminates a child that traps SIGTERM", () => {
    const program = `
      import { spawnBounded } from ${JSON.stringify(COMMON)};
      const started = Date.now();
      const result = spawnBounded(
        process.execPath,
        ["-e", "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000)"],
        { encoding: "utf8" },
        100,
      );
      process.stdout.write(JSON.stringify({
        elapsedMs: Date.now() - started,
        error: result.error?.code,
        signal: result.signal,
      }));
    `;
    const result = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", program],
      { encoding: "utf8", timeout: 2_000, killSignal: "SIGKILL" },
    );
    expect(result.status).toBe(0);
    const raw = JSON.parse(result.stdout);
    expect(raw.error).toBe("ETIMEDOUT");
    expect(raw.signal).toBe("SIGKILL");
    expect(raw.elapsedMs).toBeLessThan(1_500);
  });

  it("terminates descendants in the bounded process group", () => {
    const root = mkdtempSync(join(tmpdir(), "bottega-dex-process-tree-"));
    const marker = join(root, "descendant-survived");
    try {
      const childProgram = `
        const { spawn } = require("node:child_process");
        spawn(process.execPath, ["-e", ${JSON.stringify(`
          setTimeout(() => {
            require("node:fs").writeFileSync(${JSON.stringify(marker)}, "alive");
          }, 400);
          setInterval(() => {}, 1000);
        `)}]);
        setInterval(() => {}, 1000);
      `;
      const program = `
        import { existsSync } from "node:fs";
        import { spawnProcessTreeBounded } from ${JSON.stringify(COMMON)};
        const result = await spawnProcessTreeBounded(
          process.execPath,
          ["-e", ${JSON.stringify(childProgram)}],
          { encoding: "utf8" },
          100,
        );
        await new Promise((resolve) => setTimeout(resolve, 600));
        process.stdout.write(JSON.stringify({
          error: result.error?.code,
          survived: existsSync(${JSON.stringify(marker)}),
        }));
      `;
      const result = spawnSync(
        process.execPath,
        ["--input-type=module", "-e", program],
        { encoding: "utf8", timeout: 2_000, killSignal: "SIGKILL" },
      );
      expect(result.status).toBe(0);
      expect(JSON.parse(result.stdout)).toEqual({
        error: "ETIMEDOUT",
        survived: false,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("terminates descendants when the adapter is cancelled", async () => {
    const root = mkdtempSync(join(tmpdir(), "bottega-dex-process-cancel-"));
    const marker = join(root, "descendant-survived");
    try {
      const childProgram = `
        const { spawn } = require("node:child_process");
        spawn(process.execPath, ["-e", ${JSON.stringify(`
          setTimeout(() => {
            require("node:fs").writeFileSync(${JSON.stringify(marker)}, "alive");
          }, 400);
          setInterval(() => {}, 1000);
        `)}]);
        setInterval(() => {}, 1000);
      `;
      const program = `
        import { spawnProcessTreeBounded } from ${JSON.stringify(COMMON)};
        const pending = spawnProcessTreeBounded(
          process.execPath,
          ["-e", ${JSON.stringify(childProgram)}],
          { encoding: "utf8" },
          10_000,
        );
        process.stdout.write("ready\\n");
        await pending;
      `;
      const runner = spawn(
        process.execPath,
        ["--input-type=module", "-e", program],
        { stdio: ["ignore", "pipe", "pipe"] },
      );
      await new Promise<void>((resolveReady, rejectReady) => {
        runner.once("error", rejectReady);
        runner.stdout.once("data", () => resolveReady());
      });
      runner.kill("SIGTERM");
      const signal = await new Promise<NodeJS.Signals | null>((resolveClose) => {
        runner.once("close", (_status, closeSignal) => resolveClose(closeSignal));
      });
      await new Promise((resolveWait) => setTimeout(resolveWait, 600));
      expect(signal).toBe("SIGTERM");
      expect(existsSync(marker)).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("Claude provenance", () => {
  it("requires a Claude Code release that supports safe mode", async () => {
    const { supportsSafeModeVersion } = await import(COMMON);
    expect(supportsSafeModeVersion("2.1.219 (Claude Code)")).toBe(true);
    expect(supportsSafeModeVersion("2.2.0 (Claude Code)")).toBe(true);
    expect(supportsSafeModeVersion("2.1.218 (Claude Code)")).toBe(false);
    expect(supportsSafeModeVersion("test-claude 1.0")).toBe(false);
  });

  it("accepts usage from the requested model family", async () => {
    const { usesRequestedClaudeModel } = await import(COMMON);
    expect(usesRequestedClaudeModel({
      modelUsage: {
        "claude-haiku-4-5": { outputTokens: 3 },
        "claude-opus-5": { outputTokens: 20 },
      },
    }, "claude-opus-5")).toBe(true);
    expect(usesRequestedClaudeModel({
      modelUsage: {
        "claude-opus-5": { outputTokens: 20 },
        "claude-sonnet-4-6": { outputTokens: 3 },
      },
    }, "claude-opus-5")).toBe(false);
  });

  it("rejects envelopes without usage from the requested family", async () => {
    const { usesRequestedClaudeModel } = await import(COMMON);
    expect(usesRequestedClaudeModel({
      modelUsage: { "claude-haiku-4-5": { outputTokens: 3 } },
    }, "claude-opus-5")).toBe(false);
    expect(usesRequestedClaudeModel({
      modelUsage: { "claude-opus-5": {} },
    }, "claude-opus-5")).toBe(false);
    expect(usesRequestedClaudeModel({
      modelUsage: { "claude-opus-5": { outputTokens: 0 } },
    }, "claude-opus-5")).toBe(false);
    expect(usesRequestedClaudeModel({}, "claude-opus-5")).toBe(false);
  });
});

describe("review target identity", () => {
  it("changes when a reviewer commits a different frozen target", async () => {
    const cwd = mkdtempSync(join(tmpdir(), "bottega-dex-identity-"));
    try {
      const git = (...args: string[]) => spawnSync("git", args, {
        cwd,
        encoding: "utf8",
      });
      expect(git("init", "-q").status).toBe(0);
      expect(git("config", "user.name", "Bottega Dex Test").status).toBe(0);
      expect(git("config", "user.email", "test@example.com").status).toBe(0);
      expect(git("config", "commit.gpgsign", "false").status).toBe(0);
      writeFileSync(join(cwd, "tracked.txt"), "before\n");
      expect(git("add", "tracked.txt").status).toBe(0);
      expect(git("commit", "-qm", "before").status).toBe(0);

      const { readTrackedWorktreeIdentity } = await import(COMMON);
      const before = readTrackedWorktreeIdentity("test", cwd);
      writeFileSync(join(cwd, "tracked.txt"), "after\n");
      expect(git("commit", "-qam", "after").status).toBe(0);
      const after = readTrackedWorktreeIdentity("test", cwd);

      expect(after.headSha).not.toBe(before.headSha);
      expect(after.treeSha).not.toBe(before.treeSha);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("treats untracked files as a dirty review target", () => {
    const cwd = mkdtempSync(join(tmpdir(), "bottega-dex-cleanliness-"));
    try {
      const git = (...args: string[]) => spawnSync("git", args, {
        cwd,
        encoding: "utf8",
      });
      expect(git("init", "-q").status).toBe(0);
      expect(git("config", "user.name", "Bottega Dex Test").status).toBe(0);
      expect(git("config", "user.email", "test@example.com").status).toBe(0);
      expect(git("config", "commit.gpgsign", "false").status).toBe(0);
      writeFileSync(join(cwd, "tracked.txt"), "tracked\n");
      expect(git("add", "tracked.txt").status).toBe(0);
      expect(git("commit", "-qm", "tracked").status).toBe(0);
      writeFileSync(join(cwd, "untracked.txt"), "untracked\n");

      const program = `
        import { assertTrackedWorktreeClean } from ${JSON.stringify(COMMON)};
        assertTrackedWorktreeClean("test", ${JSON.stringify(cwd)});
      `;
      const result = spawnSync(
        process.execPath,
        ["--input-type=module", "-e", program],
        { encoding: "utf8" },
      );
      expect(result.status).toBe(2);
      expect(result.stderr).toMatch(/worktree is not clean/i);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("treats ignored files as a dirty review target", () => {
    const cwd = mkdtempSync(join(tmpdir(), "bottega-dex-ignored-"));
    try {
      const git = (...args: string[]) => spawnSync("git", args, {
        cwd,
        encoding: "utf8",
      });
      expect(git("init", "-q").status).toBe(0);
      expect(git("config", "user.name", "Bottega Dex Test").status).toBe(0);
      expect(git("config", "user.email", "test@example.com").status).toBe(0);
      expect(git("config", "commit.gpgsign", "false").status).toBe(0);
      writeFileSync(join(cwd, ".gitignore"), "ignored.txt\n");
      expect(git("add", ".gitignore").status).toBe(0);
      expect(git("commit", "-qm", "ignore fixture").status).toBe(0);
      writeFileSync(join(cwd, "ignored.txt"), "ignored\n");

      const program = `
        import { assertTrackedWorktreeClean } from ${JSON.stringify(COMMON)};
        assertTrackedWorktreeClean("test", ${JSON.stringify(cwd)});
      `;
      const result = spawnSync(
        process.execPath,
        ["--input-type=module", "-e", program],
        { encoding: "utf8" },
      );
      expect(result.status).toBe(2);
      expect(result.stderr).toMatch(/worktree is not clean/i);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
