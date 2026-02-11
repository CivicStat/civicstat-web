import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border px-5 py-6 pb-20 md:pb-6 mt-12">
      <div className="mx-auto flex max-w-[1200px] flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Tagline */}
        <span className="text-xs text-text-tertiary">
          CivicStat — Democratie, controleerbaar gemaakt.
        </span>

        {/* Links */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-tertiary">
          <Link
            href="/transparantie"
            className="hover:text-text-secondary transition-colors"
          >
            Transparantie
          </Link>
          <Link
            href="/zoeken"
            className="hover:text-text-secondary transition-colors"
          >
            Zoeken
          </Link>
          <a
            href="https://opendata.tweedekamer.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-secondary transition-colors inline-flex items-center gap-1"
          >
            TK Open Data
            <svg
              width={10}
              height={10}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              className="opacity-60"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
          <a
            href="https://civicstat-api.fly.dev/health"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-secondary transition-colors inline-flex items-center gap-1"
          >
            Open API
            <svg
              width={10}
              height={10}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              className="opacity-60"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
          <Link
            href="/"
            className="hover:text-text-secondary transition-colors"
          >
            Over CivicStat
          </Link>
        </div>
      </div>
    </footer>
  );
}
