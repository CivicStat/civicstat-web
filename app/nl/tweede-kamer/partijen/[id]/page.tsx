import Link from "next/link";
import { Suspense } from "react";
import { getParty, getParties, getPartyScorecard, getScorecardYears, getKoersvastheid, getRegeerakkoordScorecard, getCoalitieverwatering, getPartyCoalitionAlignment, getPartyVrijeStemmen } from "../../../../../lib/api";
import type { PartyScorecard, KoersvastheidResponse, CoalitieverwateringResponse, CoalitionAlignmentResult, VrijeStemmenResult } from "../../../../../lib/types";
import { getPartyColor, themeLabel } from "../../../../../lib/utils";
import Breadcrumbs from "../../../../../components/Breadcrumbs";
import VoteBar from "../../../../../components/VoteBar";
import { routes } from "../../../../../lib/routes";
import MethodologyLink from "../../../../../components/MethodologyLink";
import PeriodSelector from "../../../../../components/PeriodSelector";
import Term from "../../../../../components/Term";
import PartyAvatar from "../../../../../components/PartyAvatar";
import MemberPhoto from "../../../../../components/MemberPhoto";
import { getCoalitionsForParty, COALITIONS } from "../../../../../lib/coalitions";
import type { Coalition } from "../../../../../lib/coalitions";
import PartyBadge from "../../../../../components/PartyBadge";
import ConfidenceBadge from "../../../../../components/ConfidenceBadge";
import PromiseSearchList from "../../../../../components/PromiseSearchList";
import { getScoreConfidence } from "../../../../../lib/scoring";

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const party = await getParty(params.id);
    return {
      title: `${party.abbreviation} — CivicStat`,
      description: `Belofteconsistentie en stemgedrag van ${party.abbreviation} (${party.name}) in de Tweede Kamer.`,
      openGraph: {
        title: `${party.abbreviation} — CivicStat`,
        description: `Belofteconsistentie en stemgedrag van ${party.abbreviation} in de Tweede Kamer.`,
      },
    };
  } catch {
    return { title: "Partij — CivicStat" };
  }
}

export default async function PartyDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  let party;
  try {
    party = await getParty(params.id);
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <Link href={routes.tk.partijen} className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-ink mb-5">
          <svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Terug naar partijen
        </Link>
        <div className="card p-6 text-sm text-text-secondary">Kon deze partij niet laden.</div>
      </div>
    );
  }

  // Determine selected period (default: 2023)
  const jaarParam = typeof searchParams.jaar === "string" ? parseInt(searchParams.jaar) : 2023;
  const activeYear = [2023, 2025].includes(jaarParam) ? jaarParam : 2023;
  const availableYears = [2023, 2025];

  let scorecard: PartyScorecard | null = null;
  try {
    scorecard = await getPartyScorecard(params.id, { year: activeYear });
  } catch {
    // Party has no promises — don't show scorecard section
  }

  // Fetch the OTHER year's scorecard too (for comparison)
  const otherYear = activeYear === 2023 ? 2025 : 2023;
  let otherScorecard: PartyScorecard | null = null;
  try {
    otherScorecard = await getPartyScorecard(params.id, { year: otherYear });
  } catch {}

  // Fetch koersvastheid for comparison
  let koersvastheid: KoersvastheidResponse | null = null;
  try {
    koersvastheid = await getKoersvastheid(params.id);
  } catch {
    // Not available yet
  }

  // Fetch regeerakkoord data for coalition parties
  const coalitions = getCoalitionsForParty(party.abbreviation);
  let coalitionData: { coalition: Coalition; regeerakkoord: PartyScorecard | null; verwatering: CoalitieverwateringResponse | null }[] = [];

  if (coalitions.length > 0) {
    coalitionData = await Promise.all(
      coalitions.map(async (c) => {
        const [regeerakkoord, verwatering] = await Promise.all([
          getRegeerakkoordScorecard(params.id, { year: c.year }),
          getCoalitieverwatering(params.id, { year: c.year }),
        ]);
        return { coalition: c, regeerakkoord, verwatering };
      }),
    );
  }

  // Fetch coalition dynamics data (CAI + Vrije Stemmen MCS)
  let coalitionAlignment: CoalitionAlignmentResult | null = null;
  let vrijeStemmen: VrijeStemmenResult | null = null;

  if (coalitions.length > 0) {
    const latestCoalition = coalitions[coalitions.length - 1];
    const coalitionSlug = latestCoalition.name.toLowerCase().includes("schoof") ? "schoof" : "jetten";
    [coalitionAlignment, vrijeStemmen] = await Promise.all([
      getPartyCoalitionAlignment(params.id, coalitionSlug),
      getPartyVrijeStemmen(params.id, activeYear, coalitionSlug),
    ]);
  }

  // Fetch all parties for prev/next navigation
  let allParties: { abbreviation: string; id: string; seats: number }[] = [];
  try {
    const pList = await getParties();
    allParties = pList
      .filter((p) => p.seats > 0)
      .sort((a, b) => b.seats - a.seats);
  } catch {}

  const currentIdx = allParties.findIndex(
    (p) => p.abbreviation.toLowerCase() === params.id.toLowerCase() || p.id === params.id
  );
  const prevParty = currentIdx > 0 ? allParties[currentIdx - 1] : null;
  const nextParty = currentIdx >= 0 && currentIdx < allParties.length - 1 ? allParties[currentIdx + 1] : null;

  const color = getPartyColor(party.abbreviation, party.colorNeutral);
  const seats = party.seats ?? 0;
  const activeMps = party.mps?.filter((m: any) => !m.endDate) || [];
  const vs = party.voteStats;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Breadcrumbs + prev/next */}
      <div className="flex items-center justify-between mb-6">
        <Breadcrumbs items={[
          { label: "Tweede Kamer", href: routes.tk.root },
          { label: "Partijen", href: routes.tk.partijen },
          { label: party.abbreviation },
        ]} />
        <div className="flex items-center gap-2">
          {prevParty ? (
            <Link
              href={routes.tk.partij(prevParty.abbreviation)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:bg-surface-sub transition-colors"
            >
              <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
              {prevParty.abbreviation}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-[12px] text-text-tertiary opacity-40">
              <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            </span>
          )}
          {nextParty ? (
            <Link
              href={routes.tk.partij(nextParty.abbreviation)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:bg-surface-sub transition-colors"
            >
              {nextParty.abbreviation}
              <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-[12px] text-text-tertiary opacity-40">
              <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <PartyAvatar abbreviation={party.abbreviation} color={color} size="md" showColor />
        <div>
          <h1 className="font-serif text-[clamp(26px,4vw,34px)] text-ink leading-tight">
            {party.abbreviation}
          </h1>
          <p className="text-sm text-text-secondary mt-1">{party.name}</p>
          {coalitions.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {coalitions.map((c) => (
                <span key={c.year} className="text-[10px] px-2 py-0.5 rounded-full border border-border text-text-tertiary">
                  Coalitie {c.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {seats > 0 && (
          <div className="card p-4">
            <div className="section-label">Zetels</div>
            <div className="text-2xl font-serif text-ink">{seats}</div>
          </div>
        )}
        <div className="card p-4">
          <div className="section-label">Actieve leden</div>
          <div className="text-2xl font-serif text-ink">{activeMps.length}</div>
        </div>
        {vs && vs.totalVotes > 0 && (
          <>
            <div className="card p-4">
              <div className="section-label">Stemmingen</div>
              <div className="text-2xl font-serif text-ink">{vs.totalVotes}</div>
            </div>
            <div className="card p-4">
              <div className="section-label">{vs.winLabel || "Winnende kant"}</div>
              <div className="text-2xl font-serif text-ink">
                {vs.votesWon != null ? `${Math.round((vs.votesWon / vs.totalVotes) * 100)}%` : "–"}
              </div>
            </div>
            {vs.motionEffectiveness != null && (
              <div className="card p-4">
                <div className="section-label">Motie-effectiviteit</div>
                <div className="text-2xl font-serif text-ink">{vs.motionEffectiveness}%</div>
              </div>
            )}
          </>
        )}
        {party.startDate && (
          <div className="card p-4">
            <div className="section-label">Opgericht</div>
            <div className="text-lg font-serif text-ink">{new Date(party.startDate).getFullYear()}</div>
          </div>
        )}
      </div>

      {/* Period comparison overview — only when both periods have data */}
      {scorecard && scorecard.scoredPromises > 0 && otherScorecard && otherScorecard.scoredPromises > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">Vergelijking verkiezingsperiodes</h2>
          <div className="card p-5">
            <div className="grid grid-cols-2 gap-6 mb-5">
              {[
                activeYear === 2023 ? scorecard : otherScorecard,
                activeYear === 2025 ? scorecard : otherScorecard,
              ].map((sc, i) => {
                const year = i === 0 ? 2023 : 2025;
                const isActive = year === activeYear;
                return (
                  <div key={year} className={`text-center ${isActive ? "" : "opacity-60"}`}>
                    <div className="text-[11px] font-medium text-text-tertiary mb-2">TK{year}</div>
                    <div className="text-[36px] font-serif text-ink leading-none">
                      {sc.mandateConsistencyScore}
                    </div>
                    <div className="text-[11px] text-text-tertiary mt-1">
                      {sc.scoredPromises}/{sc.totalPromises} beloften
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden gap-px mt-3 mx-auto max-w-[120px]">
                      {sc.consistentCount > 0 && <div className="bg-ink/30" style={{ flex: sc.consistentCount }} />}
                      {sc.mixedCount > 0 && <div className="bg-ink/12" style={{ flex: sc.mixedCount }} />}
                      {sc.inconsistentCount > 0 && <div className="bg-ink/4 border border-border/50" style={{ flex: sc.inconsistentCount }} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {(() => {
              const sc2023 = activeYear === 2023 ? scorecard : otherScorecard;
              const sc2025 = activeYear === 2025 ? scorecard : otherScorecard;
              const delta = sc2025!.mandateConsistencyScore - sc2023!.mandateConsistencyScore;
              return (
                <div className="flex items-center justify-center gap-2 py-3 border-t border-border">
                  <span className="text-[12px] text-text-tertiary">Verschil:</span>
                  <span className={`text-sm font-semibold ${
                    delta > 0 ? "text-ink" : delta < 0 ? "text-text-tertiary" : "text-text-secondary"
                  }`}>
                    {delta > 0 ? "+" : ""}{delta} punt{Math.abs(delta) !== 1 ? "en" : ""}
                  </span>
                  <span className="text-[12px] text-text-tertiary">
                    {delta > 5 ? "(consistenter geworden)" :
                     delta < -5 ? "(minder consistent)" :
                     "(stabiel)"}
                  </span>
                </div>
              );
            })()}

            {koersvastheid && koersvastheid.koersvastheid !== null && (
              <div className="flex items-center justify-center gap-2 pt-2 text-[12px] text-text-tertiary">
                Koersvastheid: <span className="font-semibold text-ink">{Math.round(koersvastheid.koersvastheid)}%</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Voting pattern */}
      {vs && vs.totalVotes > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">Stempatroon</h2>
          <div className="card p-5">
            <VoteBar voor={vs.for} tegen={vs.against} afwezig={vs.abstain || 0} height={12} showLabels />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-sm">
              <div>
                <span className="text-text-tertiary text-xs">Voor</span>
                <div className="text-ink font-semibold">{vs.for} ({Math.round((vs.for / vs.totalVotes) * 100)}%)</div>
              </div>
              <div>
                <span className="text-text-tertiary text-xs">Tegen</span>
                <div className="text-ink font-semibold">{vs.against} ({Math.round((vs.against / vs.totalVotes) * 100)}%)</div>
              </div>
              <div>
                <span className="text-text-tertiary text-xs">Onthouden</span>
                <div className="text-ink font-semibold">{vs.abstain || 0}</div>
              </div>
              {vs.votesWon != null && (
                <div>
                  <span className="text-text-tertiary text-xs">{vs.winLabel || "Winnende kant"}</span>
                  <div className="text-ink font-semibold">{vs.votesWon} van {vs.totalVotes}</div>
                </div>
              )}
              {vs.motionEffectiveness != null && (
                <div>
                  <span className="text-text-tertiary text-xs">Motie-effectiviteit</span>
                  <div className="text-ink font-semibold">{vs.motionEffectiveness}%</div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Mandate consistency scorecard */}
      {scorecard && scorecard.scoredPromises > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-ink">Belofteconsistentie</h2>
            <Suspense fallback={null}>
              <PeriodSelector years={availableYears} activeYear={activeYear} />
            </Suspense>
          </div>

          <div className="card p-5 mb-4">
            {/* Big score + summary */}
            <div className="flex items-start gap-6 mb-5">
              <div className="text-center shrink-0">
                <div className="text-[42px] font-serif text-ink leading-none">
                  {scorecard.mandateConsistencyScore}
                </div>
                <div className="text-[11px] text-text-tertiary mt-1">van 100</div>
                <div className={`text-[10px] mt-1.5 font-medium ${
                  scorecard.mandateConsistencyScore >= 70
                    ? "text-ink"
                    : scorecard.mandateConsistencyScore >= 40
                      ? "text-text-secondary"
                      : "text-text-tertiary"
                }`}>
                  {scorecard.mandateConsistencyScore >= 70
                    ? "Hoog"
                    : scorecard.mandateConsistencyScore >= 40
                      ? "Gemiddeld"
                      : "Laag"}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <ConfidenceBadge scored={scorecard.scoredPromises} total={scorecard.totalPromises} />
                </div>
                <div className="text-sm text-text-secondary mb-3">
                  {scorecard.note || `Score gebaseerd op ${scorecard.scoredPromises} van ${scorecard.totalPromises} beloften met voldoende stemdata`}
                  {(scorecard.insufficientDataPromises ?? 0) > 0 && (
                    <span className="text-text-tertiary">
                      {" "}({scorecard.insufficientDataPromises} beloften: onvoldoende data)
                    </span>
                  )}
                </div>
                {/* Consistency bar */}
                <div className="flex h-3 rounded-md overflow-hidden gap-px">
                  {scorecard.consistentCount > 0 && (
                    <div
                      className="bg-ink/30 dark:bg-white/30"
                      style={{ flex: scorecard.consistentCount }}
                      title={`Consistent: ${scorecard.consistentCount}`}
                    />
                  )}
                  {scorecard.mixedCount > 0 && (
                    <div
                      className="bg-ink/12 dark:bg-white/12"
                      style={{ flex: scorecard.mixedCount }}
                      title={`Wisselend: ${scorecard.mixedCount}`}
                    />
                  )}
                  {scorecard.inconsistentCount > 0 && (
                    <div
                      className="bg-ink/4 dark:bg-white/4 border border-border/50"
                      style={{ flex: scorecard.inconsistentCount }}
                      title={`Afwijkend: ${scorecard.inconsistentCount}`}
                    />
                  )}
                </div>
                <div className="flex gap-4 mt-2 text-[11px] text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-ink/30 dark:bg-white/30" />
                    <Term definition="Het stemgedrag komt in ≥70% van de gerelateerde moties overeen met de belofte.">Consistent</Term> ({scorecard.consistentCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-ink/12 dark:bg-white/12" />
                    <Term definition="Het stemgedrag komt in 40-70% van de gerelateerde moties overeen met de belofte.">Wisselend</Term> ({scorecard.mixedCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-ink/4 dark:bg-white/4 border border-border/50" />
                    <Term definition="Het stemgedrag wijkt in >60% van de gerelateerde moties af van de belofte.">Afwijkend</Term> ({scorecard.inconsistentCount})
                  </span>
                </div>
              </div>
            </div>

            {/* Theme breakdown */}
            {Object.keys(scorecard.byTheme).length > 0 && (
              <div className="border-t border-border pt-4 mb-4">
                <div className="section-label mb-3">Per thema</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(scorecard.byTheme)
                    .sort(([, a], [, b]) => b.total - a.total)
                    .map(([theme, data]) => (
                      <div key={theme} className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-surface-sub/40">
                        <span className="text-[12px] text-ink truncate">{themeLabel(theme)}</span>
                        <span className="text-[11px] text-text-tertiary whitespace-nowrap">
                          {data.consistent}/{data.total}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Promise list — searchable */}
            {scorecard.promises && scorecard.promises.length > 0 && (
              <PromiseSearchList promises={scorecard.promises} />
            )}

            {/* Methodology disclaimer */}
            <div className="border-t border-border pt-3 mt-4">
              <p className="text-[11px] text-text-tertiary leading-relaxed mb-3 max-w-lg">
                Deze scores zijn gebaseerd op openbare parlementaire bronnen en geautomatiseerde tekstanalyse.
                Elke methodologische keuze (drempelwaarden, gewichten, matchcriteria) is een normatieve keuze.
                Scores van coalitie- en oppositiepartijen zijn niet direct vergelijkbaar.
              </p>
              <details className="text-xs text-text-tertiary">
                <summary className="cursor-pointer hover:text-text-secondary underline underline-offset-2">
                  Methodologie
                </summary>
                <p className="mt-2 max-w-lg leading-relaxed">
                  De consistentiescore is gebaseerd op de gewogen verhouding tussen stemgedrag en
                  verkiezingsbeloften. Per belofte wordt gekeken of de partij in de verwachte richting
                  stemde bij gerelateerde moties. Het gewicht van elke motie-koppeling is afhankelijk van
                  het matchtype (direct=1.0, impliciet=0.5) en de betrouwbaarheidsscore.
                  Score: consistent ({"\u2265"}70%), wisselend (30-70%), afwijkend ({"\u2264"}30%).
                  Beloften met minder dan 3 gerelateerde moties krijgen geen score.
                  Moties worden gekoppeld via trefwoordanalyse (keyword-overlap-v2).
                </p>
              </details>
              <MethodologyLink />
            </div>
          </div>
        </section>
      )}

      {/* No-promises info */}
      {(!scorecard || scorecard.scoredPromises === 0) && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-ink">Belofteconsistentie</h2>
            <Suspense fallback={null}>
              <PeriodSelector years={availableYears} activeYear={activeYear} />
            </Suspense>
          </div>
          <div className="card px-5 py-6 text-center">
            <p className="text-sm text-text-secondary">
              Voor {party.abbreviation} zijn nog geen beloften geanalyseerd voor TK{activeYear}.
            </p>
            <p className="text-xs text-text-tertiary mt-2">
              Zodra beloften zijn geëxtraheerd en gekoppeld aan moties, verschijnt hier de consistentiescore.
            </p>
          </div>
        </section>
      )}

      {/* Koersvastheid (cross-period comparison) */}
      {koersvastheid && koersvastheid.koersvastheid !== null && koersvastheid.periods.length >= 2 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">Koersvastheid</h2>
          <div className="card p-5">
            <div className="flex items-start gap-6 mb-4">
              <div className="text-center shrink-0">
                <div className="text-[42px] font-serif text-ink leading-none">
                  {Math.round(koersvastheid.koersvastheid)}
                </div>
                <div className="text-[11px] text-text-tertiary mt-1">van 100</div>
                <div className={`text-[10px] mt-1.5 font-medium ${
                  koersvastheid.koersvastheid >= 70
                    ? "text-ink"
                    : koersvastheid.koersvastheid >= 40
                      ? "text-text-secondary"
                      : "text-text-tertiary"
                }`}>
                  {koersvastheid.koersvastheid >= 80
                    ? "Zeer stabiel"
                    : koersvastheid.koersvastheid >= 60
                      ? "Stabiel"
                      : koersvastheid.koersvastheid >= 40
                        ? "Wisselend"
                        : "Instabiel"}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-secondary mb-3">
                  <Term definition="Koersvastheid meet hoe consistent een partij scoort over meerdere verkiezingsperiodes. 100 = identieke score, 0 = maximaal verschil.">
                    Koersvastheid
                  </Term>{" "}
                  vergelijkt de belofteconsistentie van {party.abbreviation} over meerdere verkiezingsperiodes.
                </p>
                {/* Period scores */}
                <div className="flex gap-3">
                  {koersvastheid.periods.map((p) => (
                    <div key={p.electionYear} className="flex items-center gap-2 px-3 py-2 rounded-md bg-surface-sub/40">
                      <span className="text-[12px] font-medium text-ink">TK{p.electionYear}</span>
                      <span className="text-[18px] font-serif text-ink">{p.mandateConsistencyScore}</span>
                      <span className="text-[11px] text-text-tertiary">/ 100</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme stability breakdown */}
            {Object.keys(koersvastheid.themeStability).length > 0 && (
              <div className="border-t border-border pt-4">
                <div className="section-label mb-3">Stabiliteit per thema</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(koersvastheid.themeStability)
                    .sort(([, a], [, b]) => b - a)
                    .map(([theme, stability]) => (
                      <div key={theme} className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-surface-sub/40">
                        <span className="text-[12px] text-ink truncate">{themeLabel(theme)}</span>
                        <span className={`text-[11px] font-medium ${
                          stability >= 80 ? "text-ink" : stability >= 50 ? "text-text-secondary" : "text-text-tertiary"
                        }`}>
                          {Math.round(stability)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-3 mt-4">
              <p className="text-[11px] text-text-tertiary">
                Periodevergelijking: richting-gecorrigeerde stabiliteitsscore.
                Verbetering wordt niet bestraft, verslechtering wel. Een hoge score betekent stabiel en consistent stemgedrag.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Coalition Dynamics — CAI + Vrije Stemmen MCS */}
      {(coalitionAlignment || vrijeStemmen) && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">Coalitiedynamiek</h2>
          <div className="card p-5">
            {/* CAI gauge */}
            {coalitionAlignment && coalitionAlignment.totalVotesAnalyzed > 0 && (
              <div className="mb-5">
                <div className="section-label mb-3">
                  <Term definition="De Coalitie Alignment Index (CAI) meet hoe vaak deze partij stemt in lijn met de coalitie-meerderheid. 100 = altijd mee, 0 = altijd tegen.">
                    Coalitie Alignment Index
                  </Term>
                  {" "}<span className="text-text-tertiary font-normal">· {coalitionAlignment.coalitionName}</span>
                </div>
                <div className="flex items-start gap-6">
                  <div className="text-center shrink-0">
                    <div className="text-[42px] font-serif text-ink leading-none">
                      {coalitionAlignment.cai}
                    </div>
                    <div className="text-[11px] text-text-tertiary mt-1">van 100</div>
                    <div className={`text-[10px] mt-1.5 font-medium ${
                      coalitionAlignment.cai >= 80
                        ? "text-ink"
                        : coalitionAlignment.cai >= 60
                          ? "text-text-secondary"
                          : "text-text-tertiary"
                    }`}>
                      {coalitionAlignment.cai >= 80
                        ? "Hoge afstemming"
                        : coalitionAlignment.cai >= 60
                          ? "Gemiddeld"
                          : "Afwijkend"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary mb-3">
                      {party.abbreviation} stemde in <strong>{coalitionAlignment.cai}%</strong> van de{" "}
                      {coalitionAlignment.totalVotesAnalyzed.toLocaleString("nl-NL")} stemmingen mee met de coalitie-meerderheid
                      {coalitionAlignment.isCoalitionMember ? " (als coalitiepartij)" : " (als oppositiepartij)"}.
                    </p>
                    {/* CAI bar */}
                    <div className="h-3 rounded-md overflow-hidden bg-ink/4 dark:bg-white/4">
                      <div
                        className="h-full bg-ink/25 dark:bg-white/25 rounded-md transition-all"
                        style={{ width: `${coalitionAlignment.cai}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 text-[11px] text-text-tertiary">
                      <span>{coalitionAlignment.alignedWithCoalition.toLocaleString("nl-NL")} aligned</span>
                      <span>{coalitionAlignment.periodStart} – {coalitionAlignment.periodEnd}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Vrije Stemmen MCS comparison */}
            {vrijeStemmen && vrijeStemmen.scoredPromises > 0 && (
              <div className={coalitionAlignment && coalitionAlignment.totalVotesAnalyzed > 0 ? "border-t border-border pt-5" : ""}>
                <div className="section-label mb-3">
                  <Term definition="De Vrije Stemmen MCS meet de belofteconsistentie alleen op basis van 'vrije stemmen' — stemmingen waarbij de coalitie niet unaniem was. Dit onthult of consistentie echt is of door coalitiediscipline komt.">
                    Vrije Stemmen MCS
                  </Term>
                </div>
                <div className="flex items-start gap-6">
                  <div className="text-center shrink-0 space-y-3">
                    <div>
                      <div className="text-[11px] text-text-tertiary mb-0.5">Standaard</div>
                      <div className="text-[28px] font-serif text-ink leading-none">
                        {vrijeStemmen.totalMCS}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-tertiary mb-0.5">Vrije stemmen</div>
                      <div className="text-[28px] font-serif text-ink leading-none">
                        {vrijeStemmen.vrijeStemmenMCS}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Visual comparison bars */}
                    <div className="space-y-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] text-text-tertiary w-[90px]">MCS standaard</span>
                          <div className="flex-1 h-3 rounded-md overflow-hidden bg-ink/4 dark:bg-white/4">
                            <div className="h-full bg-ink/25 dark:bg-white/25 rounded-md" style={{ width: `${vrijeStemmen.totalMCS}%` }} />
                          </div>
                          <span className="text-[12px] font-medium text-ink w-[30px] text-right">{vrijeStemmen.totalMCS}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] text-text-tertiary w-[90px]">Vrije stemmen</span>
                          <div className="flex-1 h-3 rounded-md overflow-hidden bg-ink/4 dark:bg-white/4">
                            <div className="h-full bg-ink/15 dark:bg-white/15 rounded-md" style={{ width: `${vrijeStemmen.vrijeStemmenMCS}%` }} />
                          </div>
                          <span className="text-[12px] font-medium text-ink w-[30px] text-right">{vrijeStemmen.vrijeStemmenMCS}</span>
                        </div>
                      </div>
                    </div>

                    {/* Insight text */}
                    {vrijeStemmen.delta > 5 ? (
                      <p className="text-sm text-text-secondary">
                        De MCS van {party.abbreviation} daalt met <strong>{vrijeStemmen.delta} punten</strong> zonder
                        coalitiestemmen. Dit suggereert dat een deel van de consistentie voortkomt uit coalitiediscipline.
                      </p>
                    ) : vrijeStemmen.delta < -5 ? (
                      <p className="text-sm text-text-secondary">
                        De MCS van {party.abbreviation} stijgt met <strong>{Math.abs(vrijeStemmen.delta)} punten</strong> bij
                        alleen vrije stemmen. De partij is consistenter wanneer coalitiediscipline geen rol speelt.
                      </p>
                    ) : (
                      <p className="text-sm text-text-secondary">
                        Het verschil is minimaal ({vrijeStemmen.delta > 0 ? "+" : ""}{vrijeStemmen.delta} punten).
                        De consistentie van {party.abbreviation} is grotendeels onafhankelijk van coalitiediscipline.
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex gap-4 mt-3 text-[11px] text-text-tertiary">
                      <span>{vrijeStemmen.freeVoteCount} vrije stemmen</span>
                      <span>{vrijeStemmen.coalitionVoteCount} coalitiestemmen</span>
                      <span>{vrijeStemmen.totalVoteCount} totaal</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Methodology */}
            <div className="border-t border-border pt-3 mt-4">
              <details className="text-xs text-text-tertiary">
                <summary className="cursor-pointer hover:text-text-secondary underline underline-offset-2">
                  Methodologie
                </summary>
                <p className="mt-2 max-w-lg leading-relaxed">
                  <strong>CAI:</strong> Per stemming wordt de coalitie-meerderheidspositie bepaald.
                  De CAI is het percentage stemmingen waarin de partij dezelfde positie inneemt.
                  <br /><br />
                  <strong>Vrije Stemmen MCS:</strong> Alle stemmingen worden geclassificeerd als
                  &ldquo;coalitiestem&rdquo; (alle coalitiepartijen stemmen gelijk) of &ldquo;vrije stem&rdquo;
                  (minstens één coalitiepartij wijkt af). De Vrije Stemmen MCS berekent de belofteconsistentie
                  alleen op basis van vrije stemmen.
                </p>
              </details>
            </div>
          </div>
        </section>
      )}

      {/* Regeerakkoord + Coalitieverwatering — per coalition */}
      {coalitionData.map(({ coalition, regeerakkoord: regSc, verwatering: cv }) => {
        if (!regSc && !cv) return null;
        const coalitionParties = COALITIONS.find(c => c.year === coalition.year)?.parties ?? [];
        return (
          <section key={`coalition-${coalition.year}`} className="mb-8">
            {/* Section header */}
            <div className="mb-4">
              <h2 className="font-serif text-xl text-ink">
                Regeerakkoord {"\u00B7"} {coalition.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-[12px] text-text-tertiary italic">{coalition.subtitle}</span>
                <span className="text-text-tertiary text-[10px]">{"\u00B7"}</span>
                {coalitionParties.map((abbr) => (
                  <PartyBadge key={abbr} abbreviation={abbr} colorNeutral={null} size="sm" />
                ))}
              </div>
              <p className="text-[13px] text-text-secondary mt-1.5">
                Hoe consistent stemt {party.abbreviation} met het regeerakkoord?
              </p>
            </div>

            {/* Regeerakkoord-consistentie card */}
            {regSc && regSc.scoredPromises > 0 ? (
              <div className="card p-5 mb-4">
                <div className="section-label mb-3">Regeerakkoord-consistentie</div>
                <div className="flex items-start gap-6 mb-4">
                  <div className="text-center shrink-0">
                    <div className="text-[42px] font-serif text-ink leading-none">
                      {regSc.mandateConsistencyScore}
                    </div>
                    <div className="text-[11px] text-text-tertiary mt-1">van 100</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary mb-3">
                      {regSc.scoredPromises} van {regSc.totalPromises} akkoordpunten consistent vertaald in stemgedrag.
                      {(regSc.insufficientDataPromises ?? 0) > 0 && (
                        <span className="text-text-tertiary">
                          {" "}({regSc.insufficientDataPromises} met onvoldoende data)
                        </span>
                      )}
                    </p>
                    <div className="flex h-3 rounded-md overflow-hidden gap-px">
                      {regSc.consistentCount > 0 && (
                        <div className="bg-ink/30" style={{ flex: regSc.consistentCount }} title={`Consistent: ${regSc.consistentCount}`} />
                      )}
                      {regSc.mixedCount > 0 && (
                        <div className="bg-ink/12" style={{ flex: regSc.mixedCount }} title={`Wisselend: ${regSc.mixedCount}`} />
                      )}
                      {regSc.inconsistentCount > 0 && (
                        <div className="bg-ink/4 border border-border/50" style={{ flex: regSc.inconsistentCount }} title={`Afwijkend: ${regSc.inconsistentCount}`} />
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-[11px] text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-ink/30" />
                        Consistent ({regSc.consistentCount})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-ink/12" />
                        Wisselend ({regSc.mixedCount})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-ink/4 border border-border/50" />
                        Afwijkend ({regSc.inconsistentCount})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-[11px] text-text-tertiary">
                    Het regeerakkoord bevat afspraken tussen coalitiepartijen.
                    Deze score meet of {party.abbreviation} stemt in lijn met die afspraken.
                  </p>
                </div>
              </div>
            ) : regSc ? (
              <div className="card px-5 py-4 mb-4">
                <div className="flex items-center gap-2 text-[13px] text-text-tertiary italic">
                  <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  Akkoordpunten worden momenteel gekoppeld aan moties. Data volgt binnenkort.
                </div>
              </div>
            ) : null}

            {/* Coalitieverwatering card */}
            {cv && cv.totalPartyPromises > 0 && (
              <div className="card p-5">
                <div className="section-label mb-3">
                  <Term definition="Welk deel van de partijbeloften overleefde de coalitieonderhandelingen?">
                    Coalitieverwatering
                  </Term>
                </div>
                <div className="flex items-start gap-6 mb-4">
                  <div className="text-center shrink-0">
                    <div className="text-[42px] font-serif text-ink leading-none">
                      {Math.round(cv.dilutionRate)}%
                    </div>
                    <div className="text-[11px] text-text-tertiary mt-1">verwatering</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary mb-3">
                      Van de {cv.totalPartyPromises} verkiezingsbeloften van {party.abbreviation} zijn
                      er {cv.survivedCount} herkenbaar terug te vinden in het regeerakkoord.
                      {cv.dilutedCount > 0 && ` ${cv.dilutedCount} beloften zijn niet overgenomen.`}
                    </p>
                    <div className="flex h-3 rounded-md overflow-hidden gap-px">
                      {cv.survivedCount > 0 && (
                        <div className="bg-ink/30" style={{ flex: cv.survivedCount }} title={`Overgenomen: ${cv.survivedCount}`} />
                      )}
                      {cv.dilutedCount > 0 && (
                        <div className="bg-ink/4 border border-border/50" style={{ flex: cv.dilutedCount }} title={`Niet overgenomen: ${cv.dilutedCount}`} />
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-[11px] text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-ink/30" />
                        Overgenomen ({cv.survivedCount})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-ink/4 border border-border/50" />
                        Niet overgenomen ({cv.dilutedCount})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-[11px] text-text-tertiary">
                    De verwateringsscore is gebaseerd op trefwoordoverlap tussen partijprogramma en regeerakkoord.
                  </p>
                </div>
              </div>
            )}
          </section>
        );
      })}

      {/* Fractieleden photo grid */}
      {activeMps.length > 0 && (
        <section>
          <h2 className="font-serif text-xl text-ink mb-4">Fractieleden ({activeMps.length})</h2>
          <div className="flex flex-wrap gap-3.5">
            {activeMps.sort((a: any, b: any) => a.surname.localeCompare(b.surname)).map((mp: any) => (
              <Link
                key={mp.id}
                href={routes.tk.kamerlid(mp.id)}
                className="flex flex-col items-center gap-1.5 w-[68px] group"
              >
                <MemberPhoto tkId={mp.tkId} name={mp.name} size="md" color={color} />
                <span className="text-[11px] text-text-secondary text-center truncate max-w-[68px] group-hover:text-ink transition-colors">
                  {mp.surname}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


