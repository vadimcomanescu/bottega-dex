// Step handlers for features/commission-lock.feature — wired by the builder.
//
// Exact-text matching: the registry keys handlers by the literal step text
// from the IR, with no placeholder substitution at lookup time. Two of the
// scenarios reference "login.feature" as a hardcoded literal (not templated
// via their Examples table), so "a signed repo containing \"login.feature\""
// and the templated "a signed repo containing \"<file>\"" are two distinct
// registrations — confirmed by reading build/acceptance/commission-lock.json.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultRegistry, type Example, type World } from "@aps-kit/typescript";

const BIN_PATH = fileURLToPath(new URL("../bin/bottega.js", import.meta.url));

interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

function createRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), "bottega-"));
  mkdirSync(join(dir, "features"), { recursive: true });
  return dir;
}

function writeFeature(dir: string, name: string, content: string): void {
  writeFileSync(join(dir, "features", name), content);
}

function runCli(dir: string, args: string[]): RunResult {
  try {
    const stdout = execFileSync(process.execPath, [BIN_PATH, ...args], {
      cwd: dir,
      encoding: "utf-8",
    });
    return { stdout, stderr: "", exitCode: 0 };
  } catch (err) {
    const e = err as { status?: number | null; stdout?: string; stderr?: string };
    return {
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? "",
      exitCode: e.status ?? 1,
    };
  }
}

function signRepo(file: string): string {
  const dir = createRepo();
  writeFeature(dir, file, `Feature: ${file}\n  Scenario: ok\n`);
  const result = runCli(dir, ["sign"]);
  assert.equal(result.exitCode, 0, `sign failed: ${result.stderr}`);
  return dir;
}

function field(ex: Example, key: string): string {
  const value = ex[key];
  assert.ok(value !== undefined, `example is missing column "${key}"`);
  return value;
}

function assertReportMarks(world: World, path: string, status: string): void {
  const stdout = world.stdout as string;
  assert.ok(
    stdout.includes(`${status} ${path}`),
    `expected stdout to mark "${path}" as "${status}":\n${stdout}`,
  );
}

defaultRegistry.step(
  'a repo with feature files "login.feature" and "billing.feature"',
  (world: World) => {
    const dir = createRepo();
    writeFeature(dir, "login.feature", "Feature: Login\n  Scenario: sign in\n");
    writeFeature(dir, "billing.feature", "Feature: Billing\n  Scenario: pay\n");
    world.dir = dir;
  },
);

defaultRegistry.step('a signed repo containing "login.feature"', (world: World) => {
  world.dir = signRepo("login.feature");
});

defaultRegistry.step('a signed repo containing "<file>"', (world: World, ex: Example) => {
  world.dir = signRepo(field(ex, "file"));
});

defaultRegistry.step('I run "bottega sign"', (world: World) => {
  const result = runCli(world.dir as string, ["sign"]);
  world.stdout = result.stdout;
  world.stderr = result.stderr;
  world.exitCode = result.exitCode;
});

defaultRegistry.step('I run "bottega verify"', (world: World) => {
  const result = runCli(world.dir as string, ["verify"]);
  world.stdout = result.stdout;
  world.stderr = result.stderr;
  world.exitCode = result.exitCode;
});

defaultRegistry.step('the file "<file>" is <change>', (world: World, ex: Example) => {
  const path = join(world.dir as string, "features", field(ex, "file"));
  const change = field(ex, "change");
  if (change === "modified") {
    appendFileSync(path, "\n  # drift\n");
  } else if (change === "deleted") {
    rmSync(path);
  } else {
    throw new Error(`unsupported change: ${change}`);
  }
});

defaultRegistry.step('a new feature file "<newfile>" is added', (world: World, ex: Example) => {
  const newfile = field(ex, "newfile");
  writeFeature(world.dir as string, newfile, `Feature: ${newfile}\n  Scenario: ok\n`);
});

defaultRegistry.step("the lock records <count> files", (world: World, ex: Example) => {
  const lock = JSON.parse(
    readFileSync(join(world.dir as string, ".bottega", "commission.lock"), "utf-8"),
  ) as { files: unknown[] };
  assert.equal(lock.files.length, Number(field(ex, "count")));
});

defaultRegistry.step(
  'the lock entry for "login.feature" matches its content hash',
  (world: World) => {
    const dir = world.dir as string;
    const lock = JSON.parse(
      readFileSync(join(dir, ".bottega", "commission.lock"), "utf-8"),
    ) as { files: Array<{ path: string; sha256: string }> };
    const entry = lock.files.find((f) => f.path === "features/login.feature");
    assert.ok(entry, "no lock entry for features/login.feature");
    const hash = createHash("sha256")
      .update(readFileSync(join(dir, "features", "login.feature")))
      .digest("hex");
    assert.equal(entry?.sha256, hash);
  },
);

defaultRegistry.step("it exits with <exit>", (world: World, ex: Example) => {
  assert.equal(world.exitCode, Number(field(ex, "exit")));
});

defaultRegistry.step('the report marks "<file>" as "<status>"', (world: World, ex: Example) => {
  assertReportMarks(world, `features/${field(ex, "file")}`, field(ex, "status"));
});

defaultRegistry.step(
  'the report marks "<newfile>" as "<status>"',
  (world: World, ex: Example) => {
    assertReportMarks(world, `features/${field(ex, "newfile")}`, field(ex, "status"));
  },
);
