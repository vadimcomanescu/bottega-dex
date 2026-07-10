#!/usr/bin/env node

// UserPromptSubmit entry guard. A natural-language "run bottega" prompt can
// leave the session freelancing discovery on the priced maestro seat instead
// of loading the skill — the nadia-0001 run burned ~20 fable tool calls that
// way before the user interrupted and invoked the skill by hand. When a
// prompt in a bottega workshop reads like run intent and isn't already a
// slash command, inject the reminder; otherwise stay silent.

import { existsSync } from "node:fs";
import { join } from "node:path";

// Path mentions are not run intent: the lookbehind keeps ".bottega/…" and
// "hooks/route-guard.js"-style path talk silent, the lookahead keeps
// commission[-.]lock-style filename talk silent. Corpus-tested against
// this session's real prompts; residual false fires cost one paragraph.
const INTENT = /(?<![./])\bbottega\b|\bcommission\b(?![-.]lock)/i;

const REMINDER =
  "This repo is a bottega workshop and the prompt reads like run intent. If " +
  "this is bottega work, invoke the matching skill before acting — " +
  "/bottega:run for the whole loop, /bottega:spec to commission without " +
  "running, /bottega:execute to run an already-signed commission, " +
  "/bottega:patch for a fix or small improvement too small to commission. " +
  "Acting " +
  "without them freelances discovery on the maestro seat and re-derives " +
  "what the skills already carry.";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

const raw = await readStdin();

let event;
try {
  event = JSON.parse(raw);
} catch {
  process.exit(0); // a guard must never break unrelated prompts
}

const prompt = event && typeof event.prompt === "string" ? event.prompt : "";
if (prompt.trimStart().startsWith("/")) process.exit(0); // already a command
if (!INTENT.test(prompt)) process.exit(0);

const cwd =
  event && typeof event.cwd === "string" && event.cwd.length > 0
    ? event.cwd
    : process.cwd();
const workshop =
  existsSync(join(cwd, ".bottega")) || existsSync(join(cwd, "features"));
if (!workshop) process.exit(0);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: REMINDER,
    },
  })
);
process.exit(0);
