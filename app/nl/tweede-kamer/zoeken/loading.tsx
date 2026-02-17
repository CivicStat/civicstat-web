export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24 animate-pulse">
      {/* Search bar */}
      <div className="card h-12 mb-6" />

      {/* Result sections */}
      {["Kamerleden", "Beloften", "Moties"].map((section) => (
        <div key={section} className="mb-8">
          <div className="h-5 w-24 bg-surface-sub rounded mb-4" />
          <div className="card p-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-border-subtle last:border-0">
                <div className="w-8 h-8 bg-surface-sub rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-surface-sub rounded mb-1" />
                  <div className="h-3 w-1/2 bg-surface-sub rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
