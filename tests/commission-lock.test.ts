import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  NoFeatureFilesError,
  UnsignedError,
  lockPath,
  sign,
  verify,
} from "../src/commission-lock.ts";

let dir: string;

function writeFeature(relPath: string, content: string): void {
  const absPath = join(dir, relPath);
  mkdirSync(join(absPath, ".."), { recursive: true });
  writeFileSync(absPath, content);
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "commission-lock-test-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("sign", () => {
  it("throws when there are no feature files", () => {
    expect(() => sign(dir)).toThrow(NoFeatureFilesError);
  });

  it("writes a lock covering every feature file, sorted by path", () => {
    writeFeature("features/billing.feature", "Feature: Billing\n");
    writeFeature("features/login.feature", "Feature: Login\n");

    const lock = sign(dir);

    expect(lock.version).toBe(1);
    expect(lock.files.map((f) => f.path)).toEqual([
      "features/billing.feature",
      "features/login.feature",
    ]);
  });

  it("records the sha256 of each file's raw bytes", () => {
    writeFeature("features/login.feature", "Feature: Login\n");

    const lock = sign(dir);

    const expected = createHash("sha256")
      .update(readFileSync(join(dir, "features/login.feature")))
      .digest("hex");
    expect(lock.files[0]?.sha256).toBe(expected);
  });

  it("finds feature files nested in subdirectories", () => {
    writeFeature("features/checkout/pay.feature", "Feature: Pay\n");

    const lock = sign(dir);

    expect(lock.files.map((f) => f.path)).toEqual(["features/checkout/pay.feature"]);
  });

  it("creates .bottega/ if missing and writes deterministic, trailing-newline JSON", () => {
    writeFeature("features/login.feature", "Feature: Login\n");

    sign(dir);

    const raw = readFileSync(lockPath(dir), "utf-8");
    expect(raw.endsWith("\n")).toBe(true);
    expect(raw).toBe(`${JSON.stringify(JSON.parse(raw), null, 2)}\n`);
  });

  it("is idempotent: re-signing an untouched repo reproduces the same lock", () => {
    writeFeature("features/login.feature", "Feature: Login\n");

    sign(dir);
    const first = readFileSync(lockPath(dir), "utf-8");
    sign(dir);
    const second = readFileSync(lockPath(dir), "utf-8");

    expect(second).toBe(first);
  });
});

describe("verify", () => {
  it("throws UnsignedError when no lock exists", () => {
    writeFeature("features/login.feature", "Feature: Login\n");
    expect(() => verify(dir)).toThrow(UnsignedError);
  });

  it("reports clean when nothing has changed", () => {
    writeFeature("features/login.feature", "Feature: Login\n");
    sign(dir);

    expect(verify(dir)).toEqual({ status: "clean", drift: [] });
  });

  it("reports modified when a locked file's content changes", () => {
    writeFeature("features/login.feature", "Feature: Login\n");
    sign(dir);
    writeFeature("features/login.feature", "Feature: Login\nScenario: changed\n");

    const result = verify(dir);

    expect(result.status).toBe("drift");
    expect(result.drift).toEqual([{ status: "modified", path: "features/login.feature" }]);
  });

  it("reports removed when a locked file is deleted", () => {
    writeFeature("features/login.feature", "Feature: Login\n");
    sign(dir);
    rmSync(join(dir, "features/login.feature"));

    const result = verify(dir);

    expect(result.status).toBe("drift");
    expect(result.drift).toEqual([{ status: "removed", path: "features/login.feature" }]);
  });

  it("reports added when a new feature file appears after sign-off", () => {
    writeFeature("features/login.feature", "Feature: Login\n");
    sign(dir);
    writeFeature("features/extra.feature", "Feature: Extra\n");

    const result = verify(dir);

    expect(result.status).toBe("drift");
    expect(result.drift).toEqual([{ status: "added", path: "features/extra.feature" }]);
  });
});
