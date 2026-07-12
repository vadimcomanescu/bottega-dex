#!/usr/bin/env node

// PreToolUse route guard: enforces model routing on Agent/Task/Workflow
// dispatches.
//
// Three scopes, because the narrow one alone proved insufficient (in the
// nadia-0001 run, 103 of 132 dispatches went through general-purpose agents
// the old guard never saw):
//
//   1. Named bottega worker agents (builder, reviewer), always checked, run
//      or no run: a dispatch that omits `model` inherits the dispatching
//      session's model (from the orchestrator that is a silent escalation to
//      fable), fable never runs a worker agent, and each named worker has
//      exactly one Claude model in the routing table; a mismatch is a
//      misroute, denied. Effort is not a dispatch parameter this hook can
//      see; it comes from the agent frontmatter defaults and the table.
//
//   2. Every other dispatch, but only from a session that owns a live run
//      here. Runs are keyed by feature slug and coexist in one repo, each
//      driven from its own session; a run is live while its owner file
//      .bottega/run/<slug>/owner exists (written by the orchestrator at
//      Isolate, rewritten on resume, deleted at delivery), and the check
//      fires only when the event's session_id matches a recorded owner.
//      Anything else is silence: a bystander session in the same repo (the
//      observed failure: a codex-plugin dispatch denied with a message whose
//      remedy routes nothing on a codex dispatch), a missing owner file, no
//      session_id. This guard fails open, and scope 1 (which caught the
//      nadia run) never relaxes.
//
//   3. Workflow tool calls, from a run-owning session only. A workflow
//      agent() call that names no model inherits the session's model, so
//      from the orchestrator a single workflow multiplies fable silently
//      (observed: one /code-review invocation during a run put 19 fable
//      agents on a diff, unseen by scope 2 because none of them was an
//      Agent dispatch). The check is static, on the script text: every
//      agent() call must name a model, and none may name fable. The one
//      exception: the panel's bundled script is sanctioned to route fable
//      and passes by naming itself in its meta. A script the guard cannot
//      read (name-only invocation, unreadable scriptPath, unparseable call)
//      is denied, not waved through: inside the fence, unverifiable routing
//      is unrouted routing.
//
// The checks are mechanical, not trusted to memory.

import { readdirSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";

// The sessions owning live runs here: .bottega/run/<slug>/owner. Any failure
// to read is a slug that doesn't fence; a guard must never break unrelated
// dispatches.
function liveOwners(cwd) {
  const owners = new Set();
  let slugs = [];
  try {
    slugs = readdirSync(join(cwd, ".bottega", "run"));
  } catch {
    return owners;
  }
  for (const slug of slugs) {
    try {
      const owner = readFileSync(join(cwd, ".bottega", "run", slug, "owner"), "utf8").trim();
      if (owner) owners.add(owner);
    } catch {
      // not a run-state dir or no owner recorded: silence
    }
  }
  return owners;
}

// Plugin agents register as <plugin>:<agent>, so every real dispatch names
// bottega:<role>; a bare role name resolves to nothing in the harness and, if
// it did, could be a host repo's own agent, which this guard never routes.
const WORKER_AGENT = /^bottega:(builder|reviewer)$/;
const FABLE = /fable/i;
// The Claude column of the routing table (skills/run/SKILL.md). Codex
// workers run through `codex exec`, never the Agent tool, so every Claude
// dispatch of a named worker is fully checkable here: the Claude builder
// (user-facing slices) and the Claude reviewer both run on opus.
const WORKER_MODEL = {
  builder: /opus/i,
  reviewer: /opus/i,
};

const DENY_UNROUTED =
  "the dispatch was rejected because it names no model. An omitted model " +
  "inherits the dispatching session's own model, which from the orchestrator " +
  "silently escalates the worker to fable; re-issue the same dispatch with an " +
  "explicit model from the routing table in skills/run/SKILL.md (Claude " +
  "workers, builder and reviewer, run on opus).";

const DENY_FABLE =
  "the dispatch was rejected because it routes a worker agent to fable. " +
  "Fable is the orchestrator's own session and nothing else; re-issue from " +
  "the routing table in skills/run/SKILL.md (Claude workers, builder and " +
  "reviewer, run on opus), and if you believe this slice genuinely needs " +
  "fable-tier judgment, do that part yourself in your own turns instead of " +
  "dispatching it.";

function denyMisrouted(role, model) {
  return (
    "the dispatch was rejected because it routes the " + role + " agent to '" +
    model + "'. The routing table in skills/run/SKILL.md gives each named " +
    "Claude worker exactly one model (builder and reviewer: opus); re-issue " +
    "with the table's model, and treat wanting a different one as a " +
    "routing-table change to propose, never a per-dispatch override."
  );
}

const DENY_UNROUTED_RUN =
  "this session owns a live bottega run (its id is in .bottega/run/<slug>/owner) " +
  "and this dispatch names no model. An omitted model inherits the dispatching " +
  "session's own model, which from the orchestrator silently escalates the " +
  "dispatch to fable; re-issue with an explicit model from the routing table in " +
  "skills/run/SKILL.md.";

const DENY_FABLE_RUN =
  "this session owns a live bottega run (its id is in .bottega/run/<slug>/owner) " +
  "and this dispatch routes fable. Fable is the orchestrator's own session and " +
  "nothing else; re-issue from the routing table in skills/run/SKILL.md, and " +
  "do fable-tier work in your own turns instead of dispatching it.";

const DENY_WORKFLOW_UNPINNED_RUN =
  "this session owns a live bottega run (its id is in .bottega/run/<slug>/owner) " +
  "and this workflow script has an agent() call that names no model. A workflow " +
  "agent that names no model inherits the session's model, which from the " +
  "orchestrator silently escalates every such agent to fable; re-issue the " +
  "workflow with an explicit model on every agent() call, from the routing " +
  "table in skills/run/SKILL.md.";

const DENY_WORKFLOW_FABLE_RUN =
  "this session owns a live bottega run (its id is in .bottega/run/<slug>/owner) " +
  "and this workflow script routes an agent to fable. The panel's bundled " +
  "script is the one workflow sanctioned to route fable and passes by naming " +
  "itself in its meta; anything else re-issues from the routing table in " +
  "skills/run/SKILL.md.";

const DENY_WORKFLOW_UNCHECKED_RUN =
  "this session owns a live bottega run (its id is in .bottega/run/<slug>/owner) " +
  "and this workflow's script cannot be read, so its model routing cannot be " +
  "checked. Re-issue with the script inline or at a readable scriptPath, with " +
  "an explicit model on every agent() call.";

// Anchored to the meta literal that opens every workflow script, so a script
// merely mentioning the panel does not pass; the sanctioned caller passes by
// naming itself.
const PANEL_META = /export\s+const\s+meta\s*=\s*\{\s*name\s*:\s*['"`]panel['"`]/;

// The script under check: scriptPath wins over inline script, matching the
// Workflow tool's own precedence; a name-only invocation resolves elsewhere
// and is unreadable here.
function workflowScript(input, cwd) {
  const path = typeof input.scriptPath === "string" && input.scriptPath.length > 0
    ? (isAbsolute(input.scriptPath) ? input.scriptPath : join(cwd, input.scriptPath))
    : null;
  if (path) {
    try {
      return readFileSync(path, "utf8");
    } catch {
      return null;
    }
  }
  if (typeof input.script === "string" && input.script.length > 0) return input.script;
  return null;
}

// The argument text of every agent(...) call, by balanced-paren scan with
// string skipping; null when a call never closes, which the caller treats as
// unreadable.
function agentCalls(script) {
  const calls = [];
  const re = /\bagent\s*\(/g;
  let match;
  while ((match = re.exec(script))) {
    let depth = 1;
    let quote = "";
    let i = re.lastIndex;
    for (; i < script.length && depth > 0; i++) {
      const ch = script[i];
      if (quote) {
        if (ch === "\\") i++;
        else if (ch === quote) quote = "";
      } else if (ch === "'" || ch === '"' || ch === "`") quote = ch;
      else if (ch === "(") depth++;
      else if (ch === ")") depth--;
    }
    if (depth > 0) return null;
    calls.push(script.slice(re.lastIndex, i - 1));
    re.lastIndex = i;
  }
  return calls;
}

const PINNED = /\bmodel\s*:/;
const PINNED_FABLE = /\bmodel\s*:\s*['"`][^'"`]*fable/i;

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

const raw = await readStdin();

let event;
try {
  event = JSON.parse(raw);
} catch {
  process.exit(0); // a guard must never break unrelated dispatches
}

const input = event && typeof event === "object" ? event.tool_input : null;
if (!input || typeof input !== "object") process.exit(0);

const agentType = input.subagent_type;
const model = input.model;
const routed = typeof model === "string" && model.length > 0;

// Scope 1: named bottega worker agents, unconditional.
const workerMatch = typeof agentType === "string" ? agentType.match(WORKER_AGENT) : null;
if (workerMatch) {
  const role = workerMatch[1];
  if (!routed) deny(DENY_UNROUTED);
  if (FABLE.test(model)) deny(DENY_FABLE);
  if (!WORKER_MODEL[role].test(model)) deny(denyMisrouted(role, model));
  process.exit(0);
}

// Scope 2: everything else, only from a session that owns a live run here.
const cwd =
  typeof event.cwd === "string" && event.cwd.length > 0 ? event.cwd : process.cwd();
const session = typeof event.session_id === "string" ? event.session_id : "";
if (!session || !liveOwners(cwd).has(session)) process.exit(0); // not a run's session

// Scope 3: workflow scripts, checked statically.
if (event.tool_name === "Workflow") {
  const script = workflowScript(input, cwd);
  const calls = script === null ? null : agentCalls(script);
  if (calls === null) deny(DENY_WORKFLOW_UNCHECKED_RUN);
  if (calls.some((call) => !PINNED.test(call))) deny(DENY_WORKFLOW_UNPINNED_RUN);
  if (calls.some((call) => PINNED_FABLE.test(call)) && !PANEL_META.test(script))
    deny(DENY_WORKFLOW_FABLE_RUN);
  process.exit(0);
}

if (!routed) deny(DENY_UNROUTED_RUN);
if (FABLE.test(model)) deny(DENY_FABLE_RUN);

process.exit(0); // routed off fable; the choice is the orchestrator's
