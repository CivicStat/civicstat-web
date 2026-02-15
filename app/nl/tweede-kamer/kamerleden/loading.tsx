export default function KamerledenLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24 animate-pulse">
      <div className="h-8 w-44 bg-surface-sub rounded mb-2" />
      <div className="h-4 w-64 bg-surface-sub rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-surface-sub rounded-full" />
              <div>
                <div className="h-4 w-28 bg-surface-sub rounded mb-1" />
                <div className="h-3 w-20 bg-surface-sub rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
