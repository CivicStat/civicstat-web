export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24 animate-pulse">
      {/* Back link */}
      <div className="h-4 w-28 bg-surface-sub rounded mb-6" />

      {/* Title */}
      <div className="h-7 w-3/4 bg-surface-sub rounded mb-2" />
      <div className="h-5 w-1/2 bg-surface-sub rounded mb-6" />

      {/* Meta badges */}
      <div className="flex gap-2 mb-6">
        <div className="h-6 w-20 bg-surface-sub rounded-full" />
        <div className="h-6 w-16 bg-surface-sub rounded-full" />
        <div className="h-6 w-24 bg-surface-sub rounded-full" />
      </div>

      {/* Vote bar */}
      <div className="card p-5 mb-6">
        <div className="h-4 w-32 bg-surface-sub rounded mb-3" />
        <div className="h-3 w-full bg-surface-sub rounded-full mb-2" />
        <div className="flex gap-4">
          <div className="h-3 w-20 bg-surface-sub rounded" />
          <div className="h-3 w-20 bg-surface-sub rounded" />
        </div>
      </div>

      {/* Content sections */}
      <div className="card p-5 mb-6">
        <div className="h-5 w-40 bg-surface-sub rounded mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-surface-sub rounded mb-2" />
        ))}
      </div>
    </div>
  );
}
