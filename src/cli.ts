// argv -> library -> stdout/stderr/exit code. Run as a side effect of import
// so bin/bottega.js can stay a thin shim.
import {
  NoFeatureFilesError,
  UnsignedError,
  sign,
  verify,
} from "./commission-lock.ts";

function runSign(cwd: string): number {
  try {
    sign(cwd);
    return 0;
  } catch (err) {
    if (err instanceof NoFeatureFilesError) {
      process.stderr.write(`${err.message}\n`);
      return 1;
    }
    throw err;
  }
}

function runVerify(cwd: string): number {
  try {
    const result = verify(cwd);
    if (result.status === "clean") {
      process.stdout.write("clean\n");
      return 0;
    }
    for (const entry of result.drift) {
      process.stdout.write(`${entry.status} ${entry.path}\n`);
    }
    return 1;
  } catch (err) {
    if (err instanceof UnsignedError) {
      process.stderr.write(`${err.message}\n`);
      return 2;
    }
    throw err;
  }
}

function main(argv: string[], cwd: string): number {
  const [command] = argv;
  if (command === "sign") return runSign(cwd);
  if (command === "verify") return runVerify(cwd);
  process.stderr.write(`unknown command: ${command ?? "<none>"}\n`);
  return 1;
}

process.exitCode = main(process.argv.slice(2), process.cwd());
