export default function Loading() {
  return (
    <div className="mx-auto max-w-[900px] px-5 py-7 pb-24 animate-pulse">
      <div className="h-3 w-32 bg-ink/5 rounded mb-5" />
      <div className="h-8 w-56 bg-ink/5 rounded mb-2" />
      <div className="h-4 w-96 bg-ink/5 rounded mb-6" />
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card px-5 py-4">
            <div className="h-4 w-40 bg-ink/5 rounded mb-2" />
            <div className="h-3 w-full bg-ink/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
