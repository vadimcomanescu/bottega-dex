// The guards are processes: feed each one a synthetic hook event on stdin
// and assert on what it writes back. A deny is a JSON permissionDecision;
// an allow (or any malformed input) is silence.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const ROUTE_GUARD = join(import.meta.dirname, "..", "hooks", "route-guard.js");
const ENTRY_GUARD = join(import.meta.dirname, "..", "hooks", "entry-guard.js");

function run(script: string, event: unknown): string {
  const result = spawnSync("node", [script], {
    input: typeof event === "string" ? event : JSON.stringify(event),
    encoding: "utf-8",
  });
  expect(result.status).toBe(0);
  return result.stdout;
}

function denialOf(stdout: string): string {
  const parsed = JSON.parse(stdout);
  expect(parsed.hookSpecificOutput.permissionDecision).toBe("deny");
  return parsed.hookSpecificOutput.permissionDecisionReason;
}

const cleanups: string[] = [];
afterEach(() => {
  while (cleanups.length > 0) rmSync(cleanups.pop()!, { recursive: true, force: true });
});

// A live run is a .bottega/wt/ worktree entry — the one signal Close reaps.
function workshopDir(live: boolean): string {
  const dir = mkdtempSync(join(tmpdir(), "bottega-guard-"));
  cleanups.push(dir);
  if (live) mkdirSync(join(dir, ".bottega", "wt", "s1"), { recursive: true });
  return dir;
}

function git(dir: string, ...args: string[]): void {
  const result = spawnSync(
    "git",
    ["-C", dir, "-c", "user.email=t@t", "-c", "user.name=t", ...args],
    { encoding: "utf-8" },
  );
  expect(result.status).toBe(0);
}

function runBranchDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "bottega-guard-git-"));
  cleanups.push(dir);
  git(dir, "init", "-q");
  git(dir, "commit", "--allow-empty", "-q", "-m", "seed");
  git(dir, "branch", "bottega/saved-searches");
  return dir;
}

describe("route-guard: bottega worker seats (always fenced)", () => {
  it("denies an unrouted worker dispatch", () => {
    const out = run(ROUTE_GUARD, {
      cwd: workshopDir(false),
      tool_input: { subagent_type: "bottega:bottega-builder", prompt: "build slice A" },
    });
    expect(denialOf(out)).toMatch(/names no model/);
  });

  it("denies a fable-routed worker dispatch even when the text names the cold read", () => {
    const out = run(ROUTE_GUARD, {
      cwd: workshopDir(true),
      tool_input: {
        subagent_type: "bottega:bottega-reviewer",
        model: "fable",
        prompt: "cold read of the run",
      },
    });
    expect(denialOf(out)).toMatch(/never rides a worker seat/);
  });

  it("allows a routed worker dispatch on the seat's table model", () => {
    const out = run(ROUTE_GUARD, {
      cwd: workshopDir(true),
      tool_input: { subagent_type: "bottega-qa", model: "sonnet", prompt: "drive scenarios" },
    });
    expect(out).toBe("");
  });

  it("denies a misrouted worker dispatch — qa rides sonnet, never opus", () => {
    const out = run(ROUTE_GUARD, {
      cwd: workshopDir(true),
      tool_input: { subagent_type: "bottega-qa", model: "opus", prompt: "drive scenarios" },
    });
    expect(denialOf(out)).toMatch(/qa\/documenter\/mechanic: sonnet/);
  });

  it("fences the mechanic and storyboarder seats too", () => {
    const cwd = workshopDir(false);
    const unrouted = run(ROUTE_GUARD, {
      cwd,
      tool_input: { subagent_type: "bottega:bottega-mechanic", prompt: "run the gate suite" },
    });
    expect(denialOf(unrouted)).toMatch(/names no model/);
    const misrouted = run(ROUTE_GUARD, {
      cwd,
      tool_input: { subagent_type: "bottega-storyboarder", model: "sonnet", prompt: "render shots" },
    });
    expect(denialOf(misrouted)).toMatch(/storyboarder/);
    const routed = run(ROUTE_GUARD, {
      cwd,
      tool_input: { subagent_type: "bottega-mechanic", model: "sonnet", prompt: "run the gate suite" },
    });
    expect(routed).toBe("");
  });
});

describe("route-guard: all other seats, gated on a live run", () => {
  it("stays silent outside a run, whatever the dispatch", () => {
    const cwd = workshopDir(false);
    for (const tool_input of [
      { subagent_type: "general-purpose", model: "fable", prompt: "anything" },
      { subagent_type: "general-purpose", prompt: "unrouted" },
    ]) {
      expect(run(ROUTE_GUARD, { cwd, tool_input })).toBe("");
    }
  });

  it("denies an unrouted general-purpose dispatch while a worktree entry exists", () => {
    const out = run(ROUTE_GUARD, {
      cwd: workshopDir(true),
      tool_input: { subagent_type: "general-purpose", prompt: "clerk mechanics" },
    });
    expect(denialOf(out)).toMatch(/run is live/);
  });

  it("stays silent on a leftover bottega/* branch — a delivered run's local ref must never arm the guard", () => {
    // A PR merge deletes only the remote ref; the local bottega/<slug> branch
    // survives delivery on the user's machine. Only the run worktree — which
    // Close reaps — may arm scope 2.
    const cwd = runBranchDir();
    for (const tool_input of [
      { subagent_type: "general-purpose", prompt: "unrouted, unrelated work" },
      { subagent_type: "general-purpose", model: "fable", prompt: "unrelated work" },
    ]) {
      expect(run(ROUTE_GUARD, { cwd, tool_input })).toBe("");
    }
  });

  it("denies a fable-routed general-purpose dispatch during a run", () => {
    const out = run(ROUTE_GUARD, {
      cwd: workshopDir(true),
      tool_input: { subagent_type: "Explore", model: "claude-fable-5", prompt: "map territory" },
    });
    expect(denialOf(out)).toMatch(/routes fable/);
  });

  it("allows the cold read to route fable during a run", () => {
    const out = run(ROUTE_GUARD, {
      cwd: workshopDir(true),
      tool_input: {
        subagent_type: "general-purpose",
        model: "fable",
        description: "Cold read (fable, fresh)",
        prompt: "You are the independent cold reader …",
      },
    });
    expect(out).toBe("");
  });

  it("denies fable when 'cold read' is only mentioned, not the description's opening", () => {
    const cwd = workshopDir(true);
    for (const tool_input of [
      {
        subagent_type: "general-purpose",
        model: "fable",
        description: "Fix cycle for cold-read findings",
        prompt: "fix the cold-read findings",
      },
      {
        subagent_type: "general-purpose",
        model: "fable",
        description: "Review of the fix",
        prompt: "cold read style verification",
      },
    ]) {
      expect(denialOf(run(ROUTE_GUARD, { cwd, tool_input }))).toMatch(/routes fable/);
    }
  });

  it("never breaks on malformed input", () => {
    expect(run(ROUTE_GUARD, "not json")).toBe("");
    expect(run(ROUTE_GUARD, { tool_input: null })).toBe("");
  });
});

describe("route-guard: stale contract state never arms the guard", () => {
  // The old activation keyed off locks, gate records, and spec-doc status
  // strings — state nothing retires, so one delivered commission fenced every
  // later session in the repo. Only live-run state may arm scope 2.
  function staleDir(): string {
    const dir = mkdtempSync(join(tmpdir(), "bottega-guard-stale-"));
    cleanups.push(dir);
    mkdirSync(join(dir, ".bottega", "gates"), { recursive: true });
    writeFileSync(join(dir, ".bottega", "commission.lock"), "{}");
    mkdirSync(join(dir, "docs", "specs"), { recursive: true });
    writeFileSync(
      join(dir, "docs", "specs", "2026-07-06-saved-searches.md"),
      "# Saved searches\n\n**Status:** draft\n",
    );
    return dir;
  }

  it("stays silent on a stale lock, gate record, and draft spec doc", () => {
    const cwd = staleDir();
    for (const tool_input of [
      { subagent_type: "general-purpose", prompt: "unrouted, unrelated work" },
      { subagent_type: "general-purpose", model: "fable", prompt: "unrelated work" },
    ]) {
      expect(run(ROUTE_GUARD, { cwd, tool_input })).toBe("");
    }
  });

  it("still fences worker seats there (scope 1 is unconditional)", () => {
    const out = run(ROUTE_GUARD, {
      cwd: staleDir(),
      tool_input: { subagent_type: "bottega-builder", prompt: "build" },
    });
    expect(denialOf(out)).toMatch(/names no model/);
  });
});

describe("route-guard: a patch job arms the same run fence", () => {
  it("fences unrouted and fable dispatches while a patch worktree exists", () => {
    const dir = mkdtempSync(join(tmpdir(), "bottega-guard-patch-"));
    cleanups.push(dir);
    mkdirSync(join(dir, ".bottega", "wt", "patch", "fix-pagination"), { recursive: true });
    const unrouted = run(ROUTE_GUARD, {
      cwd: dir,
      tool_input: { subagent_type: "general-purpose", prompt: "sweep the diff" },
    });
    expect(denialOf(unrouted)).toMatch(/names no model/);
    const fabled = run(ROUTE_GUARD, {
      cwd: dir,
      tool_input: { subagent_type: "general-purpose", model: "fable", prompt: "review" },
    });
    expect(denialOf(fabled)).toMatch(/routes fable/);
    const routed = run(ROUTE_GUARD, {
      cwd: dir,
      tool_input: { subagent_type: "bottega-reviewer", model: "opus", prompt: "review the diff" },
    });
    expect(routed).toBe("");
  });
});

describe("entry-guard", () => {
  it("reminds on run-intent prose in a workshop, naming every entry command", () => {
    const out = run(ENTRY_GUARD, {
      cwd: workshopDir(true),
      prompt: "run bottega, the commission is signed",
    });
    const parsed = JSON.parse(out);
    expect(parsed.hookSpecificOutput.additionalContext).toMatch(/\/bottega:run/);
    expect(parsed.hookSpecificOutput.additionalContext).toMatch(/\/bottega:patch/);
  });

  it("stays silent on slash commands, non-workshop dirs, and unrelated prompts", () => {
    const workshop = workshopDir(true);
    const bare = mkdtempSync(join(tmpdir(), "bottega-guard-bare-"));
    cleanups.push(bare);
    expect(run(ENTRY_GUARD, { cwd: workshop, prompt: "/bottega:run it" })).toBe("");
    expect(run(ENTRY_GUARD, { cwd: bare, prompt: "run bottega now" })).toBe("");
    expect(run(ENTRY_GUARD, { cwd: workshop, prompt: "fix the flaky test" })).toBe("");
    expect(run(ENTRY_GUARD, "not json")).toBe("");
  });
});
