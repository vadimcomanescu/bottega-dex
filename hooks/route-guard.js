#!/usr/bin/env node

// PreToolUse route guard, two fences on bottega worker seats (builder,
// reviewer, qa):
//   1. A dispatch that names no model inherits the dispatching seat's model —
//      from the maestro seat that silently escalates the worker to fable.
//   2. A dispatch that names fable puts the shop's most expensive seat on
//      worker duty — fable runs exactly twice per run (maestro seat, cold
//      read), and the cold read never rides a worker seat.
// Both are rejected so the fence is mechanical, not trusted to memory.

const WORKER_SEAT = /(^|:)bottega-(builder|reviewer|qa)$/;
const FABLE = /fable/i;

const DENY_UNROUTED =
  "the dispatch was rejected because it names no model — an omitted model " +
  "inherits the dispatching seat's own model, which from the maestro seat " +
  "silently escalates the worker to fable; re-issue the same dispatch with an " +
  "explicit model from the routing table in skills/bottega/SKILL.md (Claude " +
  "worker seat: opus — builder/qa at high, reviewer at xhigh).";

const DENY_FABLE =
  "the dispatch was rejected because it routes a worker seat to fable — fable " +
  "runs exactly twice per run, the maestro seat and the cold read, and the " +
  "cold read never rides a builder/reviewer/qa seat; re-issue from the routing " +
  "table in skills/bottega/SKILL.md (Claude worker seat: opus — builder/qa at " +
  "high, reviewer at xhigh), and if you believe this slice genuinely needs " +
  "fable-tier judgment, stop and put the escalation to the patron — his " +
  "budget, never a self-serve seat.";

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
if (typeof seat !== "string" || !WORKER_SEAT.test(seat)) process.exit(0);

const model = input.model;
if (typeof model !== "string" || model.length === 0) deny(DENY_UNROUTED);
if (FABLE.test(model)) deny(DENY_FABLE);

process.exit(0); // routed off fable — the seat is the maestro's call
