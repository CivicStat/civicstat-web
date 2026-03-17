export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24 animate-pulse">
      <div className="h-8 w-40 bg-ink/5 rounded mb-2" />
      <div className="h-4 w-80 bg-ink/5 rounded mb-6" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="card px-5 py-4">
            <div className="h-4 w-32 bg-ink/5 rounded mb-3" />
            <div className="h-3 w-48 bg-ink/5 rounded mb-2" />
            <div className="h-3 w-full bg-ink/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
