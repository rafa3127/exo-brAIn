#!/usr/bin/env node
// PreToolUse guard for the restricted "inbox" mode (remote capture agent).
//
// Registered in .claude/settings.json for every tool. It is a no-op unless
// EXO_BRAIN_MODE=inbox: local sessions and normal cloud sessions are untouched.
//
// In inbox mode the agent may only record: create new tasks/backlog items,
// create/append today's capture, regenerate two indexes, and run git/read-only
// commands. Everything else is denied. When in doubt, deny.
//
// Output: nothing (exit 0) = no decision, normal permission flow continues.
//         {"hookSpecificOutput":{"permissionDecision":"deny",...}} (exit 0) = blocked.
// Any internal error in inbox mode results in a deny (fail closed).

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// ---------- path rules ----------

const RE_TASK = /^_tasks\/(?!_index)[^/]+\.md$/;
const RE_BACKLOG = /^_backlog\/(?!_index)[^/]+\.md$/;
const RE_CAPTURE = /^_captures\/(\d{4}-\d{2}-\d{2})\.md$/;
const INDEXES = new Set(["_tasks/_index-pending.md", "_backlog/_index.md"]);
// Not secrets: the bridge token lives in the network secret, never in the environment.
const PRINTENV_VARS = new Set(["EXO_BRAIN_MODE", "EXO_BRAIN_NOTIFY_URL"]);

const ymd = (d) => d.toISOString().slice(0, 10);
// "Today" depends on the user's timezone; accept UTC yesterday/today/tomorrow.
function isTodayish(date, now = new Date()) {
  const day = 86400000;
  return [ymd(new Date(now - day)), ymd(now), ymd(new Date(+now + day))].includes(date);
}

/** Normalize a tool path to a repo-relative POSIX path, or null if outside the repo / uses "..". */
export function relPath(root, p) {
  if (typeof p !== "string" || !p.trim()) return null;
  if (p.split(/[\\/]+/).includes("..")) return null;
  const abs = path.resolve(root, p);
  const rel = path.relative(root, abs);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return rel.split(path.sep).join("/");
}

/** Paths `git add` may stage (newness is enforced at commit time). */
const stageable = (rel) =>
  !!rel && (INDEXES.has(rel) || RE_TASK.test(rel) || RE_BACKLOG.test(rel) || RE_CAPTURE.test(rel));

// ---------- shell tokenizer ----------

const NOTIFY_VAR = /^\$\{?EXO_BRAIN_NOTIFY_URL\}?$/;

/**
 * Minimal POSIX-ish tokenizer. Returns { tokens } or { error }.
 * Rejects every unquoted shell metacharacter (chaining, pipes, redirection,
 * substitution, subshells, newlines) and any `$` / backtick expansion except
 * the literal $EXO_BRAIN_NOTIFY_URL variable as a whole token.
 */
export function tokenize(cmd) {
  const tokens = [];
  let cur = "", has = false, i = 0;
  const push = () => { if (has) tokens.push(cur); cur = ""; has = false; };
  while (i < cmd.length) {
    const c = cmd[i];
    if (c === "'") {
      const j = cmd.indexOf("'", i + 1);
      if (j < 0) return { error: "unterminated quote" };
      cur += cmd.slice(i + 1, j); has = true; i = j + 1;
    } else if (c === '"') {
      let j = i + 1, s = "";
      for (; j < cmd.length && cmd[j] !== '"'; j++) {
        if (cmd[j] === "\\" && j + 1 < cmd.length && '"\\$`'.includes(cmd[j + 1])) { s += cmd[++j]; continue; }
        if (cmd[j] === "`") return { error: "command substitution" };
        if (cmd[j] === "$") {
          const m = cmd.slice(j).match(/^\$\{?EXO_BRAIN_NOTIFY_URL\}?/);
          if (!m) return { error: "variable expansion" };
          s += m[0]; j += m[0].length - 1; continue;
        }
        s += cmd[j];
      }
      if (j >= cmd.length) return { error: "unterminated quote" };
      cur += s; has = true; i = j + 1;
    } else if (/\s/.test(c)) {
      if (c === "\n" || c === "\r") return { error: "multi-line command" };
      push(); i++;
    } else if (";&|<>()`{}!\\#".includes(c)) {
      return { error: `shell metacharacter '${c}'` };
    } else if (c === "$") {
      const m = cmd.slice(i).match(/^\$\{?EXO_BRAIN_NOTIFY_URL\}?/);
      if (!m) return { error: "variable expansion" };
      cur += m[0]; has = true; i += m[0].length;
    } else { cur += c; has = true; i++; }
  }
  push();
  // `$` inside single quotes is literal; outside them only $EXO_BRAIN_NOTIFY_URL survives the checks above
  // (and the curl rule requires it as a whole token).
  return { tokens };
}

// ---------- Bash rules ----------

const READ_CMDS = new Set(["ls", "cat", "head", "tail", "grep", "find", "wc", "date", "pwd"]);
const FIND_DENY = /^-(exec|execdir|ok|okdir|delete|fprint|fprint0|fprintf|fls)$/;

function checkReadArgs(root, args) {
  for (const a of args) {
    if (a.startsWith("-")) continue;
    if (/^[~/]|^[A-Za-z]:/.test(a)) return `absolute path '${a}'`;
    if (a.split(/[\\/]+/).includes("..")) return `path '${a}' leaves the vault`;
  }
  return null;
}

function stagedViolations(root) {
  const out = execFileSync("git", ["diff", "--cached", "--name-status", "--no-renames"], { cwd: root, encoding: "utf8" });
  const bad = [];
  for (const line of out.split("\n").filter(Boolean)) {
    const [status, ...rest] = line.split("\t");
    const p = rest.join("\t");
    const ok =
      (INDEXES.has(p) && /^[AM]$/.test(status)) ||
      ((RE_TASK.test(p) || RE_BACKLOG.test(p)) && status === "A") ||
      (RE_CAPTURE.test(p) && /^[AM]$/.test(status));
    if (!ok) bad.push(`${status} ${p}`);
  }
  return bad;
}

function checkGit(root, args, env) {
  const [sub, ...rest] = args;
  if (!sub || sub.startsWith("-")) return "git global options are not allowed";
  switch (sub) {
    case "status":
    case "log":
    case "show":
    case "rev-parse":
      if (rest.some((a) => /^--output/.test(a))) return "--output is not allowed";
      return null;
    case "diff":
      if (rest.some((a) => /^--output/.test(a) || a === "--ext-diff")) return "--output/--ext-diff are not allowed";
      return null;
    case "add": {
      const paths = rest.filter((a) => a !== "--");
      if (!paths.length) return "git add needs explicit paths";
      for (const a of paths) {
        if (a.startsWith("-")) return `git add option '${a}' is not allowed`;
        if (/[*?[]/.test(a)) return "globs are not allowed in git add";
        if (!stageable(relPath(root, a))) return `cannot stage '${a}' in inbox mode`;
      }
      return null;
    }
    case "commit": {
      if (!(rest.length === 2 && (rest[0] === "-m" || rest[0] === "--message"))) return "only `git commit -m <message>` is allowed";
      if (!/^inbox: /.test(rest[1])) return "commit message must start with 'inbox: '";
      const bad = stagedViolations(root);
      if (bad.length) return `staged changes outside the inbox scope: ${bad.join(", ")}`;
      return null;
    }
    case "pull":
      return rest.join(" ") === "--rebase origin main" ? null : "only `git pull --rebase origin main` is allowed";
    case "push": {
      const ok = /^origin (main|HEAD:main|HEAD:claude\/inbox-\d{4}-\d{2}-\d{2}(-[a-z0-9]+)?)$/.test(rest.join(" "));
      return ok ? null : "only `git push origin HEAD:main` (or HEAD:claude/inbox-YYYY-MM-DD) is allowed";
    }
    default:
      return `git ${sub} is not allowed in inbox mode`;
  }
}

function checkCurl(args, env) {
  if (!env.EXO_BRAIN_NOTIFY_URL) return "EXO_BRAIN_NOTIFY_URL is not set";
  let url = false, method = false, ctype = false, data = null;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (["-s", "-S", "-sS", "-Ss", "--silent", "--show-error", "--fail", "-f", "-fsS"].includes(a)) continue;
    if (a === "-X" || a === "--request") { if (args[++i] !== "POST") return "only POST"; method = true; continue; }
    if (a === "-H" || a === "--header") {
      if (!/^content-type:\s*application\/json$/i.test(args[++i] ?? "")) return "only the Content-Type header is allowed";
      ctype = true; continue;
    }
    if (a === "-d" || a === "--data" || a === "--data-raw") { data = args[++i] ?? ""; continue; }
    if (NOTIFY_VAR.test(a)) { url = true; continue; }
    return `curl argument '${a}' is not allowed`;
  }
  if (!url) return "curl may only call $EXO_BRAIN_NOTIFY_URL";
  if (!method || !ctype || data === null) return "use: curl -sS -X POST \"$EXO_BRAIN_NOTIFY_URL\" -H 'Content-Type: application/json' -d '{...}'";
  let body;
  try { body = JSON.parse(data); } catch { return "notify body must be JSON"; }
  const keys = Object.keys(body ?? {}).sort().join(",");
  if (keys !== "reply_to,text" || typeof body.reply_to !== "string" || typeof body.text !== "string") return 'notify body must be {"reply_to": "...", "text": "..."}';
  if (body.text.length > 600) return "notify text too long";
  return null;
}

export function checkBash(root, cmd, env) {
  const t = tokenize(cmd);
  if (t.error) return t.error;
  const [prog, ...args] = t.tokens;
  if (!prog) return "empty command";
  if (prog === "printenv") return args.length === 1 && PRINTENV_VARS.has(args[0]) ? null : "only `printenv EXO_BRAIN_MODE` and `printenv EXO_BRAIN_NOTIFY_URL` are allowed";
  if (prog === "git") return checkGit(root, args, env);
  if (prog === "curl") return checkCurl(args, env);
  if (READ_CMDS.has(prog)) {
    if (prog === "find" && args.some((a) => FIND_DENY.test(a))) return "find -exec/-delete/-fprint are not allowed";
    if (prog === "date" && args.some((a) => /^-s|^--set/.test(a))) return "date --set is not allowed";
    return checkReadArgs(root, args);
  }
  return `'${prog}' is not allowed in inbox mode`;
}

// ---------- tool dispatch ----------

const READ_TOOLS = new Set(["Read", "Glob", "Grep", "LS"]);
const NEUTRAL_TOOLS = new Set(["TodoWrite", "ToolSearch"]);

/** Returns null (no objection) or a deny reason. */
export function decide(input, env = process.env, now = new Date()) {
  if (env.EXO_BRAIN_MODE !== "inbox") return null;
  const root = path.resolve(env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
  const tool = input.tool_name;
  const ti = input.tool_input || {};

  if (tool === "Bash") return checkBash(root, String(ti.command ?? ""), env);

  if (tool === "Write" || tool === "Edit" || tool === "MultiEdit") {
    const rel = relPath(root, ti.file_path);
    if (!rel) return "path is outside the vault or uses '..'";
    const exists = fs.existsSync(path.join(root, rel));
    if (INDEXES.has(rel)) return null; // regenerated in full
    const cap = rel.match(RE_CAPTURE);
    if (cap) {
      if (!isTodayish(cap[1], now)) return `only today's capture file may be written, not '${rel}'`;
      if (tool === "Write" && exists) return `'${rel}' exists — append with Edit, never overwrite captures`;
      return null;
    }
    if (RE_TASK.test(rel) || RE_BACKLOG.test(rel)) {
      if (tool !== "Write" || exists) return `'${rel}' already exists — inbox mode only creates new tasks/backlog items`;
      return null;
    }
    return `writing '${rel}' is not allowed in inbox mode`;
  }

  if (tool === "NotebookEdit") return "notebooks are not allowed in inbox mode";

  if (READ_TOOLS.has(tool)) {
    const p = ti.file_path ?? ti.path;
    if (p === undefined || p === "") return null; // defaults to the project dir
    return relPath(root, p) !== null || path.resolve(root, p) === root ? null : "reading outside the vault is not allowed in inbox mode";
  }

  if (tool === "Skill") return /(^|:)exo-brain-inbox$/.test(String(ti.skill ?? ti.name ?? "")) ? null : "only the exo-brain-inbox skill is allowed in inbox mode";

  if (NEUTRAL_TOOLS.has(tool)) return null;

  return `tool '${tool}' is not allowed in inbox mode`;
}

// ---------- entry point ----------

const deny = (reason) =>
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: `exo-brain inbox guard: ${reason}` },
  }));

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.env.EXO_BRAIN_MODE !== "inbox") process.exit(0);
  try {
    const input = JSON.parse(fs.readFileSync(0, "utf8") || "{}");
    const reason = decide(input);
    if (reason) deny(reason);
  } catch (e) {
    deny(`internal error (${e.message}) — denied by default`);
  }
  process.exit(0);
}
