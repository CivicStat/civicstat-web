import Link from "next/link";
import {
  getElectionOverview,
  getScopedMotions,
  getScopedStats,
  getScopedScorecards,
} from "../../../lib/api";
import type { PartyScorecard } from "../../../lib/types";
import { formatDate, getPartyColor } from "../../../lib/utils";
import PartyBadge from "../../../components/PartyBadge";
import StatusBadge from "../../../components/StatusBadge";
import VoteBar from "../../../components/VoteBar";
import PartyAvatar from "../../../components/PartyAvatar";
import { routes } from "../../../lib/routes";

export const revalidate = 300;

export const metadata = {
  title: "Eerste Kamer",
  description:
    "Overzicht Eerste Kamer — stemgedrag, partijscores en senatorenanalyse.",
};

/* ── tiny inline icons ─────────────────────────────────── */
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
function VoteIcon() {
  return (
    <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
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

export default async function EKDashboardPage() {
  const SLUG = "eerste-kamer";

  const [overviewResult, motionsResult, statsResult, scorecardsResult] =
    await Promise.allSettled([
      getElectionOverview(SLUG),
      getScopedMotions(SLUG, { limit: 8 }),
      getScopedStats(SLUG),
      getScopedScorecards(SLUG),
    ]);

  const overview =
    overviewResult.status === "fulfilled" ? overviewResult.value : null;
  const recentMotions =
    motionsResult.status === "fulfilled"
      ? motionsResult.value.items.slice(0, 5)
      : null;
  const stats =
    statsResult.status === "fulfilled" ? statsResult.value : null;
  const scorecards: Omit<PartyScorecard, "promises">[] =
    scorecardsResult.status === "fulfilled" ? scorecardsResult.value : [];

  const parties = overview?.parties ?? [];

  const quickCards = [
    { icon: <MotionIcon />, label: "Moties", count: stats?.motions, href: routes.ek.moties, desc: "Behandelde wetsvoorstellen en moties" },
    { icon: <PartyIcon />, label: "Fracties", count: stats?.parties, href: routes.ek.partijen, desc: "Senaatsfracties en zetelverdeling" },
    { icon: <MemberIcon />, label: "Senatoren", count: stats?.members, href: routes.ek.senatoren, desc: "Leden van de Eerste Kamer" },
    { icon: <VoteIcon />, label: "Stemmingen", count: stats?.votes, href: routes.ek.moties, desc: "Stemresultaten per motie" },
  ];

  // Build scorecard lookup for MCS display
  const scMap = new Map(scorecards.map((s) => [s.partyId, s]));

  return (
    <div className="mx-auto max-w-[1200px] px-6 pt-8 pb-20">
      {/* Breadcrumb */}
      <nav className="text-[11px] text-text-tertiary mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-moss transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Eerste Kamer</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-widest text-text-tertiary mb-2">
          Nederland
        </p>
        <h1 className="font-serif text-[clamp(26px,4vw,38px)] font-normal text-ink leading-[1.2] tracking-tight">
          Eerste Kamer der Staten-Generaal
        </h1>
        <p className="text-[15px] text-text-secondary mt-2 max-w-[540px] leading-relaxed">
          Overzicht van wetsvoorstellen, stemgedrag en partijanalyse in de
          Senaat — 75 zetels, traceerbaar en zonder politieke duiding.
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

      {/* Party scores table */}
      {parties.length > 0 && (
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="section-label">Belofteconsistentie</div>
              <h2 className="font-serif text-[20px] font-normal text-ink mt-1">
                Stemgedrag vs. verkiezingsprogramma
              </h2>
            </div>
            <Link
              href={routes.ek.partijen}
              className="text-[12px] font-medium text-moss hover:underline inline-flex items-center gap-1"
            >
              Alle fracties <ArrowIcon />
            </Link>
          </div>
          <div className="card overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-[1fr_90px_90px_60px] gap-2 px-5 py-2.5 border-b border-border bg-surface-sub/30 text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
              <span>Fractie</span>
              <span className="text-right">Track record</span>
              <span className="text-right">Vooruitblik</span>
              <span className="text-right">Zetels</span>
            </div>
            {[...parties]
              .sort((a, b) => {
                const sa = a.vooruitblikMcs ?? a.historicalMcs ?? -1;
                const sb = b.vooruitblikMcs ?? b.historicalMcs ?? -1;
                if (sb !== sa) return sb - sa;
                return (b.seats ?? 0) - (a.seats ?? 0);
              })
              .map((p, idx, arr) => (
                <Link
                  key={p.partyId}
                  href={routes.ek.partij(p.partyId)}
                  className={`block hover:bg-surface-sub/40 transition-colors ${
                    idx < arr.length - 1 ? "border-b border-border-subtle" : ""
                  }`}
                >
                  {/* Desktop */}
                  <div className="hidden sm:grid sm:grid-cols-[1fr_90px_90px_60px] gap-2 items-center px-5 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PartyAvatar
                        abbreviation={p.abbreviation}
                        color={getPartyColor(p.abbreviation)}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-ink truncate">
                          {p.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {p.historicalMcs != null ? (
                        <span className="text-[15px] font-serif text-ink">
                          {p.historicalMcs}
                        </span>
                      ) : (
                        <span className="text-[12px] text-text-tertiary">&mdash;</span>
                      )}
                    </div>
                    <div className="text-right">
                      {p.vooruitblikMcs != null ? (
                        <span className="text-[15px] font-serif font-medium text-ink">
                          {p.vooruitblikMcs}
                        </span>
                      ) : (
                        <span className="text-[12px] text-text-tertiary">&mdash;</span>
                      )}
                    </div>
                    <div className="text-right text-[12px] text-text-tertiary">
                      {p.seats ?? "&mdash;"}
                    </div>
                  </div>
                  {/* Mobile */}
                  <div className="sm:hidden px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PartyAvatar
                        abbreviation={p.abbreviation}
                        color={getPartyColor(p.abbreviation)}
                        size="sm"
                      />
                      <span className="text-[13px] font-semibold text-ink">
                        {p.abbreviation}
                      </span>
                    </div>
                    <div className="flex gap-3 text-[11px]">
                      {p.historicalMcs != null && (
                        <span>
                          <span className="text-text-tertiary">MCS: </span>
                          <span className="font-serif text-[14px] text-ink">{p.historicalMcs}</span>
                        </span>
                      )}
                      {p.vooruitblikMcs != null && (
                        <span>
                          <span className="text-text-tertiary">VB: </span>
                          <span className="font-serif text-[14px] font-medium text-ink">{p.vooruitblikMcs}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: scorecard cards (3 cols) */}
        <div className="lg:col-span-3">
          {scorecards.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="section-label">MCS Scores</div>
                  <h2 className="font-serif text-[20px] font-normal text-ink mt-1">
                    Hoe consistent stemmen senaatsfracties?
                  </h2>
                </div>
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
                        href={routes.ek.partij(sc.partyId)}
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
                  Laatste behandelingen
                </h2>
              </div>
              <Link
                href={routes.ek.moties}
                className="text-[12px] font-medium text-moss hover:underline inline-flex items-center gap-1"
              >
                Alle moties <ArrowIcon />
              </Link>
            </div>
            {recentMotions && recentMotions.length > 0 ? (
              <div className="card overflow-hidden">
                {recentMotions.map((m, i) => {
                  const vote = m.vote || m.votes?.[0];
                  const party = m.sponsors?.[0]?.mp?.party;
                  return (
                    <Link
                      key={m.id}
                      href={routes.ek.motie(m.id)}
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
                              <span>&middot;</span>
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
          {stats && (
            <section className="mt-6">
              <div className="section-label mb-3">Senaat in cijfers</div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { n: stats.motions, l: "Moties" },
                  { n: stats.votes, l: "Stemmingen" },
                  { n: stats.parties, l: "Fracties" },
                  { n: stats.members, l: "Senatoren" },
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
        </div>
      </div>
    </div>
  );
}
