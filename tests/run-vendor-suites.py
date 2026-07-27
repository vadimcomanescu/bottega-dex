#!/usr/bin/env python3
"""Run the vendored autoreview test suites."""

import shutil
import subprocess
import sys
import unittest
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
