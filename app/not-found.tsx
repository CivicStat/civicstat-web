import Link from "next/link";

export default function NotFound() {
  const path = "";
  return (
    <div className="mx-auto max-w-[700px] px-5 py-16 pb-24 text-center">
      <h1 className="font-serif text-[clamp(48px,8vw,72px)] text-ink leading-none mb-4">
        404
      </h1>
      <p className="text-lg text-text-secondary mb-8">
        Deze pagina bestaat niet of is verplaatst.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-moss px-5 py-2.5 text-sm font-medium text-white hover:bg-moss-hover transition-colors"
        >
          <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Naar de homepage
        </Link>
      </div>

      <div className="card p-6">
        <p className="text-sm text-text-secondary mb-4">Populaire pagina&apos;s:</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/nl/tweede-kamer/partijen" className="text-sm text-moss hover:underline">
            Partijen
          </Link>
          <span className="text-text-tertiary">·</span>
          <Link href="/nl/tweede-kamer/moties" className="text-sm text-moss hover:underline">
            Moties
          </Link>
          <span className="text-text-tertiary">·</span>
          <Link href="/nl/tweede-kamer/beloften" className="text-sm text-moss hover:underline">
            Beloften
          </Link>
          <span className="text-text-tertiary">·</span>
          <Link href="/nl/gemeenten" className="text-sm text-moss hover:underline">
            Gemeenten
          </Link>
          <span className="text-text-tertiary">·</span>
          <Link href="/nl/tweede-kamer/zoeken" className="text-sm text-moss hover:underline">
            Zoeken
          </Link>
        </div>
      </div>
    </div>
  );
}
