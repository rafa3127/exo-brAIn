#!/usr/bin/env node
// Scenarios for sync-check.mjs. Run: node _system/scripts/sync-check.test.mjs
// Builds a bare remote + two clones in the OS temp dir; never touches the vault.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("./sync-check.mjs", import.meta.url));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sync-check-"));
const run = (cwd, ...a) => execFileSync("git", a, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
const remote = path.join(tmp, "remote.git"), up = path.join(tmp, "up"), vault = path.join(tmp, "vault");

run(tmp, "init", "-q", "--bare", "-b", "main", remote);
for (const d of [up, vault]) {
  if (d === up) { run(tmp, "init", "-q", "-b", "main", d); run(d, "remote", "add", "origin", remote); }
  run(d, "config", "user.email", "t@example.com"); run(d, "config", "user.name", "t"); run(d, "config", "core.autocrlf", "false");
  if (d === up) {
    fs.writeFileSync(path.join(up, "f.txt"), "1\n");
    run(up, "add", "-A"); run(up, "commit", "-qm", "c1"); run(up, "push", "-q", "-u", "origin", "main");
    run(tmp, "clone", "-q", "-c", "core.autocrlf=false", remote, vault);
  }
}
const commitUp = (msg, file = "f.txt") => { fs.appendFileSync(path.join(up, file), msg + "\n"); run(up, "commit", "-qam", msg); run(up, "push", "-q"); };
const ageFetch = () => { const f = path.join(vault, ".git", "FETCH_HEAD"); if (fs.existsSync(f)) { const t = new Date(Date.now() - 2 * 3600e3); fs.utimesSync(f, t, t); } };
const sync = (env = {}) => {
  const r = spawnSync(process.execPath, [SCRIPT], { encoding: "utf8", env: { ...process.env, CLAUDE_CODE_REMOTE: "", ...env, CLAUDE_PROJECT_DIR: vault } });
  return { code: r.status, out: r.stdout.trim() };
};

let pass = 0, fail = 0;
const expect = (label, r, re) => {
  const ok = r.code === 0 && re.test(r.out);
  ok ? pass++ : fail++;
  console.log(`${ok ? "✔" : "✗"} ${label}: ${r.out} (exit ${r.code})`);
};

fs.rmSync(path.join(vault, ".git", "FETCH_HEAD"), { force: true });
expect("no FETCH_HEAD (never fetched) → pulls", sync(), /^exo-brain sync: up-to-date$/);
expect("second start right after", sync(), /skipped \(last fetch 0 min ago/);
commitUp("c2"); commitUp("c3"); ageFetch();
expect("2 new remote commits, stale fetch", sync(), /^exo-brain sync: pulled 2 commits$/);
expect("cloud session", sync({ CLAUDE_CODE_REMOTE: "true" }), /^exo-brain sync: skipped \(fresh\)$/);
fs.mkdirSync(path.join(vault, "_system"), { recursive: true });
fs.writeFileSync(path.join(vault, "_system", "config.json"), JSON.stringify({ sync: { autoPull: false } }));
ageFetch();
expect("sync.autoPull=false", sync(), /skipped \(sync\.autoPull is false\)/);
fs.writeFileSync(path.join(vault, "_system", "config.json"), JSON.stringify({ sync: { pullIntervalMinutes: 300 } }));
expect("custom interval (300 min) honoured", sync(), /skipped \(last fetch 120 min ago, interval 300 min\)/);
fs.rmSync(path.join(vault, "_system"), { recursive: true });

commitUp("c4"); fs.appendFileSync(path.join(vault, "f.txt"), "local dirty\n"); ageFetch();
expect("dirty file that incoming commit touches", sync(), /FAILED: uncommitted local changes conflict/);
run(vault, "checkout", "--", "f.txt");

fs.writeFileSync(path.join(vault, "g.txt"), "local\n"); run(vault, "add", "g.txt"); run(vault, "commit", "-qm", "local");
commitUp("c5"); ageFetch();
expect("local and remote diverged", sync(), /FAILED: local and remote have diverged/);
const head = run(vault, "rev-parse", "HEAD").trim();
const ok = run(vault, "status", "--porcelain").trim() === "" && head === run(vault, "rev-parse", "HEAD").trim();
ok ? pass++ : fail++; console.log(`${ok ? "✔" : "✗"} diverged: no stash/merge/rebase performed, tree untouched`);

run(vault, "remote", "set-url", "origin", "https://nonexistent.invalid/x.git"); ageFetch();
expect("remote unreachable", sync(), /FAILED: no network \/ remote unreachable/);

const notRepo = fs.mkdtempSync(path.join(os.tmpdir(), "not-a-repo-"));
const r = spawnSync(process.execPath, [SCRIPT], { encoding: "utf8", env: { ...process.env, CLAUDE_CODE_REMOTE: "", CLAUDE_PROJECT_DIR: notRepo } });
expect("not a git repository", { code: r.status, out: r.stdout.trim() }, /skipped \(not a git repository\)/);

fs.rmSync(tmp, { recursive: true, force: true }); fs.rmSync(notRepo, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
