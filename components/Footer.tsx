import Link from "next/link";
import { routes } from "../lib/routes";

export default function Footer() {
  return (
    <footer className="border-t border-border px-5 py-8 pb-20 md:pb-8 mt-12">
      <div className="mx-auto max-w-[1200px]">
        {/* Top: columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          {/* Platform */}
          <div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-text-tertiary mb-2.5">Platform</div>
            <div className="space-y-1.5">
              <FooterLink href={routes.transparantie}>Over CivicStat</FooterLink>
              <FooterLink href={routes.transparantie}>Methodologie</FooterLink>
              <FooterLink href={`${routes.transparantie}#neutraliteit`}>Governance</FooterLink>
              <FooterLink href={routes.status}>Status</FooterLink>
              <FooterLink href={routes.privacy}>Privacy</FooterLink>
            </div>
          </div>

          {/* Tweede Kamer */}
          <div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-text-tertiary mb-2.5">Tweede Kamer</div>
            <div className="space-y-1.5">
              <FooterLink href={routes.tk.root}>Overzicht</FooterLink>
              <FooterLink href={routes.tk.beloften}>Beloften</FooterLink>
              <FooterLink href={routes.tk.moties}>Moties</FooterLink>
              <FooterLink href={routes.tk.kamerleden}>Kamerleden</FooterLink>
              <FooterLink href={routes.tk.partijen}>Partijen</FooterLink>
              <FooterLink href={routes.tk.verbinding}>Verbinding</FooterLink>
            </div>
          </div>

          {/* Open Data */}
          <div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-text-tertiary mb-2.5">Open Data</div>
            <div className="space-y-1.5">
              <FooterExternal href="https://opendata.tweedekamer.nl">TK Open Data</FooterExternal>
              <FooterExternal href="https://civicstat-api.fly.dev/health">Open API</FooterExternal>
            </div>
          </div>

          {/* Tagline */}
          <div className="col-span-2 sm:col-span-1">
            <div className="text-[11px] text-text-tertiary/70 leading-relaxed">
              <span className="text-xs text-text-tertiary font-medium block mb-2">
                CivicStat
              </span>
              Democratie, controleerbaar gemaakt. Onafhankelijk burgerproject — niet verbonden aan enige
              politieke partij, overheidsinstelling of belangenorganisatie.
            </div>
          </div>
        </div>

        {/* Bottom: data source */}
        <div className="border-t border-border-subtle pt-4">
          <p className="text-[11px] text-text-tertiary/60 leading-relaxed">
            Alle parlementaire data is afkomstig van de{" "}
            <a
              href="https://opendata.tweedekamer.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-text-tertiary"
            >
              Tweede Kamer Open Data API
            </a>
            . Verkiezingsprogramma&apos;s zijn publiek beschikbaar.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block text-xs text-text-tertiary hover:text-text-secondary transition-colors"
    >
      {children}
    </Link>
  );
}

function FooterExternal({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block text-xs text-text-tertiary hover:text-text-secondary transition-colors inline-flex items-center gap-1"
    >
      {children}
      <ExternalIcon />
    </a>
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
