import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const generatedRoot = path.join(repositoryRoot, "apps/web/src/api");

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(target) : [target];
    }),
  );
  return files.flat();
}

async function snapshot() {
  const files = [
    path.join(repositoryRoot, "api-docs.json"),
    ...(await filesUnder(generatedRoot)),
  ].sort();
  const entries = await Promise.all(
    files.map(async (file) => {
      const hash = createHash("sha256")
        .update(await readFile(file))
        .digest("hex");
      return [path.relative(repositoryRoot, file), hash];
    }),
  );
  return JSON.stringify(entries);
}

const before = await snapshot();
const result = spawnSync("pnpm", ["api:generate"], {
  cwd: repositoryRoot,
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const after = await snapshot();
if (before !== after) {
  console.error(
    "Generated OpenAPI files were stale. Commit the output of `pnpm api:generate`.",
  );
  process.exit(1);
}

console.log("Generated OpenAPI document and client are current.");
