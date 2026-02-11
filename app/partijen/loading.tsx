export default function PartijenLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24 animate-pulse">
      <div className="h-8 w-36 bg-surface-sub rounded mb-2" />
      <div className="h-4 w-72 bg-surface-sub rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-surface-sub rounded-xl" />
              <div>
                <div className="h-5 w-20 bg-surface-sub rounded mb-1" />
                <div className="h-3 w-32 bg-surface-sub rounded" />
              </div>
            </div>
            <div className="h-2 w-full bg-surface-sub rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
