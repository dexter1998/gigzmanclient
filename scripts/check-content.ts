import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

/**
 * Reports every client field that is not yet `verified`.
 *
 * This is the pre-delivery checklist: placeholder content is fine while building
 * a mockup, but each item has to be either confirmed with the firm or the
 * corresponding section switched off before the site goes live.
 */

const slug = process.argv[2];
const clientsDir = join(process.cwd(), "clients");

const targets = slug
  ? [slug]
  : readdirSync(clientsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
      .map((d) => d.name);

if (targets.length === 0) {
  console.log("No client folders found.");
  process.exit(0);
}

let totalPlaceholder = 0;
let totalPending = 0;

for (const target of targets) {
  const dir = join(clientsDir, target);
  console.log(`\n${"─".repeat(64)}\n${target}\n${"─".repeat(64)}`);

  const profilePath = join(dir, "profile.yaml");
  if (!existsSync(profilePath)) {
    console.log("  no profile.yaml");
    continue;
  }

  const profile = parse(readFileSync(profilePath, "utf-8")) as {
    _status?: Record<string, string>;
  };

  const statuses = profile._status ?? {};
  const placeholder: string[] = [];
  const pending: string[] = [];

  for (const [field, status] of Object.entries(statuses)) {
    if (status === "placeholder") placeholder.push(field);
    else if (status === "pending") pending.push(field);
  }

  // Content files carry a single document-level status rather than per-field.
  const contentDir = join(dir, "content");
  if (existsSync(contentDir)) {
    for (const file of readdirSync(contentDir).filter((f) => f.endsWith(".yaml"))) {
      const doc = parse(readFileSync(join(contentDir, file), "utf-8")) as { _status?: string };
      if (doc?._status === "placeholder") placeholder.push(`content/${file} (whole file)`);
      else if (doc?._status === "pending") pending.push(`content/${file} (whole file)`);
    }
  }

  if (pending.length > 0) {
    console.log(`\n  PENDING — unknown, currently renders nothing (${pending.length})`);
    for (const f of pending) console.log(`    · ${f}`);
  }

  if (placeholder.length > 0) {
    console.log(`\n  PLACEHOLDER — example content, confirm or switch off (${placeholder.length})`);
    for (const f of placeholder) console.log(`    · ${f}`);
  }

  if (pending.length === 0 && placeholder.length === 0) {
    console.log("\n  All fields verified.");
  }

  totalPlaceholder += placeholder.length;
  totalPending += pending.length;
}

console.log(
  `\n${"─".repeat(64)}\n${totalPlaceholder} placeholder · ${totalPending} pending across ${targets.length} client(s)`,
);
console.log("Nothing here blocks the build — this is the pre-delivery checklist.\n");
