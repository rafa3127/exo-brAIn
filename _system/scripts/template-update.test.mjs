#!/usr/bin/env node
// Scenarios for template-update.mjs. Run: node _system/scripts/template-update.test.mjs
// Builds a fake template and vaults in the OS temp dir; never touches the real vault.

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("./template-update.mjs", import.meta.url));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "template-update-"));
const template = path.join(tmp, "template");
let count = 0;

const git = (cwd, ...a) => execFileSync("git", a, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
const write = (root, file, text) => {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), text);
};
const read = (root, file) => fs.readFileSync(path.join(root, file), "utf8");
const init = (dir) => {
  git(tmp, "init", "-q", "-b", "main", dir);
  git(dir, "config", "user.email", "t@example.com");
  git(dir, "config", "user.name", "t");
  git(dir, "config", "core.autocrlf", "false");
};
const commit = (dir, msg) => {
  git(dir, "add", "-A");
  git(dir, "commit", "-qm", msg);
};
const run = (vault, args, env = {}) => {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: "utf8",
    env: { ...process.env, CLAUDE_CODE_REMOTE: "", EXO_BRAIN_MODE: "", ...env, CLAUDE_PROJECT_DIR: vault, EXO_BRAIN_TEMPLATE_URL: template },
  });
  return { code: r.status, ...JSON.parse(r.stdout) };
};

/** A vault made with "Use this template": the files of a release, with no shared history. */
function newVault(version = "1.0.0") {
  const dir = path.join(tmp, `vault-${++count}`);
  init(dir);
  execFileSync("sh", ["-c", `git -C "${template}" archive v${version} | tar -x -C "${dir}"`]);
  commit(dir, "Initial commit");
  return dir;
}
const cases = [];
const test = (name, fn) => cases.push([name, fn]);

// Template with two releases and unreleased work on top.
init(template);
const changelog = (body) => `# Changelog\n\n${body}`;
write(template, "_system/VERSION", "1.0.0\n");
write(template, "CLAUDE.md", "line 1\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\n");
write(template, "_system/skill-specs/a.md", "spec a\n");
write(template, "docs/old.md", "old\n");
write(template, ".claude/skills/x/SKILL.md", "generated v1\n");
write(template, "docs/kept.md", "kept\n");
write(template, "CHANGELOG.md", changelog("## [Unreleased]\n\n## [1.0.0] - 2026-01-01\n\n- first\n"));
commit(template, "1.0.0");
git(template, "tag", "v1.0.0");
const v2Log = "## [Unreleased]\n\n## [1.1.0] - 2026-02-01\n\n- second\n\n### Migration\n- do a thing\n\n## [1.0.0] - 2026-01-01\n\n- first\n";
write(template, "_system/VERSION", "1.1.0\n");
write(template, "CLAUDE.md", "line one\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\n");
write(template, "_system/skill-specs/a.md", "spec a v2\n");
write(template, "docs/new.md", "new\n");
write(template, "docs/kept.md", "kept v2\n");
write(template, ".claude/skills/x/SKILL.md", "generated v2\n");
fs.rmSync(path.join(template, "docs/old.md"));
write(template, "CHANGELOG.md", changelog(v2Log));
commit(template, "1.1.0");
git(template, "tag", "v1.1.0");
write(template, "unreleased.md", "not ready\n");
write(template, "CHANGELOG.md", changelog(v2Log.replace("## [Unreleased]\n", "## [Unreleased]\n\n- not ready\n")));
commit(template, "work in progress");

test("check finds the update and its changelog, without unreleased work", () => {
  const r = run(newVault(), ["check"]);
  assert.equal(r.installed, "1.0.0");
  assert.equal(r.source, "file");
  assert.equal(r.latest, "1.1.0");
  assert.equal(r.updateAvailable, true);
  assert.equal(r.skillsChanged, true);
  assert.match(r.changelog, /second/);
  assert.match(r.changelog, /### Migration/);
  assert.doesNotMatch(r.changelog, /first|not ready|Unreleased/);
});

test("check says up to date on the latest release", () => {
  const r = run(newVault("1.1.0"), ["check"]);
  assert.equal(r.updateAvailable, false);
  assert.equal(r.changelog, "");
});

test("check infers the version from shared history without VERSION", () => {
  const vault = path.join(tmp, "clone");
  git(tmp, "clone", "-q", template, vault);
  git(vault, "reset", "-q", "--hard", "v1.0.0");
  fs.rmSync(path.join(vault, "_system/VERSION"));
  const r = run(vault, ["check"]);
  assert.equal(r.installed, "1.0.0");
  assert.equal(r.source, "history");
});

test("check asks for the version without VERSION or history, and --from answers", () => {
  const vault = newVault();
  fs.rmSync(path.join(vault, "_system/VERSION"));
  commit(vault, "drop version");
  const unknown = run(vault, ["check"]);
  assert.equal(unknown.installed, null);
  assert.equal(unknown.updateAvailable, null);
  assert.deepEqual(unknown.releases, ["1.0.0", "1.1.0"]);
  assert.equal(run(vault, ["check", "--from", "1.0.0"]).updateAvailable, true);
  assert.match(run(vault, ["apply", "--to", "1.1.0"]).error, /--from/);
});

test("apply updates on a branch, keeps personal work and leaves unreleased out", () => {
  const vault = newVault();
  write(vault, "CLAUDE.md", read(vault, "CLAUDE.md") + "my personal rule\n");
  write(vault, "_tasks/mine.md", "my task\n");
  commit(vault, "personal work");
  const before = git(vault, "rev-parse", "main");

  const r = run(vault, ["apply", "--to", "1.1.0"]);
  assert.equal(r.status, "applied");
  assert.equal(r.branch, "exo-brain-update/v1.1.0");
  assert.equal(r.base, "main");
  assert.equal(r.skillsChanged, true);
  assert.deepEqual(r.conflicts, []);
  assert.equal(git(vault, "branch", "--show-current"), r.branch);
  assert.equal(git(vault, "rev-parse", "main"), before);
  assert.equal(git(vault, "status", "--porcelain"), "");

  assert.equal(read(vault, "_system/VERSION"), "1.1.0\n");
  assert.match(read(vault, "CLAUDE.md"), /^line one\n[\s\S]*my personal rule\n$/);
  assert.equal(read(vault, "_tasks/mine.md"), "my task\n");
  assert.equal(read(vault, "docs/new.md"), "new\n");
  assert.equal(fs.existsSync(path.join(vault, "docs/old.md")), false);
  assert.equal(fs.existsSync(path.join(vault, "unreleased.md")), false);
  assert.equal(run(vault, ["check"]).updateAvailable, false);
});

test("skillsChanged is false when no skill source changed", () => {
  const before = git(template, "rev-parse", "main");
  write(template, "_system/VERSION", "1.1.1\n");
  commit(template, "1.1.1");
  git(template, "tag", "v1.1.1");
  const r = run(newVault("1.1.0"), ["apply", "--to", "1.1.1"]);
  assert.equal(r.skillsChanged, false);
  git(template, "tag", "-d", "v1.1.1");
  git(template, "reset", "-q", "--hard", before);
});

test("the tag wins when a release forgot to bump VERSION", () => {
  const before = git(template, "rev-parse", "main");
  write(template, "docs/kept.md", "kept v3\n");
  commit(template, "forgot");
  git(template, "tag", "v1.1.2");
  const vault = newVault("1.1.0");
  assert.equal(run(vault, ["apply", "--to", "1.1.2"]).status, "applied");
  assert.equal(read(vault, "_system/VERSION"), "1.1.2\n");
  git(template, "tag", "-d", "v1.1.2");
  git(template, "reset", "-q", "--hard", before);
});

test("generated skills are left for build-skills, even with local paths in them", () => {
  const vault = newVault();
  write(vault, ".claude/skills/x/SKILL.md", "generated v1 with /my/vault\n");
  commit(vault, "built skills");
  const r = run(vault, ["apply", "--to", "1.1.0"]);
  assert.equal(r.status, "applied");
  assert.equal(read(vault, ".claude/skills/x/SKILL.md"), "generated v1 with /my/vault\n");
});

test("a change the vault already has is skipped", () => {
  const vault = newVault();
  write(vault, "docs/new.md", "new\n"); // Same content as the release: merged early.
  commit(vault, "merged early");
  const r = run(vault, ["apply", "--to", "1.1.0"]);
  assert.equal(r.status, "applied");
  assert.equal(r.skipped, 1);
});

test("the same line edited on both sides is a conflict left on the branch", () => {
  const vault = newVault();
  write(vault, "CLAUDE.md", read(vault, "CLAUDE.md").replace("line 1", "my line 1"));
  commit(vault, "personal edit");
  const r = run(vault, ["apply", "--to", "1.1.0"]);
  assert.equal(r.code, 0);
  assert.equal(r.status, "needs-resolution");
  assert.deepEqual(r.conflicts, ["CLAUDE.md"]);
  assert.match(read(vault, "CLAUDE.md"), /<<<<<<</);
  assert.equal(read(vault, "docs/new.md"), "new\n"); // The rest still applied.
  assert.equal(read(vault, "_system/VERSION"), "1.1.0\n");
  assert.equal(git(vault, "branch", "--show-current"), r.branch);
  assert.equal(git(vault, "log", "-1", "--format=%s"), "personal edit");
});

test("a file the user deleted is reported, not fatal", () => {
  const vault = newVault();
  fs.rmSync(path.join(vault, "docs/kept.md"));
  commit(vault, "not for me");
  const r = run(vault, ["apply", "--to", "1.1.0"]);
  assert.equal(r.status, "needs-resolution");
  assert.deepEqual([...r.conflicts, ...r.failed], ["docs/kept.md"]);
  assert.equal(read(vault, "docs/new.md"), "new\n");
});

test("refuses uncommitted changes without touching anything", () => {
  const vault = newVault();
  write(vault, "note.md", "unsaved\n");
  const r = run(vault, ["apply", "--to", "1.1.0"]);
  assert.equal(r.code, 1);
  assert.match(r.error, /uncommitted/);
  assert.equal(git(vault, "branch", "--show-current"), "main");
});

test("refuses an unpublished version, a downgrade and an existing branch", () => {
  const vault = newVault("1.1.0");
  assert.match(run(vault, ["apply", "--to", "9.9.9"]).error, /not a published release/);
  assert.match(run(vault, ["apply", "--to", "1.0.0"]).error, /already at/);
  const other = newVault();
  git(other, "branch", "exo-brain-update/v1.1.0");
  assert.match(run(other, ["apply", "--to", "1.1.0"]).error, /already exists/);
});

test("never applies in cloud sessions or remote modes", () => {
  const vault = newVault();
  assert.match(run(vault, ["apply", "--to", "1.1.0"], { CLAUDE_CODE_REMOTE: "true" }).error, /own machine/);
  assert.match(run(vault, ["apply", "--to", "1.1.0"], { EXO_BRAIN_MODE: "inbox" }).error, /own machine/);
});

let pass = 0;
let fail = 0;
for (const [name, fn] of cases) {
  try {
    fn();
    pass++;
    console.log(`✔ ${name}`);
  } catch (err) {
    fail++;
    console.log(`✗ ${name}\n  ${err.message}`);
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
