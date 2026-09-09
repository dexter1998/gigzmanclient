/**
 * Pure path helpers, deliberately free of any database or server import so that
 * Client Components can use them without pulling the driver into the bundle.
 */

export function joinPath(basePath: string, path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;

  // A trailing slash on the base has to go before joining. Several callers
  // pass `basePath || "/"` so a bare link still resolves to the site root; in
  // host mode `basePath` is empty, so that fallback turned every link into
  // `//properties`. A leading `//` is a protocol-relative URL, so the browser
  // resolved it as `https://properties/` and the link failed to load entirely
  // rather than 404ing visibly.
  const base = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;

  const joined = `${base}${path}`;
  return joined.length > 1 && joined.endsWith("/") ? joined.slice(0, -1) : joined;
}
