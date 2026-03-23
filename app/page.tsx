import Link from "next/link";
import { getPlatformStats, getInsights, getParliaments } from "../lib/api";
import SearchBar from "../components/SearchBar";
import { routes } from "../lib/routes";

export const revalidate = 3600; // ISR: re-generate at most every hour

export default async function HomePage() {
  const [stats, insights, parliamentsResult] = await Promise.all([
    getPlatformStats().catch(() => null),
    getInsights().catch(() => null),
    getParliaments().catch(() => []),
  ]);
  const municipalities = parliamentsResult.filter((p) => p.level === "MUNICIPAL");
  const activeMunicipalities = municipalities.filter(
    (m) => (m._count?.motions ?? 0) > 0,
  );

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background image — Binnenhof, The Hague */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1621944190310-e3cca1564bd7?w=1600&q=80&auto=format&fit=crop)",
            filter: "saturate(0.6) contrast(1.05)",
            backgroundPosition: "center 35%",
          }}
        />
        {/* Light gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-mist/30 via-mist/75 to-mist dark:from-[#0E1623]/30 dark:via-[#0E1623]/75 dark:to-[#0E1623]" />
        {/* Extra dark overlay for dark mode contrast */}
        <div className="absolute inset-0 hidden dark:block bg-[#0E1623]/50" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-6 pt-[72px] pb-16">
          <p className="text-[13px] font-medium text-moss tracking-wide mb-4">
            Onafhankelijke transparantie over politiek handelen
          </p>
          <h1 className="font-serif text-[clamp(30px,5vw,48px)] font-normal text-ink leading-[1.18] tracking-tight max-w-[640px] mb-5">
            Wat beloven partijen v&oacute;&oacute;r verkiezingen — en hoe stemmen zij{" "}
            <span className="italic">daarna?</span>
          </h1>
          <p className="text-base leading-relaxed text-text-secondary max-w-[500px] mb-8">
            CivicStat maakt het zichtbaar.
            <br />
            Feitelijk. Controleerbaar. Open.
          </p>
          <div className="flex gap-2.5 flex-wrap mb-8">
            <Link
              href={routes.tk.root}
              className="inline-flex items-center gap-2 rounded-[9px] bg-moss px-5 py-2.5 text-sm font-medium text-white hover:bg-moss-hover transition-colors"
            >
              Bekijk Tweede Kamer
            </Link>
            <Link
              href={routes.gemeenten.root}
              className="inline-flex items-center gap-2 rounded-[9px] bg-moss/10 px-5 py-2.5 text-sm font-medium text-moss hover:bg-moss/20 transition-colors"
            >
              Gemeenteraden
            </Link>
            <Link
              href={routes.transparantie}
              className="inline-flex items-center gap-2 rounded-[9px] border border-border px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-sub transition-colors"
            >
              Over onze methode
            </Link>
          </div>
          <SearchBar />
        </div>
      </div>

      {/* Pre-election banner — visible until election day */}
      {new Date() < new Date("2026-03-19") && (
        <div className="border-b border-border-subtle">
          <div className="mx-auto max-w-[1200px] px-6 py-4">
            <div className="border-l-4 border-neutral-800 dark:border-neutral-300 pl-4">
              <p className="text-sm font-medium text-ink">
                Gemeenteraadsverkiezingen 18 maart 2026
              </p>
              <p className="text-sm text-text-secondary mt-0.5">
                Bekijk het track record van partijen in Amsterdam en Den Haag,
                en hun nieuwe beloften voor 2026.
              </p>
              <Link
                href={routes.verkiezingen[2026]}
                className="inline-flex items-center gap-1 text-sm text-moss font-medium mt-1 hover:underline"
              >
                Naar het verkiezingsoverzicht
                <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Platform stats banner */}
      {stats && (
        <div className="border-b border-border-subtle">
          <div className="mx-auto max-w-[1200px] px-6 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href={routes.tk.beloften} className="text-center group">
                <div className="text-2xl font-serif text-ink group-hover:text-moss transition-colors">{stats.promises.toLocaleString("nl-NL")}</div>
                <div className="text-[11px] text-text-tertiary mt-0.5">Beloften geanalyseerd</div>
              </Link>
              <Link href={routes.tk.moties} className="text-center group">
                <div className="text-2xl font-serif text-ink group-hover:text-moss transition-colors">{stats.motions.toLocaleString("nl-NL")}</div>
                <div className="text-[11px] text-text-tertiary mt-0.5">Moties verwerkt</div>
              </Link>
              <Link href={routes.tk.partijen} className="text-center group">
                <div className="text-2xl font-serif text-ink group-hover:text-moss transition-colors">{stats.parties}</div>
                <div className="text-[11px] text-text-tertiary mt-0.5">Partijen</div>
              </Link>
              <Link href={routes.tk.kamerleden} className="text-center group">
                <div className="text-2xl font-serif text-ink group-hover:text-moss transition-colors">{stats.members}</div>
                <div className="text-[11px] text-text-tertiary mt-0.5">Kamerleden</div>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1200px] px-6">
        {/* Why section */}
        <section className="py-14 border-b border-border-subtle">
          <h2 className="font-serif text-[clamp(24px,3.5vw,34px)] font-normal text-ink max-w-[560px] leading-[1.25] mb-5">
            Verkiezingsprogramma&apos;s zijn openbaar.
            <br />
            Stemgedrag is openbaar.
            <br />
            <span className="italic text-text-secondary">
              Maar de vertaalslag ontbreekt.
            </span>
          </h2>
          <p className="text-[15px] leading-relaxed text-text-secondary max-w-[540px] mb-6">
            CivicStat legt die verbinding — structureel, reproduceerbaar en
            zonder politieke agenda. Wij analyseren verkiezingsprogramma&apos;s,
            Kamerstemmen, moties en wetsvoorstellen.
          </p>
          <p className="text-[15px] font-medium text-ink max-w-[400px]">
            Gebaseerd op openbare bronnen. Reproduceerbaar. Transparant over methodologische keuzes.
          </p>
        </section>

        {/* Features — now clickable */}
        <section className="py-12 border-b border-border-subtle">
          <div className="section-label">Wat CivicStat laat zien</div>
          <div className="grid gap-4 sm:grid-cols-3 mt-4">
            {[
              {
                title: "Belofte \u2192 Stemgedrag",
                desc: "Per partij, per thema: wat is beloofd? Wat is gesteund, verworpen of genegeerd?",
                href: routes.tk.beloften,
              },
              {
                title: "Scores zonder oordeel",
                desc: "Consistentiescores, afwijkingspercentages en stemfrequenties. Geen moreel oordeel.",
                href: routes.tk.partijen,
              },
              {
                title: "Individuele volksvertegenwoordigers",
                desc: "Niet alleen partijen, maar ook individuele Kamerleden. Wie stemt consequent?",
                href: routes.tk.kamerleden,
              },
            ].map((f) => (
              <Link key={f.title} href={f.href} className="card p-6 group hover:border-moss/40 transition-colors">
                <h3 className="font-serif text-lg text-ink mb-2 group-hover:text-moss transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {f.desc}
                </p>
                <span className="inline-block mt-3 text-[13px] font-medium text-moss opacity-0 group-hover:opacity-100 transition-opacity">
                  Bekijk &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── Ontdek de Nederlandse politiek (scaled for 250+) ─── */}
        <section className="py-12 border-b border-border-subtle">
          <h2 className="font-serif text-[clamp(22px,3vw,28px)] font-normal text-ink mb-6">
            Ontdek de Nederlandse politiek
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Tweede Kamer */}
            <Link href={routes.tk.root} className="block p-6 rounded-xl border border-border bg-card hover:border-moss/30 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl" aria-hidden>&#x1F1F3;&#x1F1F1;</span>
                <h3 className="font-serif text-xl group-hover:text-moss transition-colors">Tweede Kamer</h3>
              </div>
              <p className="text-sm text-text-secondary mb-2">150 zetels &middot; {stats?.parties ?? 16} partijen</p>
              {stats && (
                <p className="text-sm text-text-secondary">
                  {stats.motions.toLocaleString("nl-NL")} moties &middot; {stats.promises.toLocaleString("nl-NL")} beloften geanalyseerd
                </p>
              )}
              <span className="inline-block mt-4 text-sm text-moss font-medium">
                Bekijk dashboard &rarr;
              </span>
            </Link>

            {/* Gemeenteraden — scaled summary card */}
            <Link href={routes.gemeenten.root} className="block p-6 rounded-xl border border-border bg-card hover:border-moss/30 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl" aria-hidden>&#x1F3DB;&#xFE0F;</span>
                <h3 className="font-serif text-xl group-hover:text-moss transition-colors">Gemeenteraden</h3>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-moss/8 px-2.5 py-1 text-[12px] font-medium text-moss mb-2.5">
                <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Verkiezingen 18 maart 2026
              </div>
              <p className="text-sm text-text-secondary mb-2">
                {municipalities.length > 0
                  ? `${municipalities.length} gemeenten beschikbaar`
                  : "Gemeenteraden binnenkort beschikbaar"}
              </p>
              {activeMunicipalities.length > 0 && (
                <p className="text-sm text-text-secondary">
                  {activeMunicipalities.map((m) => m.shortName).join(", ")}
                  {municipalities.length > activeMunicipalities.length &&
                    ` + ${municipalities.length - activeMunicipalities.length} binnenkort`}
                </p>
              )}
              <span className="inline-block mt-4 text-sm text-moss font-medium">
                Bekijk alle gemeenten &rarr;
              </span>
            </Link>

            {/* Eerste Kamer */}
            <Link href={routes.ek.root} className="block p-6 rounded-xl border border-border bg-card hover:border-moss/30 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl" aria-hidden>&#x1F1F3;&#x1F1F1;</span>
                <h3 className="font-serif text-xl group-hover:text-moss transition-colors">Eerste Kamer</h3>
              </div>
              <p className="text-sm text-text-secondary mb-2">75 zetels &middot; Senaat</p>
              <p className="text-sm text-text-secondary">
                Moties, stemmingen en consistentiescores van de Eerste Kamer
              </p>
              <span className="inline-block mt-4 text-sm text-moss font-medium">
                Bekijk dashboard &rarr;
              </span>
            </Link>
          </div>

          {/* Binnenkort row */}
          <div className="flex items-center gap-4 mt-4 px-2 text-[12px] text-text-tertiary">
            <span>Binnenkort:</span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden>🇪🇺</span> Europees Parlement
            </span>
            <span>&middot;</span>
            <span>250+ gemeenten</span>
          </div>
        </section>

        {/* Verborgen patronen — teaser from insights */}
        <section className="py-12 pb-24">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="font-serif text-[clamp(22px,3vw,28px)] font-normal text-ink mb-2">
                Verborgen patronen
              </h2>
              <p className="text-text-secondary">
                CivicStat ontdekt automatisch verrassende stempatronen.
              </p>
            </div>
            <Link
              href={routes.tk.inzichten}
              className="text-[12px] font-medium text-moss hover:underline hidden sm:inline-flex items-center gap-1"
            >
              Alle inzichten →
            </Link>
          </div>

          {insights && (insights.bedgenoten.length > 0 || insights.scheuren.length > 0 || insights.consensus.length > 0) ? (
            <div className="grid sm:grid-cols-3 gap-3">
              {/* Teaser: top unlikely bedfellow */}
              {insights.bedgenoten[0] && (
                <Link
                  href={routes.tk.inzichten}
                  className="card p-5 group hover:border-moss/40 transition-colors"
                >
                  <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">
                    🤝 Bondgenoten
                  </div>
                  <div className="text-[18px] font-serif text-ink leading-tight mb-1">
                    {insights.bedgenoten[0].partyA} &amp; {insights.bedgenoten[0].partyB}
                  </div>
                  <p className="text-[12px] text-text-secondary">
                    Stemmen in {insights.bedgenoten[0].agreementPct}% van de gevallen hetzelfde
                  </p>
                </Link>
              )}

              {/* Teaser: latest coalition crack */}
              {insights.scheuren[0] && (
                <Link
                  href={routes.tk.inzichten}
                  className="card p-5 group hover:border-moss/40 transition-colors"
                >
                  <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">
                    ⚡ Coalitiescheur
                  </div>
                  <div className="text-[14px] font-medium text-ink leading-snug mb-1 line-clamp-2">
                    {insights.scheuren[0].motionTitle}
                  </div>
                  <p className="text-[12px] text-text-secondary">
                    {insights.scheuren[0].dissenters.map((d) => d.abbreviation).join(", ")}{" "}
                    stemde{insights.scheuren[0].dissenters.length === 1 ? "" : "n"} anders
                  </p>
                </Link>
              )}

              {/* Teaser: top consensus motion */}
              {insights.consensus[0] && (
                <Link
                  href={routes.tk.inzichten}
                  className="card p-5 group hover:border-moss/40 transition-colors"
                >
                  <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">
                    🕊️ Consensus
                  </div>
                  <div className="text-[18px] font-serif text-ink leading-tight mb-1">
                    {insights.consensus[0].unanimousPct}%
                  </div>
                  <p className="text-[12px] text-text-secondary line-clamp-2">
                    {insights.consensus[0].title}
                  </p>
                </Link>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-border bg-card">
              <p className="text-sm text-text-tertiary">
                Bekijk hoe partijen stemmen.{" "}
                <Link href={routes.tk.verbinding} className="text-moss hover:underline">
                  Consensusmatrix →
                </Link>
              </p>
            </div>
          )}

          <Link
            href={routes.tk.inzichten}
            className="sm:hidden mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-moss hover:underline"
          >
            Alle inzichten →
          </Link>
        </section>
      </div>
    </div>
  );
}
