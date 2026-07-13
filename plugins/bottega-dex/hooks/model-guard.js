#!/usr/bin/env node

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

let event;
try {
  event = JSON.parse(await readStdin());
} catch {
  process.exit(0);
}

const model = typeof event.model === "string" ? event.model : "";
const sol = /(^|\/)gpt-5\.6(?:-sol)?$/i.test(model);
const additionalContext = sol
  ? "Bottega Dex requires GPT-5.6 Sol at Ultra. This hook confirmed Sol, but Codex hooks do not expose reasoning effort. Before starting $bottega-dex:run, confirm that this thread is set to Ultra."
  : `The active model is '${model || "unknown"}'. Do not start a Bottega Dex run in this thread. Start or switch to GPT-5.6 Sol at Ultra, then invoke $bottega-dex:run.`;

const output = {
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext,
  },
};
if (!sol) output.systemMessage = "Bottega Dex requires gpt-5.6-sol at Ultra.";

process.stdout.write(JSON.stringify(output));
