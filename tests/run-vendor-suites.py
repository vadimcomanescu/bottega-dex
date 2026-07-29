#!/usr/bin/env python3
"""Run the vendored autoreview test suites.

The isolation catches accidental user-level Git ignore/hook/configuration
interference in trusted vendored suites, and does not sandbox malicious vendored
tests or untrusted repository code.
"""

import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest import mock
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT / "plugins" / "bottega-dex" / "skills" / "code-review"


def java_runs() -> bool:
    try:
        return subprocess.run(
            ["java", "-version"], capture_output=True, timeout=30
        ).returncode == 0
    except (OSError, subprocess.TimeoutExpired):
        return False


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="bottega-dex-vendor-home-") as temp_home:
        isolated_environment = {
            "HOME": temp_home,
            "XDG_CONFIG_HOME": temp_home,
            "GIT_CONFIG_GLOBAL": os.devnull,
            "GIT_CONFIG_SYSTEM": os.devnull,
            "GIT_CONFIG_COUNT": "0",
        }
        with mock.patch.dict(os.environ, isolated_environment):
            for name in tuple(os.environ):
                if name == "GIT_CONFIG_PARAMETERS" or name.startswith(
                    ("GIT_CONFIG_KEY_", "GIT_CONFIG_VALUE_")
                ):
                    del os.environ[name]

            if not java_runs():
                real_which = shutil.which
                shutil.which = lambda cmd, *args, **kwargs: (
                    None if cmd == "java" else real_which(cmd, *args, **kwargs)
                )

            loader = unittest.TestLoader()
            suite = unittest.TestSuite()
            targets = (
                (str(VENDOR / "scripts"), "autoreview_test.py"),
                (str(VENDOR / "tests"), "test_autoreview_hardening.py"),
            )
            for start, pattern in targets:
                found = loader.discover(start, pattern=pattern, top_level_dir=start)
                if not found.countTestCases():
                    print(
                        f"run-vendor-suites: no tests discovered in {start} ({pattern})",
                        file=sys.stderr,
                    )
                    return 1
                suite.addTests(found)

            result = unittest.TextTestRunner(verbosity=1).run(suite)
            return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(main())
