import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUNNER = path.join(ROOT, "tests", "run-vendor-suites.py");

describe("vendored suite environment", () => {
  it("isolates Git configuration before discovery and keeps the temporary home through the run", () => {
    const hostileHome = mkdtempSync(path.join(tmpdir(), "bottega-host-home-"));
    const probe = String.raw`
import json
import os
import runpy
import sys
import unittest

observed = []

def assert_isolated_git_environment():
    if os.environ["GIT_CONFIG_COUNT"] != "0":
        raise AssertionError("command-scope Git configuration is not disabled")
    if any(
        name.startswith("GIT_CONFIG_KEY_") or name.startswith("GIT_CONFIG_VALUE_")
        for name in os.environ
    ):
        raise AssertionError("command-scope Git configuration entries remain")
    if "GIT_CONFIG_PARAMETERS" in os.environ:
        raise AssertionError("legacy command-scope Git configuration remains")

class EnvironmentProbe(unittest.TestCase):
    def runTest(self):
        home = os.environ["HOME"]
        self.assertEqual(os.environ["XDG_CONFIG_HOME"], home)
        self.assertTrue(os.path.isdir(home))
        self.assertEqual(os.environ["GIT_CONFIG_GLOBAL"], os.devnull)
        self.assertEqual(os.environ["GIT_CONFIG_SYSTEM"], os.devnull)
        assert_isolated_git_environment()

def discover(self, start, pattern="test*.py", top_level_dir=None):
    home = os.environ["HOME"]
    observed.append(home)
    if home == os.environ["HOSTILE_HOME"]:
        raise AssertionError("vendored discovery retained the host HOME")
    if os.environ["XDG_CONFIG_HOME"] != home:
        raise AssertionError("XDG_CONFIG_HOME does not match isolated HOME")
    if not os.path.isdir(home):
        raise AssertionError("isolated HOME does not exist during discovery")
    if os.environ["GIT_CONFIG_GLOBAL"] != os.devnull:
        raise AssertionError("global Git configuration is not disabled")
    if os.environ["GIT_CONFIG_SYSTEM"] != os.devnull:
        raise AssertionError("system Git configuration is not disabled")
    assert_isolated_git_environment()
    return unittest.TestSuite([EnvironmentProbe()])

unittest.TestLoader.discover = discover
try:
    runpy.run_path(sys.argv[1], run_name="__main__")
except SystemExit as error:
    if error.code != 0:
        raise

if len(observed) != 2 or observed[0] != observed[1]:
    raise AssertionError(f"unexpected isolated homes: {observed!r}")
if os.path.exists(observed[0]):
    raise AssertionError("temporary HOME was not cleaned after the suite run")
expected_restored = {
    "GIT_CONFIG_COUNT": "2",
    "GIT_CONFIG_KEY_0": "core.hooksPath",
    "GIT_CONFIG_VALUE_0": "/hostile/hooks",
    "GIT_CONFIG_KEY_1": "core.excludesFile",
    "GIT_CONFIG_VALUE_1": "/hostile/ignore",
    "GIT_CONFIG_KEY_9": "sentinel.extra",
    "GIT_CONFIG_VALUE_9": "sentinel",
    "GIT_CONFIG_PARAMETERS": "'user.name=Hostile User'",
}
for name, value in expected_restored.items():
    if os.environ.get(name) != value:
        raise AssertionError(f"caller environment was not restored for {name}")
print(json.dumps({"home": observed[0], "discoveries": len(observed)}))
`;

    try {
      const result = spawnSync("python3", ["-c", probe, RUNNER], {
        cwd: ROOT,
        encoding: "utf8",
        env: {
          ...process.env,
          HOME: hostileHome,
          HOSTILE_HOME: hostileHome,
          XDG_CONFIG_HOME: path.join(hostileHome, "xdg"),
          GIT_CONFIG_GLOBAL: path.join(hostileHome, "global.gitconfig"),
          GIT_CONFIG_SYSTEM: path.join(hostileHome, "system.gitconfig"),
          GIT_CONFIG_COUNT: "2",
          GIT_CONFIG_KEY_0: "core.hooksPath",
          GIT_CONFIG_VALUE_0: "/hostile/hooks",
          GIT_CONFIG_KEY_1: "core.excludesFile",
          GIT_CONFIG_VALUE_1: "/hostile/ignore",
          GIT_CONFIG_KEY_9: "sentinel.extra",
          GIT_CONFIG_VALUE_9: "sentinel",
          GIT_CONFIG_PARAMETERS: "'user.name=Hostile User'",
        },
      });

      expect(result.status, result.stderr).toBe(0);
      expect(JSON.parse(result.stdout)).toMatchObject({ discoveries: 2 });
    } finally {
      rmSync(hostileHome, { recursive: true, force: true });
    }
  });
});
