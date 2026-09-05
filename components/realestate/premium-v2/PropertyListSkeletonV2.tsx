export default function PropertyListSkeletonV2() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[4/3] w-full animate-pulse rounded-[var(--gp-radius-md)] bg-[color:var(--gp-cream-200)]"
        />
      ))}
    </div>
  );
}
