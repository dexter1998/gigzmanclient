/**
 * Pure path helpers, deliberately free of any database or server import so that
 * Client Components can use them without pulling the driver into the bundle.
 */

export function joinPath(basePath: string, path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  const joined = `${basePath}${path}`;
  return joined.length > 1 && joined.endsWith("/") ? joined.slice(0, -1) : joined;
}
