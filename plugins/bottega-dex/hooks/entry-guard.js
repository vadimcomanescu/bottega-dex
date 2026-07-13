#!/usr/bin/env node

const INTENT = /\bbottega(?:[ -]dex)\b/i;

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

const prompt = typeof event.prompt === "string" ? event.prompt : "";
if (/^\s*\$bottega-dex:run\b/i.test(prompt) || !INTENT.test(prompt)) {
  process.exit(0);
}

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "UserPromptSubmit",
    additionalContext: "This prompt reads like Bottega Dex run intent. Invoke $bottega-dex:run before acting so the discovery, specification, routing, review, QA, and delivery gates load together.",
  },
}));
