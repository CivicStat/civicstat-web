export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24 animate-pulse">
      <div className="h-3 w-48 bg-surface-sub rounded mb-4" />
      <div className="h-7 w-40 bg-surface-sub rounded mb-2" />
      <div className="h-4 w-64 bg-surface-sub rounded mb-5" />
      <div className="card overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="px-5 py-4 border-b border-border-subtle last:border-0"
          >
            <div className="h-4 w-3/4 bg-surface-sub rounded mb-2" />
            <div className="h-3 w-1/4 bg-surface-sub rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
