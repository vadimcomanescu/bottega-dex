import { accessSync, constants } from "node:fs";
import { delimiter, isAbsolute, join } from "node:path";
import { parseArgs } from "node:util";

export function fail(prefix, message, code = 2) {
  process.stderr.write(`${prefix}: ${message}\n`);
  process.exit(code);
}

export function parseWorkerArgs(prefix) {
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
        resume: { type: "string" },
        "dry-run": { type: "boolean", default: false },
      },
    }));
  } catch (error) {
    fail(prefix, error.message);
  }

  for (const name of ["role", "cwd", "brief", "out", "events"]) {
    if (!values[name]) fail(prefix, `--${name} is required`);
  }
  return values;
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
