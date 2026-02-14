import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border px-5 py-8 pb-20 md:pb-8 mt-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
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
              Methodologie
            </Link>
            <Link
              href="/privacy"
              className="hover:text-text-secondary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/zoeken"
              className="hover:text-text-secondary transition-colors"
            >
              Zoeken
            </Link>
            <Link
              href="/status"
              className="hover:text-text-secondary transition-colors"
            >
              Status
            </Link>
            <a
              href="https://opendata.tweedekamer.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-secondary transition-colors inline-flex items-center gap-1"
            >
              TK Open Data
              <ExternalIcon />
            </a>
            <a
              href="https://civicstat-api.fly.dev/health"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-secondary transition-colors inline-flex items-center gap-1"
            >
              Open API
              <ExternalIcon />
            </a>
          </div>
        </div>

        {/* Independence statement */}
        <p className="text-[11px] text-text-tertiary/70 leading-relaxed max-w-[520px]">
          CivicStat is een onafhankelijk burgerproject. Niet verbonden aan enige
          politieke partij, overheidsinstelling of belangenorganisatie. Alle data
          is afkomstig van de{" "}
          <a
            href="https://opendata.tweedekamer.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-text-tertiary"
          >
            Tweede Kamer Open Data API
          </a>
          .
        </p>
      </div>
    </footer>
  );
}

function ExternalIcon() {
  return (
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
  );
}
