#!/usr/bin/env node

// UserPromptSubmit entry guard. A natural-language "run bottega" prompt can
// leave the session improvising discovery on the expensive orchestrator model
// instead of loading the skill; the nadia-0001 run burned ~20 fable tool
// calls that way before the user interrupted and invoked the skill by hand.
// When a prompt in a repo with bottega state reads like run intent and isn't
// already a slash command, inject the reminder; otherwise stay silent.

import { existsSync } from "node:fs";
import { join } from "node:path";

// Path mentions are not run intent: the lookbehind keeps ".bottega/…"-style
// path talk silent. Corpus-tested against real prompts; residual false fires
// cost one paragraph.
const INTENT = /(?<![./])\bbottega\b/i;

const REMINDER =
  "This repo has bottega run state and the prompt reads like run intent. If " +
  "this is bottega work, invoke /bottega:run before acting: discovery, the " +
  "spec, and the plan all live inside it. Acting without it improvises " +
  "discovery on the expensive orchestrator model and re-derives what the " +
  "skill already carries.";

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
if (!existsSync(join(cwd, ".bottega"))) process.exit(0);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: REMINDER,
    },
  })
);
process.exit(0);
