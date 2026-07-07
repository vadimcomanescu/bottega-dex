#!/usr/bin/env node

// PreToolUse route guard — the money fences on Agent/Task dispatches.
//
// Two scopes, because the nadia-0001 run proved the narrow one insufficient
// (103 of 132 dispatches rode general-purpose seats the old guard never saw):
//
//   1. Named bottega worker seats (builder, reviewer, qa) — always fenced,
//      run or no run: an unrouted dispatch inherits the dispatching seat's
//      model (from the maestro that is a silent fable escalation), and fable
//      never rides a worker seat. The cold read is not an exception here —
//      it never rides a builder/reviewer/qa seat by doctrine.
//
//   2. Every other dispatch, but only while a run is live — a .bottega/wt/
//      worktree entry exists. That is the one signal with a real teardown:
//      the run worktree exists from run start until the Close step reaps it.
//      Never contract state (locks, gate records, spec-doc status strings)
//      and never branch refs — nothing retires those (a PR merge deletes only
//      the remote ref), so either would arm the guard forever after a
//      delivered run and fence unrelated work in every later session. Same
//      two fences, with one whitelist — a dispatch whose description begins
//      "cold read" may route fable, because the cold read is one of the two
//      sanctioned fable seats. Outside all of that the guard stays silent so
//      the plugin never breaks unrelated sessions.
//
// Fences are mechanical, not trusted to memory.

import { readdirSync } from "node:fs";
import { join } from "node:path";

function runLive(cwd) {
  try {
    return readdirSync(join(cwd, ".bottega", "wt")).length > 0;
  } catch {
    return false; // a guard must never break unrelated dispatches
  }
}

const WORKER_SEAT = /(^|:)bottega-(builder|reviewer|qa)$/;
const FABLE = /fable/i;
// Anchored, description-only: replaying the nadia-0001 run, a loose match on
// prompt text passed 3 non-cold-read seats (fix cycles that merely *mention*
// cold-read findings); a description that BEGINS "cold read" passed only the
// cold read itself.
const COLD_READ = /^cold[\s-]?read\b/i;

const DENY_UNROUTED =
  "the dispatch was rejected because it names no model — an omitted model " +
  "inherits the dispatching seat's own model, which from the maestro seat " +
  "silently escalates the worker to fable; re-issue the same dispatch with an " +
  "explicit model from the routing table in skills/execute/SKILL.md (Claude " +
  "worker seat: opus — builder/qa at high, reviewer at xhigh).";

const DENY_FABLE =
  "the dispatch was rejected because it routes a worker seat to fable — fable " +
  "runs exactly twice per run, the maestro seat and the cold read, and the " +
  "cold read never rides a builder/reviewer/qa seat; re-issue from the routing " +
  "table in skills/execute/SKILL.md (Claude worker seat: opus — builder/qa at " +
  "high, reviewer at xhigh), and if you believe this slice genuinely needs " +
  "fable-tier judgment, stop and put the escalation to the user — their " +
  "budget, never a self-serve seat.";

const DENY_UNROUTED_RUN =
  "a bottega run is live (worktree present under .bottega/wt/) and this dispatch " +
  "names no model — an omitted model inherits the dispatching seat's own " +
  "model, which from the maestro seat silently escalates the seat to fable; " +
  "re-issue with an explicit model from the routing table in " +
  "skills/execute/SKILL.md.";

const DENY_FABLE_RUN =
  "a bottega run is live (worktree present under .bottega/wt/) and this dispatch " +
  "routes fable — fable runs exactly twice per run, the maestro seat and the " +
  "cold read; a cold-read dispatch's description begins with 'cold read', and " +
  "anything else re-issues from the routing table in " +
  "skills/execute/SKILL.md or goes to the user as an escalation.";

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

const seat = input.subagent_type;
const model = input.model;
const routed = typeof model === "string" && model.length > 0;

// Scope 1 — named bottega worker seats, unconditional.
if (typeof seat === "string" && WORKER_SEAT.test(seat)) {
  if (!routed) deny(DENY_UNROUTED);
  if (FABLE.test(model)) deny(DENY_FABLE);
  process.exit(0);
}

// Scope 2 — everything else, while a run is live.
const cwd =
  typeof event.cwd === "string" && event.cwd.length > 0 ? event.cwd : process.cwd();
if (!runLive(cwd)) process.exit(0);

if (!routed) deny(DENY_UNROUTED_RUN);
if (FABLE.test(model)) {
  const description = typeof input.description === "string" ? input.description : "";
  if (!COLD_READ.test(description)) deny(DENY_FABLE_RUN);
}

process.exit(0); // routed off fable, or a named cold read — the seat is the maestro's call
