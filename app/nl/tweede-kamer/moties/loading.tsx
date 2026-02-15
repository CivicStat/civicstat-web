export default function MotiesLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24 animate-pulse">
      <div className="h-8 w-32 bg-surface-sub rounded mb-2" />
      <div className="h-4 w-80 bg-surface-sub rounded mb-5" />
      <div className="h-10 w-full bg-surface-sub rounded-card mb-5" />
      <div className="card overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-5 py-3.5 border-b border-border-subtle last:border-0">
            <div className="h-4 w-3/4 bg-surface-sub rounded mb-2" />
            <div className="h-3 w-1/3 bg-surface-sub rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
