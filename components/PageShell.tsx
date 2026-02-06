export default function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      <div className="mb-6">
        <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-text-secondary leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      <div className="card p-5 text-sm text-text-secondary leading-relaxed space-y-2">
        {children}
      </div>
    </main>
  );
}
