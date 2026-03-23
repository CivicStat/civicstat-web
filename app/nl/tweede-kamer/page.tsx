import Link from "next/link";
import { getMotions, getAllScorecards, getPromiseStats, getPlatformStats, getInsights } from "../../../lib/api";
import { formatDate, getPartyColor } from "../../../lib/utils";
import PartyBadge from "../../../components/PartyBadge";
import StatusBadge from "../../../components/StatusBadge";
import VoteBar from "../../../components/VoteBar";
import PartyAvatar from "../../../components/PartyAvatar";
import { routes } from "../../../lib/routes";

export const revalidate = 300;

export const metadata = {
  title: "Tweede Kamer",
  description:
    "Overzicht Tweede Kamer — beloften, moties, stemgedrag en partijanalyse.",
};

/* ── tiny inline icons ─────────────────────────────────── */
function PromiseIcon() {
  return (
    <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function MotionIcon() {
  return (
    <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function MemberIcon() {
  return (
    <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function PartyIcon() {
  return (
    <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default async function TKDashboardPage() {
  const [motionsResult, scorecardsResult, statsResult, platformResult, insightsResult] =
    await Promise.allSettled([
      getMotions({ limit: 8 }),
      getAllScorecards(),
      getPromiseStats(),
      getPlatformStats(),
      getInsights(),
    ]);

  const recentMotions =
    motionsResult.status === "fulfilled"
      ? motionsResult.value.items.slice(0, 5)
      : null;
  const scorecards =
    scorecardsResult.status === "fulfilled" ? scorecardsResult.value : null;
  const promiseStats =
    statsResult.status === "fulfilled" ? statsResult.value : null;
  const platform =
    platformResult.status === "fulfilled" ? platformResult.value : null;
  const insights =
    insightsResult.status === "fulfilled" ? insightsResult.value : null;

  // Quick-access cards
  const quickCards = [
    { icon: <PromiseIcon />, label: "Beloften", count: platform?.promises, href: routes.tk.beloften, desc: "Verkiezingsbeloften uit partijprogramma's" },
    { icon: <MotionIcon />, label: "Moties", count: platform?.motions, href: routes.tk.moties, desc: "Ingediende Kamermoties met stemresultaten" },
    { icon: <MemberIcon />, label: "Kamerleden", count: platform?.members, href: routes.tk.kamerleden, desc: "Tweede Kamerleden en hun stemgedrag" },
    { icon: <PartyIcon />, label: "Partijen", count: platform?.parties, href: routes.tk.partijen, desc: "Partijscores en belofteconsistentie" },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-6 pt-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-widest text-text-tertiary mb-2">
          Nederland
        </p>
        <h1 className="font-serif text-[clamp(26px,4vw,38px)] font-normal text-ink leading-[1.2] tracking-tight">
          Tweede Kamer der Staten-Generaal
        </h1>
        <p className="text-[15px] text-text-secondary mt-2 max-w-[540px] leading-relaxed">
          Overzicht van verkiezingsbeloften, Kamermoties, stemgedrag en partijanalyse — traceerbaar en zonder politieke duiding.
        </p>
      </div>

      {/* Quick-access cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {quickCards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="card p-4 group hover:border-moss/40 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2 text-text-tertiary group-hover:text-moss transition-colors">
              {c.icon}
              <span className="text-[13px] font-semibold text-ink">{c.label}</span>
            </div>
            {c.count != null && (
              <div className="text-[28px] font-serif text-ink leading-none mb-1">
                {c.count.toLocaleString("nl-NL")}
              </div>
            )}
            <p className="text-[11px] text-text-tertiary leading-snug">{c.desc}</p>
          </Link>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: scorecards (3 cols) */}
        <div className="lg:col-span-3">
          {scorecards && scorecards.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="section-label">Belofteconsistentie</div>
                  <h2 className="font-serif text-[20px] font-normal text-ink mt-1">
                    Hoe consistent zijn partijen?
                  </h2>
                </div>
                <Link
                  href={routes.tk.partijen}
                  className="text-[12px] font-medium text-moss hover:underline inline-flex items-center gap-1"
                >
                  Alle partijen <ArrowIcon />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {scorecards
                  .sort((a, b) => b.mandateConsistencyScore - a.mandateConsistencyScore)
                  .slice(0, 9)
                  .map((sc) => {
                    const color = getPartyColor(sc.abbreviation);
                    return (
                      <Link
                        key={sc.partyId}
                        href={routes.tk.partij(sc.partyId)}
                        className="card p-3.5 hover:border-moss/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 mb-2">
                          <PartyAvatar abbreviation={sc.abbreviation} color={color} size="sm" />
                          <div className="min-w-0">
                            <div className="text-[12px] font-semibold text-ink">{sc.abbreviation}</div>
                            <div className="text-[10px] text-text-tertiary">{sc.scoredPromises} beloften</div>
                          </div>
                        </div>
                        <div className="flex items-end gap-1.5">
                          <div className="text-[24px] font-serif text-ink leading-none">{sc.mandateConsistencyScore}</div>
                          <div className="text-[10px] text-text-tertiary mb-0.5">/ 100</div>
                        </div>
                        <div className="flex h-1 rounded-full overflow-hidden gap-px mt-2">
                          {sc.consistentCount > 0 && <div className="bg-ink/25" style={{ flex: sc.consistentCount }} />}
                          {sc.mixedCount > 0 && <div className="bg-ink/10" style={{ flex: sc.mixedCount }} />}
                          {sc.inconsistentCount > 0 && <div className="bg-ink/4" style={{ flex: sc.inconsistentCount }} />}
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </section>
          )}
        </div>

        {/* Right: recent motions (2 cols) */}
        <div className="lg:col-span-2">
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="section-label">Stemmingen</div>
                <h2 className="font-serif text-[20px] font-normal text-ink mt-1">
                  Laatste moties
                </h2>
              </div>
              <Link
                href={routes.tk.moties}
                className="text-[12px] font-medium text-moss hover:underline inline-flex items-center gap-1"
              >
                Alle moties <ArrowIcon />
              </Link>
            </div>
            {recentMotions ? (
              <div className="card overflow-hidden">
                {recentMotions.map((m, i) => {
                  const vote = m.vote || m.votes?.[0];
                  const party = m.sponsors?.[0]?.mp?.party;
                  return (
                    <Link
                      key={m.id}
                      href={routes.tk.motie(m.id)}
                      className={`flex items-center gap-3 px-4 py-3 table-row-hover ${
                        i < recentMotions.length - 1 ? "border-b border-border-subtle" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-ink truncate" title={m.title}>{m.title}</div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-text-tertiary">
                          <span>{formatDate(m.dateIntroduced)}</span>
                          {party && (
                            <>
                              <span>·</span>
                              <PartyBadge abbreviation={party.abbreviation} colorNeutral={party.colorNeutral} size="sm" />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {vote && (vote.totalFor > 0 || vote.totalAgainst > 0) ? (
                          <div className="w-16 hidden sm:block">
                            <VoteBar voor={vote.totalFor} tegen={vote.totalAgainst} height={5} />
                          </div>
                        ) : null}
                        {vote?.result ? (
                          <StatusBadge status={vote.result} size="sm" />
                        ) : (
                          <span className="text-[10px] text-text-tertiary whitespace-nowrap">Geen stemming</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="card p-5 text-[13px] text-text-tertiary">
                Kon stemmingen niet laden.
              </div>
            )}
          </section>

          {/* Stats summary */}
          {promiseStats && (
            <section className="mt-6">
              <div className="section-label mb-3">Platform in cijfers</div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { n: promiseStats.totalPromises, l: "Beloften" },
                  { n: promiseStats.totalMatches, l: "Koppelingen" },
                  { n: promiseStats.byParty.length, l: "Partijen" },
                  { n: promiseStats.byTheme.length, l: "Thema's" },
                ].map((s) => (
                  <div key={s.l} className="card p-3 text-center">
                    <div className="text-[20px] font-serif text-ink leading-none">
                      {s.n.toLocaleString("nl-NL")}
                    </div>
                    <div className="text-[10px] text-text-tertiary mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Inzichten teaser */}
          {insights && (insights.bedgenoten.length > 0 || insights.scheuren.length > 0) && (
            <section className="mt-6">
              <div className="flex items-baseline justify-between mb-3">
                <div className="section-label">Verborgen patronen</div>
                <Link
                  href={routes.tk.inzichten}
                  className="text-[11px] font-medium text-moss hover:underline inline-flex items-center gap-1"
                >
                  Alle inzichten <ArrowIcon />
                </Link>
              </div>
              <div className="space-y-2">
                {insights.bedgenoten.slice(0, 2).map((pair) => (
                  <Link
                    key={`${pair.partyA}-${pair.partyB}`}
                    href={routes.tk.inzichten}
                    className="card px-4 py-3 flex items-center gap-3 hover:border-moss/40 transition-colors"
                  >
                    <span className="text-[14px] text-text-tertiary" aria-hidden>&bull;</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-ink">
                        {pair.partyA} & {pair.partyB}
                      </div>
                      <div className="text-[10px] text-text-tertiary">
                        {pair.agreementPct}% overeenstemming
                      </div>
                    </div>
                  </Link>
                ))}
                {insights.scheuren.slice(0, 1).map((s, idx) => (
                  <Link
                    key={`scheur-${idx}`}
                    href={routes.tk.inzichten}
                    className="card px-4 py-3 flex items-center gap-3 hover:border-moss/40 transition-colors"
                  >
                    <span className="text-[14px] text-text-tertiary" aria-hidden>&bull;</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-ink truncate">
                        {s.motionTitle}
                      </div>
                      <div className="text-[10px] text-text-tertiary">
                        {s.dissenters.map((d) => d.abbreviation).join(", ")} week af
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Verbinding link */}
          <Link
            href={routes.tk.verbinding}
            className="card p-4 mt-4 flex items-center gap-3 group hover:border-moss/40 transition-colors"
          >
            <div className="h-9 w-9 rounded-lg bg-moss/10 flex items-center justify-center text-moss">
              <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink">Consensusmatrix</div>
              <p className="text-[11px] text-text-tertiary">Hoe vaak stemmen partijen hetzelfde?</p>
            </div>
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
