export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24 animate-pulse">
      {/* Title */}
      <div className="h-8 w-48 bg-surface-sub rounded mb-2" />
      <div className="h-4 w-96 bg-surface-sub rounded mb-6" />

      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-32 bg-surface-sub rounded-lg" />
        ))}
      </div>

      {/* Content cards */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-5 w-5 bg-surface-sub rounded-full" />
              <div className="h-5 w-48 bg-surface-sub rounded" />
            </div>
            <div className="h-4 w-full bg-surface-sub rounded mb-2" />
            <div className="h-4 w-2/3 bg-surface-sub rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
