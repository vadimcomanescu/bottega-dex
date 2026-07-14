import {
  accessSync,
  constants,
  existsSync,
  realpathSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { delimiter, isAbsolute, join } from "node:path";
import { parseArgs } from "node:util";

export function fail(prefix, message, code = 2) {
  process.stderr.write(`${prefix}: ${message}\n`);
  process.exit(code);
}

export function parseClaudeArgs(prefix) {
  let values;
  try {
    ({ values } = parseArgs({
      options: {
        role: { type: "string" },
        cwd: { type: "string" },
        brief: { type: "string" },
        out: { type: "string" },
        events: { type: "string" },
        schema: { type: "string" },
        "dry-run": { type: "boolean", default: false },
      },
    }));
  } catch (error) {
    fail(prefix, error.message);
  }

  for (const name of ["role", "cwd", "brief", "out", "events", "schema"]) {
    if (!values[name]) fail(prefix, `--${name} is required`);
  }
  return values;
}

export function usesRequestedClaudeModel(envelope, requestedModel) {
  const usage = envelope?.modelUsage ?? envelope?.model_usage;
  if (!usage || typeof usage !== "object") return false;
  const needle = requestedModel.toLowerCase();
  const counters = [
    "inputTokens",
    "outputTokens",
    "cacheReadInputTokens",
    "cacheCreationInputTokens",
    "input_tokens",
    "output_tokens",
    "cache_read_input_tokens",
    "cache_creation_input_tokens",
    "costUSD",
    "cost_usd",
  ];
  return Object.entries(usage).some(([model, values]) => (
    model.toLowerCase().includes(needle)
    && values
    && typeof values === "object"
    && counters.some((counter) => Number(values[counter]) > 0)
  ));
}

export function binaryOnPath(name) {
  for (const entry of (process.env.PATH ?? "").split(delimiter)) {
    if (!entry || !isAbsolute(entry)) continue;
    const candidate = join(entry, name);
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Try the next absolute PATH entry.
    }
  }
  return null;
}

export function spawnBounded(command, argv, options, timeoutMs) {
  return spawnSync(command, argv, {
    ...options,
    timeout: timeoutMs,
    killSignal: "SIGKILL",
  });
}

export function assertIsolatedGitWorktree(
  prefix,
  cwd,
  { allowMissing = false } = {},
) {
  if (!existsSync(cwd)) {
    if (allowMissing) return;
    fail(prefix, `worker directory does not exist: ${cwd}`);
  }

  const git = binaryOnPath("git");
  if (!git) fail(prefix, "git was not found in an absolute PATH entry", 127);

  const resolveGitPath = (flag) => {
    const result = spawnSync(
      git,
      ["rev-parse", "--path-format=absolute", flag],
      { cwd, encoding: "utf8" },
    );
    if (result.status !== 0) {
      fail(prefix, `worker directory is not a Git worktree: ${cwd}`);
    }
    return realpathSync(result.stdout.trim());
  };

  const gitDir = resolveGitPath("--git-dir");
  const commonDir = resolveGitPath("--git-common-dir");
  if (gitDir === commonDir) {
    fail(prefix, `high-permission worker cannot run in the primary checkout: ${cwd}`);
  }
}

export function assertTrackedWorktreeClean(prefix, cwd) {
  const git = binaryOnPath("git");
  if (!git) fail(prefix, "git was not found in an absolute PATH entry", 127);

  for (const args of [
    ["diff", "--quiet", "--no-ext-diff"],
    ["diff", "--cached", "--quiet", "--no-ext-diff"],
  ]) {
    const result = spawnSync(git, args, { cwd, encoding: "utf8" });
    if (result.status !== 0) {
      fail(prefix, `reviewer modified tracked files in ${cwd}`);
    }
  }
}

export function readTrackedWorktreeIdentity(prefix, cwd) {
  const git = binaryOnPath("git");
  if (!git) fail(prefix, "git was not found in an absolute PATH entry", 127);

  const resolve = (revision) => {
    const result = spawnSync(git, ["rev-parse", revision], {
      cwd,
      encoding: "utf8",
    });
    if (result.status !== 0 || !result.stdout?.trim()) {
      fail(prefix, `cannot resolve ${revision} in ${cwd}`);
    }
    return result.stdout.trim();
  };

  return {
    headSha: resolve("HEAD"),
    treeSha: resolve("HEAD^{tree}"),
  };
}

export function assertTrackedWorktreeUnchanged(prefix, cwd, expected) {
  assertTrackedWorktreeClean(prefix, cwd);
  const actual = readTrackedWorktreeIdentity(prefix, cwd);
  if (
    actual.headSha !== expected.headSha
    || actual.treeSha !== expected.treeSha
  ) {
    fail(prefix, `reviewer changed the frozen target in ${cwd}`);
  }
}
