/**
 * Guards the behaviours that broke silently before.
 *
 * Each of these was a real, shipped bug that nothing failed on: property pages
 * quietly rendering per request, unknown slugs answering 200 with a `noindex`
 * page, listings uncacheable. They are cheap to re-check and expensive to
 * notice by eye, so run this after any change to the properties routes, the
 * header, or anything that reads searchParams:
 *
 *   node scripts/check-regressions.mjs                    # against production
 *   node scripts/check-regressions.mjs http://localhost:3005/realestate/temp-premium-v2/high-properties
 */
const BASE = process.argv[2] || "https://www.highproperties.in";
const LOCAL = BASE.includes("localhost");

let failures = 0;
const check = (name, ok, detail) => {
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
  if (!ok) failures++;
};

async function head(path) {
  const r = await fetch(BASE + path, { redirect: "follow" });
  return { status: r.status, headers: r.headers, body: await r.text() };
}

console.log(`Checking ${BASE}\n`);

// A real listing must render, and must be served from the prerender cache
// rather than re-rendered per request.
const listing = await head("/properties/willow-sco-new-gurugram");
check("a real listing returns 200", listing.status === 200, `got ${listing.status}`);
if (!LOCAL) {
  const cc = listing.headers.get("cache-control") || "";
  check("listings are cacheable", !cc.includes("no-store"), cc || "(no cache-control)");
  check("listings are prerendered", listing.headers.get("x-nextjs-prerender") === "1");
}

// An unknown slug must 404. It answered 200 with not-found content for weeks,
// which Lighthouse read as "page is blocked from indexing".
const missing = await head("/properties/definitely-not-a-real-listing-zz9");
check("an unknown listing 404s", missing.status === 404, `got ${missing.status}`);

// The listing page and its filters must both work.
for (const path of ["/properties", "/properties?purpose=buy", "/builders", "/localities"]) {
  const r = await head(path);
  check(`${path} returns 200`, r.status === 200, `got ${r.status}`);
}

// Canonical and indexability on the pages that carry them.
const home = await head("/");
check("home declares a canonical", /<link rel="canonical"/.test(home.body));
check("home is indexable", !/<meta name="robots" content="[^"]*noindex/.test(home.body));

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);
