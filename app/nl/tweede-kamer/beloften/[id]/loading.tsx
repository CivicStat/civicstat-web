export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-6 pb-24 animate-pulse">
      {/* Back link */}
      <div className="h-4 w-24 bg-surface-sub rounded mb-6" />

      {/* Meta row */}
      <div className="flex gap-2 mb-3">
        <div className="h-6 w-14 bg-surface-sub rounded-full" />
        <div className="h-6 w-20 bg-surface-sub rounded-full" />
        <div className="h-6 w-16 bg-surface-sub rounded-full" />
      </div>

      {/* Summary title */}
      <div className="h-8 w-2/3 bg-surface-sub rounded mb-4" />

      {/* Blockquote */}
      <div className="border-l-[3px] border-border pl-4 mb-7">
        <div className="h-4 w-full bg-surface-sub rounded mb-2" />
        <div className="h-4 w-4/5 bg-surface-sub rounded mb-2" />
        <div className="h-4 w-3/5 bg-surface-sub rounded" />
      </div>

      {/* Consistency badge */}
      <div className="card px-5 py-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-7 w-28 bg-surface-sub rounded-full" />
          <div className="h-4 w-64 bg-surface-sub rounded" />
        </div>
      </div>

      {/* Motion matches */}
      <div className="h-6 w-48 bg-surface-sub rounded mb-4" />
      <div className="card overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-border-subtle last:border-0">
            <div className="w-5 h-5 bg-surface-sub rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-full bg-surface-sub rounded mb-1" />
              <div className="h-3 w-48 bg-surface-sub rounded" />
            </div>
            <div className="w-[70px] h-2 bg-surface-sub rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
