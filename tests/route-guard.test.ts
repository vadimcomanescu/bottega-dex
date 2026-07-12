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

// Runs are keyed by feature slug and coexist in one repo. A run is live while
// its owner file .bottega/run/<slug>/owner exists (written at Isolate,
// deleted at delivery), and it fences only the session recorded there.
const OWNER = "owner-session";

function repoWithRun(owner?: string, slug = "saved-searches"): string {
  const dir = mkdtempSync(join(tmpdir(), "bottega-guard-"));
  cleanups.push(dir);
  if (owner) addRun(dir, slug, owner);
  return dir;
}

function addRun(dir: string, slug: string, owner: string): void {
  mkdirSync(join(dir, ".bottega", "run", slug), { recursive: true });
  writeFileSync(join(dir, ".bottega", "run", slug, "owner"), owner + "\n");
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

describe("route-guard: bottega worker agents (always checked)", () => {
  it("denies an unrouted worker dispatch", () => {
    const out = run(ROUTE_GUARD, {
      cwd: repoWithRun(),
      tool_input: { subagent_type: "bottega:builder", prompt: "build slice A" },
    });
    expect(denialOf(out)).toMatch(/names no model/);
  });

  it("denies a fable-routed worker dispatch", () => {
    const out = run(ROUTE_GUARD, {
      cwd: repoWithRun(OWNER),
      tool_input: {
        subagent_type: "bottega:reviewer",
        model: "fable",
        prompt: "review the integrated diff",
      },
    });
    expect(denialOf(out)).toMatch(/routes a worker agent to fable/);
  });

  it("allows a routed worker dispatch on the table's model", () => {
    const out = run(ROUTE_GUARD, {
      cwd: repoWithRun(OWNER),
      tool_input: { subagent_type: "bottega:reviewer", model: "opus", prompt: "review" },
    });
    expect(out).toBe("");
  });

  it("denies a misrouted worker dispatch: the builder runs on opus, never sonnet", () => {
    const out = run(ROUTE_GUARD, {
      cwd: repoWithRun(OWNER),
      tool_input: { subagent_type: "bottega:builder", model: "sonnet", prompt: "build" },
    });
    expect(denialOf(out)).toMatch(/builder and reviewer: opus/);
  });

  it("stays silent on retired worker names: those are a host repo's own agents now", () => {
    const cwd = repoWithRun();
    for (const subagent_type of ["bottega:qa", "bottega:mechanic", "bottega:documenter"]) {
      expect(run(ROUTE_GUARD, { cwd, tool_input: { subagent_type, prompt: "x" } })).toBe("");
    }
  });

  it("stays silent on a bare role name: that is a host repo's own agent, never bottega's", () => {
    const out = run(ROUTE_GUARD, {
      cwd: repoWithRun(),
      tool_input: { subagent_type: "reviewer", prompt: "review" },
    });
    expect(out).toBe("");
  });
});

describe("route-guard: all other dispatches, gated on a live run", () => {
  it("stays silent outside a run, whatever the dispatch", () => {
    const cwd = repoWithRun();
    for (const tool_input of [
      { subagent_type: "general-purpose", model: "fable", prompt: "anything" },
      { subagent_type: "general-purpose", prompt: "unrouted" },
    ]) {
      expect(run(ROUTE_GUARD, { cwd, tool_input })).toBe("");
    }
  });

  it("denies the owning session's unrouted general-purpose dispatch while the owner file exists", () => {
    const out = run(ROUTE_GUARD, {
      cwd: repoWithRun(OWNER),
      session_id: OWNER,
      tool_input: { subagent_type: "general-purpose", prompt: "worktree mechanics" },
    });
    expect(denialOf(out)).toMatch(/live bottega run/);
  });

  it("stays silent on a leftover bottega/* branch: a delivered run's local ref must never arm the guard", () => {
    // A PR merge deletes only the remote ref; the local bottega/<slug> branch
    // survives delivery on the user's machine. Only the owner file (which
    // delivery deletes) may arm scope 2.
    const cwd = runBranchDir();
    for (const tool_input of [
      { subagent_type: "general-purpose", prompt: "unrouted, unrelated work" },
      { subagent_type: "general-purpose", model: "fable", prompt: "unrelated work" },
    ]) {
      expect(run(ROUTE_GUARD, { cwd, tool_input })).toBe("");
    }
  });

  it("denies any fable-routed dispatch during a run: fable is the orchestrator, never a dispatch", () => {
    const cwd = repoWithRun(OWNER);
    for (const tool_input of [
      { subagent_type: "Explore", model: "claude-fable-5", prompt: "map territory" },
      {
        subagent_type: "general-purpose",
        model: "fable",
        description: "Cold read (fable, fresh)",
        prompt: "independent read of the diff",
      },
    ]) {
      expect(denialOf(run(ROUTE_GUARD, { cwd, session_id: OWNER, tool_input }))).toMatch(
        /routes fable/,
      );
    }
  });

  it("never breaks on malformed input", () => {
    expect(run(ROUTE_GUARD, "not json")).toBe("");
    expect(run(ROUTE_GUARD, { tool_input: null })).toBe("");
  });
});

describe("route-guard: workflow scripts from a run's session", () => {
  // The observed failure: during a run, one /code-review invocation launched
  // a workflow whose 19 agent() calls named no model, so every one inherited
  // the orchestrator's session model, fable. None of them was an Agent
  // dispatch, so scope 2 never saw it.
  const CODE_REVIEW_SHAPE = `export const meta = {
  name: 'code-review',
  description: 'Workflow-backed code review',
  phases: [{ title: 'Scope' }, { title: 'Find' }, { title: 'Verify' }],
}
phase('Scope')
const scope = await agent(\`Pin the diff (git diff master...HEAD) and list files\`, { label: 'scope', schema: SCOPE })
const found = await parallel(ANGLES.map(a => () => agent(a.prompt, { label: a.key, schema: FINDINGS })))
`;

  function workflowEvent(tool_input: object, session_id = OWNER, owner: string | null = OWNER) {
    return {
      cwd: repoWithRun(owner ?? undefined),
      session_id,
      tool_name: "Workflow",
      tool_input,
    };
  }

  it("denies a script whose agent() calls name no model", () => {
    const out = run(ROUTE_GUARD, workflowEvent({ script: CODE_REVIEW_SHAPE }));
    expect(denialOf(out)).toMatch(/names no model/);
  });

  it("denies a script that routes an agent to fable", () => {
    const script = `export const meta = { name: 'sweep', description: 'x', phases: [] }
const r = await agent('judge the diff', { label: 'judge', model: 'fable' })
`;
    expect(denialOf(run(ROUTE_GUARD, workflowEvent({ script })))).toMatch(/routes an agent to fable/);
  });

  it("allows a script with every agent() pinned off fable", () => {
    const script = `export const meta = { name: 'sweep', description: 'x', phases: [] }
const a = await agent('find bugs', { model: 'opus' })
const b = await agent('run the gates', { label: 'gates', model: 'sonnet', effort: 'low' })
`;
    expect(run(ROUTE_GUARD, workflowEvent({ script }))).toBe("");
  });

  it("allows the shipped panel script, fable pins and all", () => {
    const panel = join(import.meta.dirname, "..", "skills", "panel", "panel.js");
    expect(run(ROUTE_GUARD, workflowEvent({ scriptPath: panel }))).toBe("");
  });

  it("denies fable outside the panel even when the script mentions the panel", () => {
    const script = `export const meta = { name: 'review', description: 'like the panel', phases: [] }
// not the panel: the meta name is what passes, never a mention
const r = await agent('panel-style judging', { model: 'fable' })
`;
    expect(denialOf(run(ROUTE_GUARD, workflowEvent({ script })))).toMatch(/routes an agent to fable/);
  });

  it("denies what it cannot read: name-only invocations, dead scriptPaths, unclosed calls", () => {
    for (const tool_input of [
      { name: "code-review", args: "high" },
      { scriptPath: "/nonexistent/wf.js" },
      { script: "export const meta = { name: 'x', description: 'x' }\nagent('never closes'" },
    ]) {
      expect(denialOf(run(ROUTE_GUARD, workflowEvent(tool_input)))).toMatch(/cannot be checked/);
    }
  });

  it("stays silent for bystander sessions and outside a run", () => {
    expect(run(ROUTE_GUARD, workflowEvent({ script: CODE_REVIEW_SHAPE }, "bystander-session"))).toBe("");
    expect(
      run(ROUTE_GUARD, workflowEvent({ script: CODE_REVIEW_SHAPE }, OWNER, null)),
    ).toBe("");
  });
});

describe("route-guard: stale contract state never arms the guard", () => {
  // The old activation keyed off locks, gate records, and spec-doc status
  // strings; state nothing retires, so one delivered run fenced every
  // later session in the repo. Only the owner file may arm scope 2.
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

  it("still checks worker agents there (scope 1 is unconditional)", () => {
    const out = run(ROUTE_GUARD, {
      cwd: staleDir(),
      tool_input: { subagent_type: "bottega:builder", prompt: "build" },
    });
    expect(denialOf(out)).toMatch(/names no model/);
  });
});

describe("route-guard: the run fence binds to each run's owning session", () => {
  // The per-run owner file is what keeps a live run from fencing every
  // concurrent session in the same repo.
  it("stays silent on a bystander session's dispatch while another session's run is live", () => {
    // The observed failure: a codex-plugin dispatch in a session not running
    // bottega, denied because a run was live elsewhere. The codex agent's
    // work rides the codex CLI's own model; `model` here routes nothing.
    const cwd = repoWithRun(OWNER);
    for (const tool_input of [
      { subagent_type: "codex", description: "Codex review slice A", prompt: "review slice A" },
      { subagent_type: "general-purpose", prompt: "unrouted, unrelated work" },
      { subagent_type: "general-purpose", model: "fable", prompt: "unrelated work" },
    ]) {
      expect(run(ROUTE_GUARD, { cwd, session_id: "bystander-session", tool_input })).toBe("");
    }
  });

  it("fences two concurrent runs' sessions independently", () => {
    const dir = repoWithRun("owner-a", "feature-a");
    addRun(dir, "feature-b", "owner-b");
    for (const session_id of ["owner-a", "owner-b"]) {
      const out = run(ROUTE_GUARD, {
        cwd: dir,
        session_id,
        tool_input: { subagent_type: "general-purpose", prompt: "unrouted" },
      });
      expect(denialOf(out)).toMatch(/live bottega run/);
    }
    const bystander = run(ROUTE_GUARD, {
      cwd: dir,
      session_id: "bystander-session",
      tool_input: { subagent_type: "general-purpose", prompt: "unrouted" },
    });
    expect(bystander).toBe("");
  });

  it("stays silent when no owner is recorded, even with other run debris around", () => {
    const dir = mkdtempSync(join(tmpdir(), "bottega-guard-noowner-"));
    cleanups.push(dir);
    mkdirSync(join(dir, ".bottega", "run", "saved-searches"), { recursive: true });
    const out = run(ROUTE_GUARD, {
      cwd: dir,
      session_id: OWNER,
      tool_input: { subagent_type: "general-purpose", prompt: "unrouted" },
    });
    expect(out).toBe("");
  });

  it("stays silent when the event carries no session_id", () => {
    const out = run(ROUTE_GUARD, {
      cwd: repoWithRun(OWNER),
      tool_input: { subagent_type: "general-purpose", prompt: "unrouted" },
    });
    expect(out).toBe("");
  });

  it("still checks named worker agents from any session (scope 1 is unconditional)", () => {
    const out = run(ROUTE_GUARD, {
      cwd: repoWithRun(OWNER),
      session_id: "bystander-session",
      tool_input: { subagent_type: "bottega:builder", prompt: "build" },
    });
    expect(denialOf(out)).toMatch(/names no model/);
  });
});

describe("entry-guard", () => {
  it("reminds on run-intent prose in a repo with bottega state, naming the one entry command", () => {
    const out = run(ENTRY_GUARD, {
      cwd: repoWithRun(OWNER),
      prompt: "run bottega on the saved searches feature",
    });
    const parsed = JSON.parse(out);
    expect(parsed.hookSpecificOutput.additionalContext).toMatch(/\/bottega:run/);
  });

  it("stays silent on slash commands, repos without bottega state, and unrelated prompts", () => {
    const withRun = repoWithRun(OWNER);
    const bare = mkdtempSync(join(tmpdir(), "bottega-guard-bare-"));
    cleanups.push(bare);
    expect(run(ENTRY_GUARD, { cwd: withRun, prompt: "/bottega:run it" })).toBe("");
    expect(run(ENTRY_GUARD, { cwd: bare, prompt: "run bottega now" })).toBe("");
    expect(run(ENTRY_GUARD, { cwd: withRun, prompt: "fix the flaky test" })).toBe("");
    expect(run(ENTRY_GUARD, "not json")).toBe("");
  });
});
