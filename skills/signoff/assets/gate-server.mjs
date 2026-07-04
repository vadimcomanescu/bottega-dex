#!/usr/bin/env node
// bottega gate server — serves one gate directory, receives the patron's
// comments and decision, and assembles the live thread. Zero dependencies,
// binds loopback only.
//
//   node gate-server.mjs --dir .bottega/gates/<spec-id> [--port 4747]
//
// Serves:  GET  /                -> gate.html
//          GET  /assets/*        -> storyboard images etc. (inside --dir only)
//          GET  /gate/state      -> state.json + decision + assembled thread
//          POST /gate/comment    -> appends one patron comment/reply to feedback.jsonl
//          POST /gate/decision   -> writes decision.json, appends to feedback.jsonl
//
// The files ARE the API between patron and maestro:
//   feedback.jsonl  patron -> maestro   comments {id,anchor,label,text,at,by:"patron"}
//                                       replies  {id,replyTo,text,at,by:"patron"}
//   replies.jsonl   maestro -> patron   {replyTo:<comment id>,text,at,by:"maestro",resolve?:true}
//   state.json      maestro -> page     {revision,status:"review"|"reading"|"revising",changed:[anchors]}
//   decision.json   patron -> maestro   durable observable; watch it like any dispatch
// To publish a revision: rewrite gate.html, bump state.json revision, status
// "review" — every open page reloads itself and badges the changed anchors.

import { createServer } from "node:http";
import { readFile, writeFile, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, join, extname, sep } from "node:path";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({ options: {
  dir:   { type: "string" },
  port:  { type: "string", default: "4747" },
  token: { type: "string" },   // when set, every route lives under /<token>/ — pair with a tunnel for remote patrons
}});
if (!args.dir) { console.error("usage: gate-server.mjs --dir <gate-dir> [--port N] [--token SECRET]"); process.exit(2); }
const DIR = resolve(args.dir);
if (!existsSync(join(DIR, "gate.html"))) { console.error(`no gate.html in ${DIR}`); process.exit(2); }

const MIME = { ".html": "text/html; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp", ".gif": "image/gif",
  ".css": "text/css", ".js": "text/javascript", ".json": "application/json" };

async function jsonl(name) {
  try { return (await readFile(join(DIR, name), "utf8")).split("\n").filter(Boolean).map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean); }
  catch { return []; }
}
async function assembleThread() {
  const patron = (await jsonl("feedback.jsonl")).filter(e => !e.decision);
  const maestro = await jsonl("replies.jsonl");
  const comments = patron.filter(e => e.anchor).map(c => ({ ...c, replies: [], resolved: false }));
  const byId = new Map(comments.map(c => [c.id, c]));
  for (const r of [...patron.filter(e => e.replyTo), ...maestro]) {
    const parent = byId.get(r.replyTo); if (!parent) continue;
    if (r.resolve) parent.resolved = true;
    if (typeof r.text === "string" && r.text.trim())
      parent.replies.push({ id: r.id ?? `m-${parent.replies.length}-${r.at ?? ""}`, text: r.text, at: r.at, by: r.by ?? "maestro" });
  }
  for (const c of comments) c.replies.sort((a, b) => String(a.at).localeCompare(String(b.at)));
  return comments.sort((a, b) => String(a.at).localeCompare(String(b.at)));
}
async function readBody(req) {
  let raw = ""; for await (const c of req) { raw += c; if (raw.length > 1e6) throw Object.assign(new Error("too large"), { status: 413 }); }
  return JSON.parse(raw);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const send = (code, body, type = "application/json") =>
    res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" }).end(body);
  if (args.token) {
    const prefix = `/${args.token}`;
    if (url.pathname === prefix) { res.writeHead(302, { Location: `${prefix}/` }).end(); return; }
    if (!url.pathname.startsWith(prefix + "/")) return send(404, "{}");
    url.pathname = url.pathname.slice(prefix.length) || "/";
  }
  try {
    if (req.method === "GET" && url.pathname === "/gate/state") {
      let state = { revision: 1, status: "review", changed: [], decision: null };
      try { state = { ...state, ...JSON.parse(await readFile(join(DIR, "state.json"), "utf8")) } } catch {}
      try { state.decision = JSON.parse(await readFile(join(DIR, "decision.json"), "utf8")).decision } catch {}
      state.thread = await assembleThread();
      return send(200, JSON.stringify(state));
    }
    if (req.method === "POST" && url.pathname === "/gate/comment") {
      const p = await readBody(req);
      if (typeof p.text !== "string" || !p.text.trim() || (!p.anchor && !p.replyTo)) return send(422, "{}");
      await appendFile(join(DIR, "feedback.jsonl"), JSON.stringify({ ...p, by: "patron" }) + "\n");
      console.log(`[gate] comment on ${p.anchor ?? `reply->${p.replyTo}`}`);
      return send(200, JSON.stringify({ ok: true }));
    }
    if (req.method === "POST" && url.pathname === "/gate/decision") {
      const p = await readBody(req);
      if (p.decision !== "signed" && p.decision !== "changes") return send(422, "{}");
      await appendFile(join(DIR, "feedback.jsonl"), JSON.stringify(p) + "\n");
      await writeFile(join(DIR, "decision.json"), JSON.stringify(p, null, 2));
      console.log(`[gate] decision: ${p.decision} (rev ${p.revision}, ${p.comments?.length ?? 0} comments)`);
      return send(200, JSON.stringify({ ok: true }));
    }
    if (req.method === "GET") {
      const rel = url.pathname === "/" ? "gate.html" : decodeURIComponent(url.pathname.slice(1));
      const file = resolve(DIR, rel);
      if (!file.startsWith(DIR + sep) && file !== join(DIR, "gate.html")) return send(403, "{}");
      const body = await readFile(file);
      return send(200, body, MIME[extname(file)] || "application/octet-stream");
    }
    send(405, "{}");
  } catch (e) { send(e.status ?? (e.code === "ENOENT" ? 404 : 500), "{}"); }
});

server.listen(Number(args.port), "127.0.0.1", () =>
  console.log(`[gate] serving ${DIR} at http://127.0.0.1:${args.port}/`));
