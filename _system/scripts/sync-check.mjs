#!/usr/bin/env node
// SessionStart hook: keep the vault in sync before the agent reads it.
//
// - Skips in cloud sessions (CLAUDE_CODE_REMOTE=true → fresh clone) and when
//   config.json sets sync.autoPull=false.
// - If the last fetch (mtime of .git/FETCH_HEAD) is older than
//   sync.pullIntervalMinutes (default 30), runs `git pull --ff-only` (15 s timeout).
// - Never stashes, merges or rebases. Never breaks the session: always exits 0.
// - Prints one status line, which Claude Code adds to the session context:
//     exo-brain sync: up-to-date | pulled N commits | skipped (<why>) | FAILED: <reason>
//
// Usage: node _system/scripts/sync-check.mjs   (from anywhere inside the vault)

import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = process.env.CLAUDE_PROJECT_DIR
  ? path.resolve(process.env.CLAUDE_PROJECT_DIR)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const say = (s) => console.log(`exo-brain sync: ${s}`);

function readSyncConfig() {
  const defaults = { autoPull: true, pullIntervalMinutes: 30 };
  for (const f of ["_system/config.json", "_system/config.template.json"]) {
    try {
      const sync = JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"))?.sync;
      if (sync) return { ...defaults, ...sync };
      if (f.endsWith("config.json")) return defaults; // config exists without sync block → defaults
    } catch {}
  }
  return defaults;
}

const git = (args, opts = {}) =>
  spawnSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 15000,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_SSH_COMMAND: process.env.GIT_SSH_COMMAND || "ssh -o BatchMode=yes -o ConnectTimeout=10" },
    ...opts,
  });

function reason(stderr) {
  const s = stderr || "";
  if (/not possible to fast-forward|diverg/i.test(s)) return "local and remote have diverged (resolve manually)";
  if (/would be overwritten|commit your changes or stash|unmerged|conflict/i.test(s)) return "uncommitted local changes conflict with incoming commits";
  if (/could not resolve host|unable to access|connection (timed out|refused)|network is unreachable|could not read from remote/i.test(s)) return "no network / remote unreachable";
  if (/no tracking information|no such ref|couldn't find remote ref/i.test(s)) return "branch has no upstream";
  if (/permission denied|authentication failed|passphrase/i.test(s)) return "git authentication failed";
  return s.trim().split("\n").pop()?.slice(0, 160) || "unknown error";
}

function main() {
  if (process.env.CLAUDE_CODE_REMOTE === "true") return say("skipped (fresh)");
  const cfg = readSyncConfig();
  if (cfg.autoPull === false) return say("skipped (sync.autoPull is false)");

  const gd = git(["rev-parse", "--git-dir"]);
  if (gd.status !== 0) return say("skipped (not a git repository)");
  const gitDir = path.resolve(ROOT, gd.stdout.trim());

  const minutes = Number(cfg.pullIntervalMinutes) || 30;
  let ageMin = Infinity;
  try { ageMin = (Date.now() - fs.statSync(path.join(gitDir, "FETCH_HEAD")).mtimeMs) / 60000; } catch {}
  if (ageMin < minutes) return say(`skipped (last fetch ${Math.round(ageMin)} min ago, interval ${minutes} min)`);

  const before = git(["rev-parse", "HEAD"]).stdout.trim();
  const pull = git(["pull", "--ff-only", "--quiet"]);
  if (pull.error?.code === "ETIMEDOUT" || pull.signal) return say("FAILED: git pull timed out after 15 s");
  if (pull.status !== 0) return say(`FAILED: ${reason(pull.stderr)}`);

  const after = git(["rev-parse", "HEAD"]).stdout.trim();
  if (before === after) return say("up-to-date");
  const n = git(["rev-list", "--count", `${before}..${after}`]).stdout.trim();
  return say(`pulled ${n} commit${n === "1" ? "" : "s"}`);
}

try { main(); } catch (e) { say(`FAILED: ${e.message}`); }
process.exit(0);
