/**
 * Lives in the `(list)` route group, not in `properties/`, and that placement
 * is the whole point.
 *
 * A `loading.tsx` wraps its segment AND every child segment in a Suspense
 * boundary. Sitting one level up it also covered `properties/[slug]`, where it
 * broke two things: `notFound()` fires inside a boundary that has already
 * begun streaming, so an unknown listing answered 200 with not-found content
 * instead of 404. A route group scopes this to the listing page — which is the
 * one that actually waits, since its filters come from the query string —
 * without touching the detail route. Route groups do not appear in the URL, so
 * the page is still served at /properties.
 */
export default function PropertiesLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 lg:px-8" aria-hidden="true">
      <div className="mb-8 h-9 w-2/3 max-w-md animate-pulse rounded bg-black/5" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[12px] border border-black/5">
            <div className="aspect-[4/3] w-full animate-pulse bg-black/5" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-black/5" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-black/5" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-black/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
