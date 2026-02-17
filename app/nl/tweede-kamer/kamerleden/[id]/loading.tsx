export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24 animate-pulse">
      {/* Back link */}
      <div className="h-4 w-36 bg-surface-sub rounded mb-6" />

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-16 h-16 bg-surface-sub rounded-full flex-shrink-0" />
        <div>
          <div className="h-8 w-48 bg-surface-sub rounded mb-2" />
          <div className="h-4 w-32 bg-surface-sub rounded mb-2" />
          <div className="h-6 w-14 bg-surface-sub rounded-full" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4">
            <div className="h-3 w-16 bg-surface-sub rounded mb-2" />
            <div className="h-7 w-12 bg-surface-sub rounded" />
          </div>
        ))}
      </div>

      {/* Vote pattern */}
      <div className="card p-5 mb-8">
        <div className="h-5 w-32 bg-surface-sub rounded mb-4" />
        <div className="h-3 w-full bg-surface-sub rounded-full" />
      </div>

      {/* MCS section */}
      <div className="card p-5 mb-8">
        <div className="h-5 w-44 bg-surface-sub rounded mb-4" />
        <div className="h-4 bg-surface-sub rounded-full mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 bg-surface-sub rounded" />
          ))}
        </div>
      </div>

      {/* Motions list */}
      <div className="h-6 w-24 bg-surface-sub rounded mb-4" />
      <div className="card p-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-5 py-3.5 border-b border-border-subtle last:border-0">
            <div className="h-4 w-full bg-surface-sub rounded mb-1" />
            <div className="h-3 w-40 bg-surface-sub rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
