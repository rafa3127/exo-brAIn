#!/usr/bin/env node
// Updates a vault to a published exo-brAIn release. The template-update skill-spec drives it.
//
//   check [--from X.Y.Z]            what is installed, what is available, the changelog between them
//   apply --to X.Y.Z [--from X.Y.Z] apply the changes on a new branch; never touches the current one
//
// Only tags named vX.Y.Z are fetched, so a change reaches vaults when it is released and
// not before: unreleased work on the template's main branch is never seen here.
// Tags land in refs/exo-brain/tags/ so they can't collide with the vault's own tags.
//
// A release is applied as the diff between two tags with `git apply --3way`, one file at a
// time. That works with or without shared history (vaults made with "Use this template"
// have none), keeps personal edits and leaves anything the template doesn't touch alone.
//
// Output: one JSON object on stdout. Exit 1 with { "error": … } when it refuses or fails.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = process.env.CLAUDE_PROJECT_DIR
  ? path.resolve(process.env.CLAUDE_PROJECT_DIR)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const TEMPLATE_URL = process.env.EXO_BRAIN_TEMPLATE_URL || "https://github.com/rafa3127/exo-brAIn.git";
const TAGS = "refs/exo-brain/tags";
const VERSION_FILE = "_system/VERSION";
const CHANGELOG = "CHANGELOG.md";
// A change here means the installed skills are stale until they are rebuilt and uploaded.
const SKILL_SOURCES = /^(_system\/skill-specs\/|_system\/quickstart\.md$|_system\/scripts\/build-skills\.mjs$)/;
// Built by build-skills.mjs with this vault's paths, so they are rebuilt instead of patched.
const GENERATED = /^\.claude\/skills\//;

class Refusal extends Error {}

function git(args, { input, allowFail = false, timeout = 60000 } = {}) {
  const r = spawnSync("git", args, {
    cwd: ROOT,
    input,
    encoding: input === undefined || typeof input === "string" ? "utf8" : "buffer",
    maxBuffer: 256 * 1024 * 1024,
    timeout,
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0",
      GIT_SSH_COMMAND: process.env.GIT_SSH_COMMAND || "ssh -o BatchMode=yes -o ConnectTimeout=10",
    },
  });
  if (r.error) throw r.error;
  if (r.status !== 0 && !allowFail) {
    throw new Error(`git ${args[0]} failed: ${String(r.stderr).trim().split("\n").pop()}`);
  }
  return r;
}
const out = (args, opts) => String(git(args, opts).stdout).trim();
const succeeds = (args) => git(args, { allowFail: true }).status === 0;

const parse = (v) => /^v?(\d+)\.(\d+)\.(\d+)$/.exec(v ?? "")?.slice(1).map(Number) ?? null;
const compare = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};
const ref = (version) => `${TAGS}/v${version}`;

function fetchReleases() {
  git(["fetch", "--quiet", "--no-tags", TEMPLATE_URL, `+refs/tags/v*:${TAGS}/v*`], { timeout: 120000 });
  return out(["for-each-ref", "--format=%(refname:lstrip=3)", TAGS])
    .split("\n")
    .filter((tag) => parse(tag))
    .map((tag) => tag.slice(1))
    .sort(compare);
}

/** Reads _system/VERSION; older vaults don't have it, so fall back to shared history. */
function installedVersion(releases) {
  try {
    const version = fs.readFileSync(path.join(ROOT, VERSION_FILE), "utf8").trim();
    if (parse(version)) return { installed: version, source: "file" };
  } catch {}
  for (const version of [...releases].reverse()) {
    if (succeeds(["merge-base", "--is-ancestor", ref(version), "HEAD"])) return { installed: version, source: "history" };
  }
  return { installed: null, source: null };
}

/** The changelog of each release after `from`, up to and including `to`. Never [Unreleased]. */
function changelogBetween(from, to) {
  const text = out(["show", `${ref(to)}:${CHANGELOG}`]).replace(/\r\n/g, "\n");
  return text
    .split(/^(?=## \[)/m)
    .filter((section) => {
      const version = /^## \[([^\]]+)\]/.exec(section)?.[1];
      return parse(version) && compare(version, from) > 0 && compare(version, to) <= 0;
    })
    .join("")
    .trim();
}

const changedFiles = (from, to) =>
  out(["diff", "--name-only", "--no-renames", "-z", ref(from), ref(to)]).split("\0").filter(Boolean);

function resolveInstalled(flags, releases) {
  if (flags.from !== undefined) {
    if (!parse(flags.from)) throw new Refusal(`--from must be a version like 1.2.3, got ${flags.from}`);
    return { installed: flags.from.replace(/^v/, ""), source: "flag" };
  }
  return installedVersion(releases);
}

function check(flags) {
  const releases = fetchReleases();
  const latest = releases.at(-1) ?? null;
  const { installed, source } = resolveInstalled(flags, releases);
  if (!latest) return { installed, source, latest, updateAvailable: false };
  if (!installed) return { installed, source, latest, updateAvailable: null, releases };
  const updateAvailable = compare(latest, installed) > 0;
  return {
    installed,
    source,
    latest,
    updateAvailable,
    skillsChanged: updateAvailable && changedFiles(installed, latest).some((file) => SKILL_SOURCES.test(file)),
    changelog: updateAvailable ? changelogBetween(installed, latest) : "",
  };
}

function refuseIfBusy() {
  const dirty = out(["status", "--porcelain"]);
  if (dirty) throw new Refusal("the working tree has uncommitted changes: commit them first");
  for (const name of ["MERGE_HEAD", "rebase-merge", "rebase-apply", "CHERRY_PICK_HEAD"]) {
    if (fs.existsSync(path.resolve(ROOT, out(["rev-parse", "--git-path", name])))) {
      throw new Refusal(`a git operation is in progress (${name}): finish it first`);
    }
  }
}

const blob = (rev) => git(["rev-parse", "--verify", "--quiet", rev], { allowFail: true }).stdout.trim() || null;

/** Applies one file's change. Returns applied, skipped, conflict or failed. */
function applyFile(file, from, to) {
  const current = blob(`:${file}`);
  const target = blob(`${ref(to)}:${file}`);
  if (current === target) return "skipped"; // Already there, e.g. the vault merged this change early.

  const patch = git(["diff", "--binary", "--full-index", "--no-renames", ref(from), ref(to), "--", file]).stdout;
  const r = git(["apply", "--3way", "--index", "-"], { input: patch, allowFail: true });
  if (r.status === 0) return "applied";
  return out(["diff", "--name-only", "--diff-filter=U", "--", file]) ? "conflict" : "failed";
}

function apply(flags) {
  if (process.env.CLAUDE_CODE_REMOTE === "true" || process.env.EXO_BRAIN_MODE) {
    throw new Refusal("template updates only run on the user's own machine");
  }
  if (!parse(flags.to)) throw new Refusal("--to is required, as a version like 1.2.3");
  const to = flags.to.replace(/^v/, "");

  const releases = fetchReleases();
  if (!releases.includes(to)) throw new Refusal(`v${to} is not a published release`);
  const { installed: from } = resolveInstalled(flags, releases);
  if (!from) throw new Refusal("can't tell the installed version: ask the user and pass --from");
  if (!releases.includes(from)) throw new Refusal(`v${from} is not a published release`);
  if (compare(to, from) <= 0) throw new Refusal(`already at v${from}`);
  refuseIfBusy();

  const base = out(["branch", "--show-current"]);
  if (!base) throw new Refusal("HEAD is detached: switch to a branch first");
  const branch = `exo-brain-update/v${to}`;
  if (succeeds(["rev-parse", "--verify", "--quiet", `refs/heads/${branch}`])) {
    throw new Refusal(`branch ${branch} already exists`);
  }
  git(["switch", "--quiet", "-c", branch]);

  const files = changedFiles(from, to);
  const results = { applied: [], skipped: [], conflict: [], failed: [] };
  for (const file of files.filter((f) => !GENERATED.test(f))) results[applyFile(file, from, to)].push(file);

  // The tag is the truth, even if a release forgot to bump the file.
  if (![...results.conflict, ...results.failed].includes(VERSION_FILE)) {
    fs.writeFileSync(path.join(ROOT, VERSION_FILE), `${to}\n`);
    git(["add", "--", VERSION_FILE]);
  }

  const needsResolution = results.conflict.length > 0 || results.failed.length > 0;
  if (!needsResolution) git(["commit", "--quiet", "-m", `Update exo-brAIn template to v${to}`]);
  return {
    status: needsResolution ? "needs-resolution" : "applied",
    from,
    to,
    base,
    branch,
    applied: results.applied.length,
    skipped: results.skipped.length,
    conflicts: results.conflict,
    failed: results.failed,
    skillsChanged: files.some((file) => SKILL_SOURCES.test(file)),
    changelog: changelogBetween(from, to),
  };
}

function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!["--from", "--to"].includes(args[i]) || args[i + 1] === undefined) throw new Refusal(`bad argument: ${args[i]}`);
    flags[args[i].slice(2)] = args[i + 1];
  }
  return flags;
}

try {
  const [command, ...rest] = process.argv.slice(2);
  if (!["check", "apply"].includes(command)) throw new Refusal("usage: template-update.mjs check|apply [--from X.Y.Z] [--to X.Y.Z]");
  const flags = parseFlags(rest);
  console.log(JSON.stringify(command === "check" ? check(flags) : apply(flags), null, 2));
} catch (err) {
  console.log(JSON.stringify({ error: err.message }, null, 2));
  process.exit(1);
}
