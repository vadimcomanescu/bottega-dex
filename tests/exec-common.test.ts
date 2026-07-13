import { spawnSync } from "node:child_process";
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
