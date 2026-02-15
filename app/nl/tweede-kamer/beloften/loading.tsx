export default function BeloftenLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24 animate-pulse">
      <div className="h-8 w-48 bg-surface-sub rounded mb-2" />
      <div className="h-4 w-96 bg-surface-sub rounded mb-5" />
      <div className="h-10 w-full bg-surface-sub rounded-card mb-5" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="flex gap-2 mb-3">
              <div className="h-5 w-16 bg-surface-sub rounded-full" />
              <div className="h-5 w-20 bg-surface-sub rounded-full" />
            </div>
            <div className="h-5 w-3/4 bg-surface-sub rounded mb-2" />
            <div className="h-3 w-1/2 bg-surface-sub rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
