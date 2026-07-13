import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const HOOKS = join(import.meta.dirname, "..", "plugins", "bottega-dex", "hooks");

function hook(name: string, event: object) {
  return spawnSync("node", [join(HOOKS, name)], {
    input: JSON.stringify(event),
    encoding: "utf8",
  });
}

describe("model guard", () => {
  it("adds blocking context when the orchestrator is not Sol", () => {
    const result = hook("model-guard.js", {
      hook_event_name: "SessionStart",
      model: "gpt-5.6-terra",
      cwd: "/tmp/repo",
      source: "startup",
    });
    expect(result.status).toBe(0);
    const out = JSON.parse(result.stdout);
    expect(out.hookSpecificOutput.additionalContext).toMatch(/do not start a Bottega Dex run/i);
    expect(out.systemMessage).toMatch(/gpt-5\.6-sol/);
  });

  it("adds only the Ultra verification reminder on Sol", () => {
    const result = hook("model-guard.js", {
      hook_event_name: "SessionStart",
      model: "gpt-5.6-sol",
      cwd: "/tmp/repo",
      source: "startup",
    });
    const out = JSON.parse(result.stdout);
    expect(out.hookSpecificOutput.additionalContext).toMatch(/Ultra/);
    expect(out.systemMessage).toBeUndefined();
  });

  it("accepts the documented gpt-5.6 alias as Sol", () => {
    const result = hook("model-guard.js", {
      hook_event_name: "SessionStart",
      model: "gpt-5.6",
      cwd: "/tmp/repo",
      source: "startup",
    });
    const out = JSON.parse(result.stdout);
    expect(out.hookSpecificOutput.additionalContext).toMatch(/Ultra/);
    expect(out.systemMessage).toBeUndefined();
  });
});

describe("entry guard", () => {
  it("points natural-language run intent at the namespaced skill", () => {
    const result = hook("entry-guard.js", {
      hook_event_name: "UserPromptSubmit",
      model: "gpt-5.6-sol",
      cwd: "/tmp/repo",
      prompt: "Use bottega dex to ship issue 42",
    });
    const out = JSON.parse(result.stdout);
    expect(out.hookSpecificOutput.additionalContext).toContain("$bottega-dex:run");
  });

  it("stays silent when the skill is already invoked", () => {
    const result = hook("entry-guard.js", {
      hook_event_name: "UserPromptSubmit",
      model: "gpt-5.6-sol",
      cwd: "/tmp/repo",
      prompt: "$bottega-dex:run issue 42",
    });
    expect(result.stdout).toBe("");
  });
});
