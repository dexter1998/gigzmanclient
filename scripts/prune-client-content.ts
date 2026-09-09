/**
 * Deletes property and locality rows for a client that are no longer in its
 * content YAML.
 *
 * `seed:client --force` overwrites rows it finds but leaves behind ones whose
 * slug has disappeared from the file — so replacing a demo inventory with a
 * real one left both sets in the database. Run this after such a swap:
 *
 *   pnpm tsx --env-file=.env.local scripts/prune-client-content.ts <slug>
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { and, eq, notInArray } from "drizzle-orm";
import { db } from "../lib/db";
import { clients, properties, localities, propertyImages } from "../lib/db/schema";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: prune-client-content.ts <client-slug>");
  process.exit(1);
}

const dir = path.join(process.cwd(), "clients", slug, "content");
const read = (file: string) => {
  try {
    return YAML.parse(readFileSync(path.join(dir, file), "utf8"));
  } catch {
    return null;
  }
};

async function main() {
  const [client] = await db.select().from(clients).where(eq(clients.slug, slug)).limit(1);
  if (!client) throw new Error(`No client ${slug}`);

  const propSlugs: string[] = (read("properties.yaml")?.properties ?? []).map((p: any) => p.slug);
  const locSlugs: string[] = (read("localities.yaml")?.localities ?? []).map((l: any) => l.slug);

  if (propSlugs.length > 0) {
    const stale = await db
      .select({ id: properties.id, slug: properties.slug })
      .from(properties)
      .where(and(eq(properties.clientId, client.id), notInArray(properties.slug, propSlugs)));

    for (const row of stale) {
      await db.delete(propertyImages).where(eq(propertyImages.propertyId, row.id));
    }
    if (stale.length > 0) {
      await db
        .delete(properties)
        .where(and(eq(properties.clientId, client.id), notInArray(properties.slug, propSlugs)));
    }
    console.log(`properties pruned: ${stale.length}`);
  }

  if (locSlugs.length > 0) {
    const stale = await db
      .select({ slug: localities.slug })
      .from(localities)
      .where(and(eq(localities.clientId, client.id), notInArray(localities.slug, locSlugs)));
    if (stale.length > 0) {
      await db
        .delete(localities)
        .where(and(eq(localities.clientId, client.id), notInArray(localities.slug, locSlugs)));
    }
    console.log(`localities pruned: ${stale.length}`);
  }

  process.exit(0);
}

main();
