import {
  accessSync,
  constants,
  existsSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import { randomUUID } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import {
  basename,
  delimiter,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { parseArgs } from "node:util";

export function fail(prefix, message, code = 2) {
  writeSync(process.stderr.fd, `${prefix}: ${message}\n`);
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
        head: { type: "string" },
        tree: { type: "string" },
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
  const usedModels = Object.entries(usage).filter(([, values]) => (
    values
    && typeof values === "object"
    && counters.some((counter) => Number(values[counter]) > 0)
  )).map(([model]) => model.toLowerCase());
  return usedModels.some((model) => model.includes(needle))
    && usedModels.every((model) => (
      model.includes(needle)
      || model.includes("claude-haiku-4-5")
    ));
}

export function supportsSafeModeVersion(version) {
  const match = version.match(/\b(\d+)\.(\d+)\.(\d+)\b/);
  if (!match) return false;
  const actual = match.slice(1).map(Number);
  const minimum = [2, 1, 219];
  for (let index = 0; index < minimum.length; index += 1) {
    if (actual[index] > minimum[index]) return true;
    if (actual[index] < minimum[index]) return false;
  }
  return true;
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

function killProcessTree(child) {
  if (!child.pid) return;
  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    child.kill("SIGKILL");
  }
}

export function spawnProcessTreeBounded(command, argv, options, timeoutMs) {
  const {
    encoding,
    input,
    maxBuffer = 1024 * 1024,
    ...spawnOptions
  } = options;
  return new Promise((resolveResult) => {
    const child = spawn(command, argv, {
      ...spawnOptions,
      detached: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const stdout = [];
    const stderr = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let processError = null;
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      killProcessTree(child);
    }, timeoutMs);

    const terminate = (signal) => {
      killProcessTree(child);
      process.removeListener("SIGINT", onInterrupt);
      process.removeListener("SIGTERM", onTerminate);
      process.kill(process.pid, signal);
    };
    const onInterrupt = () => terminate("SIGINT");
    const onTerminate = () => terminate("SIGTERM");
    process.once("SIGINT", onInterrupt);
    process.once("SIGTERM", onTerminate);

    const capture = (chunks, streamName) => (chunk) => {
      chunks.push(chunk);
      if (streamName === "stdout") stdoutBytes += chunk.length;
      else stderrBytes += chunk.length;
      if (stdoutBytes > maxBuffer || stderrBytes > maxBuffer) {
        processError = Object.assign(new Error(`${streamName} exceeded maxBuffer`), {
          code: "ENOBUFS",
        });
        killProcessTree(child);
      }
    };
    child.stdout.on("data", capture(stdout, "stdout"));
    child.stderr.on("data", capture(stderr, "stderr"));
    child.on("error", (error) => {
      processError = error;
    });
    child.on("close", (status, signal) => {
      clearTimeout(timeout);
      process.removeListener("SIGINT", onInterrupt);
      process.removeListener("SIGTERM", onTerminate);
      if (timedOut) {
        processError = Object.assign(new Error(`spawn ${command} ETIMEDOUT`), {
          code: "ETIMEDOUT",
        });
      }
      const format = (chunks) => {
        const buffer = Buffer.concat(chunks);
        return encoding ? buffer.toString(encoding) : buffer;
      };
      resolveResult({
        status,
        signal,
        stdout: format(stdout),
        stderr: format(stderr),
        error: processError,
      });
    });
    child.stdin.on("error", () => {});
    child.stdin.end(input);
  });
}

const GIT_TIMEOUT_MS = 10_000;
const GIT_REPOSITORY_ENVIRONMENT = [
  "GIT_ALTERNATE_OBJECT_DIRECTORIES",
  "GIT_CEILING_DIRECTORIES",
  "GIT_COMMON_DIR",
  "GIT_DIR",
  "GIT_DISCOVERY_ACROSS_FILESYSTEM",
  "GIT_INDEX_FILE",
  "GIT_NAMESPACE",
  "GIT_OBJECT_DIRECTORY",
  "GIT_PREFIX",
  "GIT_WORK_TREE",
];

export function environmentWithoutGitOverrides(environment = process.env) {
  const cleanEnvironment = { ...environment };
  for (const name of GIT_REPOSITORY_ENVIRONMENT) {
    delete cleanEnvironment[name];
  }
  return cleanEnvironment;
}

function runGit(prefix, git, args, cwd) {
  const gitEnvironment = environmentWithoutGitOverrides();
  gitEnvironment.GIT_OPTIONAL_LOCKS = "0";
  gitEnvironment.GIT_TERMINAL_PROMPT = "0";
  const result = spawnBounded(
    git,
    ["-c", "core.fsmonitor=false", ...args],
    {
      cwd,
      encoding: "utf8",
      maxBuffer: 1024 * 1024,
      env: gitEnvironment,
    },
    GIT_TIMEOUT_MS,
  );
  if (result.error?.code === "ETIMEDOUT") {
    fail(prefix, `Git check exceeded its ${GIT_TIMEOUT_MS}ms timeout`);
  }
  return result;
}

function pathsReferToSameFile(left, right) {
  const leftStat = statSync(left);
  const rightStat = statSync(right);
  return leftStat.dev === rightStat.dev && leftStat.ino === rightStat.ino;
}

function usesCaseInsensitivePaths(path) {
  let current = realpathSync(path);
  while (dirname(current) !== current) {
    const name = basename(current);
    const toggled = name.replace(/[A-Za-z]/, (character) => (
      character === character.toLowerCase()
        ? character.toUpperCase()
        : character.toLowerCase()
    ));
    if (toggled !== name) {
      const probe = join(dirname(current), toggled);
      if (existsSync(probe)) return pathsReferToSameFile(current, probe);
    }
    current = dirname(current);
  }
  return false;
}

function canonicalCandidate(path) {
  let ancestor = resolve(path);
  const missing = [];
  while (!existsSync(ancestor)) {
    const parent = dirname(ancestor);
    if (parent === ancestor) break;
    missing.unshift(basename(ancestor));
    ancestor = parent;
  }
  const candidate = resolve(realpathSync(ancestor), ...missing);
  return usesCaseInsensitivePaths(ancestor)
    ? candidate.toLowerCase()
    : candidate;
}

export function assertDistinctOutputPaths(prefix, out, events) {
  const sameCandidate = canonicalCandidate(out) === canonicalCandidate(events);
  let sameExistingFile = false;
  if (existsSync(out) && existsSync(events)) {
    sameExistingFile = pathsReferToSameFile(out, events);
  }
  if (sameCandidate || sameExistingFile) {
    fail(prefix, "--out and --events must be distinct paths");
  }
}

export function assertOutputParentsWritable(prefix, ...paths) {
  for (const path of paths) {
    try {
      accessSync(dirname(path), constants.W_OK);
      if (existsSync(path) && statSync(path).isDirectory()) {
        fail(prefix, `adapter output path is a directory: ${path}`);
      }
    } catch (error) {
      fail(prefix, `adapter output parent is not writable: ${path}: ${error.message}`);
    }
  }
}

export function writeFileAtomic(path, content) {
  const temporary = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`);
  try {
    writeFileSync(temporary, content, { flag: "wx", mode: 0o600 });
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
}

export function assertOutputPathsOutsideWorktree(prefix, cwd, ...paths) {
  const worktree = canonicalCandidate(cwd);
  for (const path of paths) {
    const candidate = canonicalCandidate(path);
    const offset = relative(worktree, candidate);
    if (
      offset === ""
      || (!offset.startsWith(`..${sep}`) && offset !== ".." && !isAbsolute(offset))
    ) {
      fail(prefix, `adapter output must be outside the review worktree: ${path}`);
    }
  }
}

export function assertIsolatedGitWorktree(
  prefix,
  cwd,
  { allowMissing = false } = {},
) {
  if (!existsSync(cwd)) {
    if (allowMissing) return resolve(cwd);
    fail(prefix, `worker directory does not exist: ${cwd}`);
  }

  const git = binaryOnPath("git");
  if (!git) fail(prefix, "git was not found in an absolute PATH entry", 127);

  const resolveGitPath = (flag) => {
    const result = runGit(
      prefix,
      git,
      ["rev-parse", "--path-format=absolute", flag],
      cwd,
    );
    if (result.status !== 0) {
      fail(prefix, `worker directory is not a Git worktree: ${cwd}`);
    }
    return realpathSync(result.stdout.trim());
  };

  const gitDir = resolveGitPath("--git-dir");
  const commonDir = resolveGitPath("--git-common-dir");
  const worktreeRoot = resolveGitPath("--show-toplevel");
  if (gitDir === commonDir) {
    fail(prefix, `high-permission worker cannot run in the primary checkout: ${cwd}`);
  }
  const requestedDirectory = realpathSync(cwd);
  const offset = relative(worktreeRoot, requestedDirectory);
  if (offset.startsWith(`..${sep}`) || offset === ".." || isAbsolute(offset)) {
    fail(prefix, `worker directory is outside its resolved Git worktree: ${cwd}`);
  }
  return worktreeRoot;
}

export function assertTrackedWorktreeClean(prefix, cwd) {
  const git = binaryOnPath("git");
  if (!git) fail(prefix, "git was not found in an absolute PATH entry", 127);

  const result = runGit(
    prefix,
    git,
    [
      "status",
      "--porcelain=v1",
      "--untracked-files=all",
      "--ignored=matching",
      "--ignore-submodules=none",
    ],
    cwd,
  );
  if (result.status !== 0 || result.stdout?.trim()) {
    fail(prefix, `reviewer worktree is not clean: ${cwd}`);
  }
}

export function readTrackedWorktreeIdentity(prefix, cwd) {
  const git = binaryOnPath("git");
  if (!git) fail(prefix, "git was not found in an absolute PATH entry", 127);

  const resolve = (revision) => {
    const result = runGit(prefix, git, ["rev-parse", revision], cwd);
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
