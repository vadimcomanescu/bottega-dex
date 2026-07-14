import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
});

describe("Claude provenance", () => {
  it("accepts usage from the requested model family", async () => {
    const { usesRequestedClaudeModel } = await import(COMMON);
    expect(usesRequestedClaudeModel({
      modelUsage: {
        "claude-haiku-4-5": { outputTokens: 3 },
        "claude-opus-4-8": { outputTokens: 20 },
      },
    }, "opus")).toBe(true);
  });

  it("rejects envelopes without usage from the requested family", async () => {
    const { usesRequestedClaudeModel } = await import(COMMON);
    expect(usesRequestedClaudeModel({
      modelUsage: { "claude-haiku-4-5": { outputTokens: 3 } },
    }, "opus")).toBe(false);
    expect(usesRequestedClaudeModel({
      modelUsage: { "claude-opus-4-8": {} },
    }, "opus")).toBe(false);
    expect(usesRequestedClaudeModel({
      modelUsage: { "claude-opus-4-8": { outputTokens: 0 } },
    }, "opus")).toBe(false);
    expect(usesRequestedClaudeModel({}, "opus")).toBe(false);
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
});
